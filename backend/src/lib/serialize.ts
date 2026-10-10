import type { Event, Membership, Payment, Ticket, User } from "@prisma/client";

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function money(value: { toString(): string }): string {
  return value.toString();
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    studentId: user.studentId,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function serializeMembership(membership: Membership) {
  return {
    id: membership.id,
    userId: membership.userId,
    status: membership.status,
    startsOn: dateOnly(membership.startsOn),
    expiresOn: dateOnly(membership.expiresOn),
    duesAmount: money(membership.duesAmount),
    paymentId: membership.paymentId,
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  };
}

export function serializePayment(payment: Payment) {
  return {
    id: payment.id,
    userId: payment.userId,
    amount: money(payment.amount),
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    purpose: payment.purpose,
    externalRef: payment.externalRef,
    paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export function serializeEvent(
  event: Event,
  extras?: {
    ticketsSold?: number;
    yourPrice?: string;
    pricedAsMember?: boolean;
  }
) {
  const ticketsSold = extras?.ticketsSold ?? 0;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    capacity: event.capacity,
    memberPrice: money(event.memberPrice),
    nonMemberPrice: money(event.nonMemberPrice),
    createdById: event.createdById,
    cancelledAt: event.cancelledAt ? event.cancelledAt.toISOString() : null,
    ticketsSold,
    remainingCapacity: Math.max(0, event.capacity - ticketsSold),
    ...(extras?.yourPrice !== undefined ? { yourPrice: extras.yourPrice } : {}),
    ...(extras?.pricedAsMember !== undefined
      ? { pricedAsMember: extras.pricedAsMember }
      : {}),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function serializeTicket(ticket: Ticket, event?: Event) {
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    userId: ticket.userId,
    paymentId: ticket.paymentId,
    status: ticket.status,
    pricePaid: money(ticket.pricePaid),
    pricedAsMember: ticket.pricedAsMember,
    validationCode: ticket.validationCode,
    validatedAt: ticket.validatedAt ? ticket.validatedAt.toISOString() : null,
    validatedById: ticket.validatedById,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    ...(event ? { event: serializeEvent(event) } : {}),
  };
}
