import { Prisma, type PaymentMethod } from "@prisma/client";
import { env } from "../config/env";
import type { SkylineDb } from "../lib/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from "../lib/errors";
import { serializeMembership, serializePayment } from "../lib/serialize";
import { getLatestMembership, getUserById } from "./users";

function utcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function parseDuesAmount(): Prisma.Decimal {
  const raw = env.membershipDuesAmount;
  if (!raw) {
    throw new ServiceUnavailableError(
      "Membership dues are not configured. Set MEMBERSHIP_DUES_AMOUNT."
    );
  }
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new ServiceUnavailableError(
      "MEMBERSHIP_DUES_AMOUNT must be a positive amount with up to two decimal places"
    );
  }
  const amount = new Prisma.Decimal(raw);
  if (amount.lte(0)) {
    throw new ServiceUnavailableError("MEMBERSHIP_DUES_AMOUNT must be greater than 0");
  }
  return amount;
}

export async function renewMembership(
  db: SkylineDb,
  userId: string,
  method: PaymentMethod
) {
  const user = await getUserById(db, userId);
  if (!user) {
    throw new NotFoundError("No application user is linked to this identity");
  }

  const duesAmount = parseDuesAmount();
  const periodDays = env.membershipPeriodDays;

  try {
    return await db.$transaction(async (tx) => {
      const pending = await tx.membership.findFirst({
        where: { userId, status: "PENDING" },
      });
      if (pending) {
        throw new ConflictError(
          "A pending membership already exists for this user",
          { membershipId: pending.id }
        );
      }

      const latest = await getLatestMembership(tx, userId);
      const today = utcDateOnly(new Date());
      let startsOn = today;

      if (
        latest &&
        latest.status === "ACTIVE" &&
        utcDateOnly(latest.expiresOn) >= today
      ) {
        startsOn = addUtcDays(utcDateOnly(latest.expiresOn), 1);
      }

      const expiresOn = addUtcDays(startsOn, periodDays);
      if (expiresOn < startsOn) {
        throw new BadRequestError("Computed membership dates are invalid");
      }

      const startsOnKey = startsOn.toISOString().slice(0, 10);
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: duesAmount,
          currency: "INR",
          status: "PENDING",
          method,
          purpose: "MEMBERSHIP_DUES",
          externalRef: `membership-renew:${userId}:${startsOnKey}`,
          paidAt: null,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId,
          status: "PENDING",
          startsOn,
          expiresOn,
          duesAmount,
          paymentId: payment.id,
        },
      });

      return {
        membership: serializeMembership(membership),
        payment: serializePayment(payment),
        paymentNote:
          "Payment recorded as PENDING. No payment has been processed or confirmed.",
      };
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError(
        "A membership renewal for this period has already been recorded"
      );
    }
    throw err;
  }
}
