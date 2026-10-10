import { Prisma, type User } from "@prisma/client";
import type { SkylineDb } from "../lib/db";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { serializeEvent } from "../lib/serialize";
import { getCurrentActiveMembership } from "./users";

export const HOLDING_TICKET_STATUSES = [
  "RESERVED",
  "PAID",
  "VALIDATED",
] as const;

const moneyPattern = /^\d+(\.\d{1,2})?$/;

export type EventWriteInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  memberPrice: Prisma.Decimal;
  nonMemberPrice: Prisma.Decimal;
};

export function parseEventMoney(raw: string, field: string): Prisma.Decimal {
  if (!moneyPattern.test(raw)) {
    throw new BadRequestError(
      `${field} must be a non-negative amount with up to two decimal places`
    );
  }
  const amount = new Prisma.Decimal(raw);
  if (amount.lt(0)) {
    throw new BadRequestError(`${field} cannot be negative`);
  }
  return amount;
}

export function assertEventSchedule(startsAt: Date, endsAt: Date) {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new BadRequestError("Event start and end must be valid timestamps");
  }
  if (endsAt < startsAt) {
    throw new BadRequestError("Event end must be on or after start");
  }
}

export async function countHeldTickets(db: SkylineDb, eventId: string) {
  return db.ticket.count({
    where: {
      eventId,
      status: { in: [...HOLDING_TICKET_STATUSES] },
    },
  });
}

async function soldByEventId(db: SkylineDb, eventIds: string[]) {
  const sold = new Map<string, number>();
  if (eventIds.length === 0) {
    return sold;
  }
  const tickets = await db.ticket.findMany({
    where: {
      eventId: { in: eventIds },
      status: { in: [...HOLDING_TICKET_STATUSES] },
    },
  });
  for (const ticket of tickets) {
    sold.set(ticket.eventId, (sold.get(ticket.eventId) ?? 0) + 1);
  }
  return sold;
}

async function pricingForUser(db: SkylineDb, userId: string | undefined) {
  if (!userId) {
    return { pricedAsMember: false };
  }
  const membership = await getCurrentActiveMembership(db, userId);
  return { pricedAsMember: Boolean(membership) };
}

function withPricing(
  event: Parameters<typeof serializeEvent>[0],
  ticketsSold: number,
  pricedAsMember: boolean
) {
  const yourPrice = pricedAsMember ? event.memberPrice : event.nonMemberPrice;
  return serializeEvent(event, {
    ticketsSold,
    pricedAsMember,
    yourPrice: yourPrice.toString(),
  });
}

export async function listEvents(db: SkylineDb, userId?: string) {
  const events = await db.event.findMany({
    orderBy: { startsAt: "asc" },
  });
  const { pricedAsMember } = await pricingForUser(db, userId);
  const sold = await soldByEventId(
    db,
    events.map((event) => event.id)
  );
  return {
    events: events.map((event) =>
      withPricing(event, sold.get(event.id) ?? 0, pricedAsMember)
    ),
  };
}

export async function getEvent(db: SkylineDb, eventId: string, userId?: string) {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError("Event not found");
  }
  const { pricedAsMember } = await pricingForUser(db, userId);
  const ticketsSold = await countHeldTickets(db, eventId);
  return { event: withPricing(event, ticketsSold, pricedAsMember) };
}

export async function createEvent(
  db: SkylineDb,
  actor: Pick<User, "id">,
  input: EventWriteInput
) {
  assertEventSchedule(input.startsAt, input.endsAt);
  if (input.capacity < 0) {
    throw new BadRequestError("capacity cannot be negative");
  }
  if (input.memberPrice.lt(0) || input.nonMemberPrice.lt(0)) {
    throw new BadRequestError("Ticket prices cannot be negative");
  }

  const event = await db.event.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      location: input.location ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity,
      memberPrice: input.memberPrice,
      nonMemberPrice: input.nonMemberPrice,
      createdById: actor.id,
    },
  });

  const { pricedAsMember } = await pricingForUser(db, actor.id);
  return { event: withPricing(event, 0, pricedAsMember) };
}

export async function updateEvent(
  db: SkylineDb,
  eventId: string,
  patch: Partial<EventWriteInput> & { cancel?: boolean }
) {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const startsAt = patch.startsAt ?? event.startsAt;
  const endsAt = patch.endsAt ?? event.endsAt;
  assertEventSchedule(startsAt, endsAt);

  const capacity = patch.capacity ?? event.capacity;
  if (capacity < 0) {
    throw new BadRequestError("capacity cannot be negative");
  }

  const ticketsSold = await countHeldTickets(db, eventId);
  if (capacity < ticketsSold) {
    throw new BadRequestError(
      "capacity cannot be lower than tickets already held",
      { ticketsSold, capacity }
    );
  }

  const memberPrice = patch.memberPrice ?? event.memberPrice;
  const nonMemberPrice = patch.nonMemberPrice ?? event.nonMemberPrice;
  if (memberPrice.lt(0) || nonMemberPrice.lt(0)) {
    throw new BadRequestError("Ticket prices cannot be negative");
  }

  let cancelledAt = event.cancelledAt;
  if (patch.cancel === true) {
    cancelledAt = event.cancelledAt ?? new Date();
  } else if (patch.cancel === false) {
    cancelledAt = null;
  }

  const updated = await db.event.update({
    where: { id: eventId },
    data: {
      title: patch.title ?? event.title,
      description:
        patch.description !== undefined ? patch.description : event.description,
      location: patch.location !== undefined ? patch.location : event.location,
      startsAt,
      endsAt,
      capacity,
      memberPrice,
      nonMemberPrice,
      cancelledAt,
    },
  });

  return { event: withPricing(updated, ticketsSold, false) };
}
