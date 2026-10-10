import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import type { SkylineDb } from "../lib/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors";
import {
  amountToPaise,
  type RazorpayGateway,
  type RazorpayPayment,
  verifyCheckoutSignature,
} from "../lib/razorpay";
import { serializeMembership, serializePayment } from "../lib/serialize";

const RAZORPAY_ORDER_RE = /^order_/;

function purposeDescription(purpose: string, paymentId: string): string {
  switch (purpose) {
    case "MEMBERSHIP_DUES":
      return `Membership dues payment ${paymentId}`;
    case "EVENT_TICKET":
      return `Event ticket payment ${paymentId}`;
    case "MERCHANDISE":
      return `Merchandise payment ${paymentId}`;
    default:
      return `Payment ${paymentId}`;
  }
}

function assertAmountMatches(
  payment: { amount: Prisma.Decimal; currency: string },
  captured: { amount: number; currency: string }
) {
  const expectedPaise = amountToPaise(payment.amount);
  const currency = captured.currency.toUpperCase();
  if (currency !== payment.currency.toUpperCase() || currency !== "INR") {
    throw new BadRequestError("Payment currency does not match the recorded charge", {
      expected: payment.currency,
      received: captured.currency,
    });
  }
  if (captured.amount !== expectedPaise) {
    throw new BadRequestError("Payment amount does not match the recorded charge", {
      expectedPaise,
      receivedPaise: captured.amount,
    });
  }
}

async function fulfillCompletedPayment(db: SkylineDb, paymentId: string, paidAt: Date) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    const transition = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status: "COMPLETED",
        method: "ONLINE",
        paidAt,
      },
    });
    if (transition.count === 0) {
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      if (current?.status === "COMPLETED") {
        const existing = await tx.financialEntry.findFirst({
          where: { paymentId: current.id, type: "INCOME" },
        });
        return {
          alreadyProcessed: true,
          payment: current,
          financialEntryId: existing?.id ?? null,
        };
      }
      if (!current) {
        throw new NotFoundError("Payment not found");
      }
      throw new BadRequestError(
        `Payment cannot be completed from status ${current.status}`
      );
    }

    const updated = await tx.payment.findUnique({ where: { id: payment.id } });
    if (!updated) {
      throw new NotFoundError("Payment not found");
    }

    let financialEntryId: string | null = null;
    try {
      const entry = await tx.financialEntry.create({
        data: {
          type: "INCOME",
          amount: updated.amount,
          occurredAt: paidAt,
          description: purposeDescription(updated.purpose, updated.id),
          paymentId: updated.id,
        },
      });
      financialEntryId = entry.id;
    } catch (err) {
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
      ) {
        throw err;
      }
      const existing = await tx.financialEntry.findFirst({
        where: { paymentId: updated.id, type: "INCOME" },
      });
      financialEntryId = existing?.id ?? null;
    }

    if (updated.purpose === "MEMBERSHIP_DUES") {
      const membership = await tx.membership.findFirst({
        where: { paymentId: updated.id },
      });
      if (membership && membership.status === "PENDING") {
        await tx.membership.update({
          where: { id: membership.id },
          data: { status: "ACTIVE" },
        });
      }
    }

    if (updated.purpose === "EVENT_TICKET") {
      await tx.ticket.updateMany({
        where: { paymentId: updated.id, status: "RESERVED" },
        data: { status: "PAID" },
      });
    }

    if (updated.purpose === "MERCHANDISE") {
      const order = await tx.merchandiseOrder.findFirst({
        where: { paymentId: updated.id },
      });
      if (order && order.status === "PENDING") {
        await tx.merchandiseOrder.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
        const items = await tx.orderItem.findMany({
          where: { orderId: order.id },
        });
        for (const item of items) {
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              quantityDelta: -item.quantity,
              reason: "SALE",
              orderItemId: item.id,
              createdById: order.userId,
            },
          });
        }
      } else if (order) {
        throw new BadRequestError(
          `Merchandise order cannot be paid from status ${order.status}`
        );
      }
    }

    return { alreadyProcessed: false, payment: updated, financialEntryId };
  });
}

export async function createRazorpayOrderForPayment(
  db: SkylineDb,
  gateway: RazorpayGateway,
  actorId: string,
  paymentId: string
) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw new NotFoundError("Payment not found");
  }
  if (payment.userId !== actorId) {
    throw new ForbiddenError("You cannot pay for this record");
  }
  if (payment.status !== "PENDING") {
    throw new BadRequestError("Only pending payments can start a Razorpay checkout");
  }
  if (payment.amount.lte(0)) {
    throw new BadRequestError("This payment has no charge to collect");
  }
  if (payment.currency.toUpperCase() !== "INR") {
    throw new BadRequestError("Razorpay checkout is only enabled for INR");
  }

  if (payment.externalRef && RAZORPAY_ORDER_RE.test(payment.externalRef)) {
    return {
      payment: serializePayment(payment),
      razorpayOrder: {
        id: payment.externalRef,
        amount: amountToPaise(payment.amount),
        currency: payment.currency,
      },
      keyId: env.razorpayKeyId,
    };
  }

  const order = await gateway.createOrder({
    amountPaise: amountToPaise(payment.amount),
    currency: payment.currency,
    receipt: payment.id,
    notes: {
      skylinePaymentId: payment.id,
      purpose: payment.purpose,
    },
  });

  const updated = await db.payment.update({
    where: { id: payment.id },
    data: {
      externalRef: order.id,
      method: "ONLINE",
    },
  });

  return {
    payment: serializePayment(updated),
    razorpayOrder: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    keyId: env.razorpayKeyId,
  };
}

