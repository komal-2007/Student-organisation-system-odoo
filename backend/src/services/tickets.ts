import { randomBytes, randomUUID } from "node:crypto";
import { Prisma, type PaymentMethod, type User } from "@prisma/client";
import type { SkylineDb } from "../lib/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/errors";
import {
  serializeEvent,
  serializePayment,
  serializeTicket,
} from "../lib/serialize";
import { countHeldTickets, HOLDING_TICKET_STATUSES } from "./events";
import { getCurrentActiveMembership } from "./users";

function newValidationCode(): string {
  return `tck_${randomBytes(18).toString("base64url")}`;
}

export async function purchaseTickets(
  db: SkylineDb,
  buyer: Pick<User, "id">,
  eventId: string,
  input: { method: PaymentMethod; quantity: number; idempotencyKey?: string }
) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new BadRequestError("quantity must be a positive integer");
  }

  try {
    return await db.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new NotFoundError("Event not found");
      }
      if (event.cancelledAt) {
        throw new BadRequestError("This event has been cancelled");
      }
      if (event.endsAt.getTime() < Date.now()) {
        throw new BadRequestError("This event has already ended");
      }

      const held = await countHeldTickets(tx as unknown as SkylineDb, eventId);
      if (held + input.quantity > event.capacity) {
        throw new ConflictError("Not enough remaining capacity for this purchase", {
          remaining: Math.max(0, event.capacity - held),
          requested: input.quantity,
        });
      }

      const membership = await getCurrentActiveMembership(
        tx as unknown as SkylineDb,
        buyer.id
      );
      const pricedAsMember = Boolean(membership);
      const unitPrice = pricedAsMember ? event.memberPrice : event.nonMemberPrice;
      const total = unitPrice.mul(input.quantity);

      let payment = null;
      if (total.gt(0)) {
        payment = await tx.payment.create({
          data: {
            userId: buyer.id,
            amount: total,
            currency: "INR",
            status: "PENDING",
            method: input.method,
            purpose: "EVENT_TICKET",
            externalRef: input.idempotencyKey
              ? `event-ticket:${input.idempotencyKey}`
              : `event-ticket:${buyer.id}:${eventId}:${randomUUID()}`,
            paidAt: null,
          },
        });
      }

      const tickets = [];
      for (let i = 0; i < input.quantity; i += 1) {
        const ticket = await tx.ticket.create({
          data: {
            eventId: event.id,
            userId: buyer.id,
            paymentId: payment?.id ?? null,
            status: payment ? "RESERVED" : "PAID",
            pricePaid: unitPrice,
            pricedAsMember,
            validationCode: newValidationCode(),
          },
        });
        tickets.push(ticket);
      }

      return {
        event: serializeEvent(event, {
          ticketsSold: held + input.quantity,
          pricedAsMember,
          yourPrice: unitPrice.toString(),
        }),
        tickets: tickets.map((ticket) => serializeTicket(ticket, event)),
        payment: payment ? serializePayment(payment) : null,
        paymentNote: payment
          ? "Payment recorded as PENDING. No payment has been processed or confirmed. Tickets remain RESERVED until the payment is completed."
          : "No payment record was created because the ticket price is zero.",
      };
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError(
        "This ticket purchase has already been recorded"
      );
    }
    throw err;
  }
}

export async function listMyTickets(db: SkylineDb, userId: string) {
  const tickets = await db.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];
  const events =
    eventIds.length === 0
      ? []
      : await db.event.findMany({
          where: { id: { in: eventIds } },
        });
  const eventsById = new Map(events.map((event) => [event.id, event]));
  return {
    tickets: tickets.map((ticket) =>
      serializeTicket(ticket, eventsById.get(ticket.eventId))
    ),
  };
}

export async function listEventTickets(db: SkylineDb, eventId: string) {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const tickets = await db.ticket.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
  const paymentIds = tickets
    .map((ticket) => ticket.paymentId)
    .filter((id): id is string => Boolean(id));
  const payments =
    paymentIds.length === 0
      ? []
      : await db.payment.findMany({
          where: { id: { in: paymentIds } },
        });
  const paymentsById = new Map(payments.map((payment) => [payment.id, payment]));

  let completedAmount = new Prisma.Decimal(0);
  let pendingAmount = new Prisma.Decimal(0);
  for (const ticket of tickets) {
    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      continue;
    }
    const payment = ticket.paymentId
      ? paymentsById.get(ticket.paymentId)
      : undefined;
    if (ticket.status === "RESERVED" || payment?.status === "PENDING") {
      pendingAmount = pendingAmount.add(ticket.pricePaid);
    } else {
      completedAmount = completedAmount.add(ticket.pricePaid);
    }
  }

  const ticketsSold = tickets.filter((ticket) =>
    (HOLDING_TICKET_STATUSES as readonly string[]).includes(ticket.status)
  ).length;
  const attendingCount = tickets.filter(
    (ticket) => ticket.status === "VALIDATED"
  ).length;

  return {
    event: serializeEvent(event, { ticketsSold }),
    tickets: tickets.map((ticket) => serializeTicket(ticket)),
    revenue: {
      currency: "INR",
      completedAmount: completedAmount.toString(),
      pendingAmount: pendingAmount.toString(),
      ticketCount: ticketsSold,
      attendingCount,
    },
  };
}

export async function validateTicket(
  db: SkylineDb,
  actor: Pick<User, "id">,
  eventId: string,
  validationCode: string
) {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const ticket = await db.ticket.findUnique({
    where: { validationCode },
  });
  if (!ticket || ticket.eventId !== eventId) {
    throw new NotFoundError("Ticket not found for this event");
  }

  if (ticket.status === "VALIDATED") {
    throw new ConflictError("Ticket has already been validated", {
      validatedAt: ticket.validatedAt,
    });
  }
  if (ticket.status !== "PAID") {
    throw new BadRequestError(
      `Only PAID tickets can be validated (current status: ${ticket.status})`
    );
  }

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: {
      status: "VALIDATED",
      validatedAt: new Date(),
      validatedById: actor.id,
    },
  });

  return {
    ticket: serializeTicket(updated, event),
    attendance: true,
  };
}