async function loadPaymentForRazorpayOrder(db: SkylineDb, orderId: string) {
  const payment = await db.payment.findFirst({
    where: { externalRef: orderId },
  });
  if (!payment) {
    throw new NotFoundError("No Skyline payment is linked to this Razorpay order");
  }
  return payment;
}

export async function verifyRazorpayCheckout(
  db: SkylineDb,
  gateway: RazorpayGateway,
  actorId: string,
  input: { orderId: string; paymentId: string; signature: string }
) {
  verifyCheckoutSignature(input);

  const payment = await loadPaymentForRazorpayOrder(db, input.orderId);
  if (payment.userId !== actorId) {
    throw new ForbiddenError("You cannot confirm this payment");
  }

  const captured = await gateway.fetchPayment(input.paymentId);
  if (captured.orderId !== input.orderId) {
    throw new BadRequestError("Razorpay payment does not belong to this order");
  }
  if (captured.status !== "captured" && captured.status !== "authorized") {
    throw new BadRequestError(`Razorpay payment is not successful (${captured.status})`);
  }
  assertAmountMatches(payment, captured);

  const result = await fulfillCompletedPayment(db, payment.id, new Date());
  return settlementResponse(db, result.payment.id, result.alreadyProcessed);
}

export async function markPaymentFailed(db: SkylineDb, paymentId: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    const transition = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
    if (transition.count === 0) {
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!current) {
        throw new NotFoundError("Payment not found");
      }
      return { payment: serializePayment(current), alreadyProcessed: true };
    }

    if (payment.purpose === "MERCHANDISE") {
      const transitionOrder = await tx.merchandiseOrder.updateMany({
        where: { paymentId: payment.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      if (transitionOrder.count > 0) {
        const order = await tx.merchandiseOrder.findFirst({
          where: { paymentId: payment.id },
        });
        if (order) {
          const items = await tx.orderItem.findMany({
            where: { orderId: order.id },
          });
          for (const item of items) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stockQty: { increment: item.quantity } },
            });
          }
        }
      }
    }

    const updated = await tx.payment.findUnique({ where: { id: payment.id } });
    if (!updated) {
      throw new NotFoundError("Payment not found");
    }
    return { payment: serializePayment(updated), alreadyProcessed: false };
  });
}

export async function applyRazorpayPaymentEntity(
  db: SkylineDb,
  captured: RazorpayPayment,
  eventType: string
) {
  const paymentIdFromNotes = captured.notes?.skylinePaymentId;
  const payment = paymentIdFromNotes
    ? await db.payment.findUnique({ where: { id: paymentIdFromNotes } })
    : await db.payment.findFirst({ where: { externalRef: captured.orderId } });

  if (!payment) {
    throw new NotFoundError("No Skyline payment is linked to this Razorpay event");
  }

  if (
    payment.externalRef &&
    RAZORPAY_ORDER_RE.test(payment.externalRef) &&
    payment.externalRef !== captured.orderId
  ) {
    throw new BadRequestError("Razorpay payment does not belong to this order");
  }

  if (eventType === "payment.failed") {
    return markPaymentFailed(db, payment.id);
  }

  assertAmountMatches(payment, captured);
  if (captured.status !== "captured" && captured.status !== "authorized") {
    throw new BadRequestError(`Razorpay payment is not successful (${captured.status})`);
  }

  const result = await fulfillCompletedPayment(db, payment.id, new Date());
  return settlementResponse(db, result.payment.id, result.alreadyProcessed);
}

async function settlementResponse(
  db: SkylineDb,
  paymentId: string,
  alreadyProcessed: boolean
) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw new NotFoundError("Payment not found");
  }
  const membership = await db.membership.findFirst({
    where: { paymentId: payment.id },
  });
  const tickets = await db.ticket.findMany({
    where: { paymentId: payment.id },
  });
  const order = await db.merchandiseOrder.findFirst({
    where: { paymentId: payment.id },
  });

  return {
    alreadyProcessed,
    payment: serializePayment(payment),
    membership: membership ? serializeMembership(membership) : null,
    ticketsUpdated: tickets.filter((ticket) => ticket.status === "PAID").length,
    merchandiseOrder: order
      ? { id: order.id, status: order.status, paymentId: order.paymentId }
      : null,
  };
}
