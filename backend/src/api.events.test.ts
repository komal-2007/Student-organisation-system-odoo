import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import {
  MembershipStatus,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  TicketStatus,
  UserRole,
  type Event,
  type Membership,
  type Payment,
  type Ticket,
  type User,
} from "@prisma/client";
import * as jose from "jose";
import { createApp } from "./app";
import type { SkylineDb } from "./lib/db";

const TEST_SECRET = new TextEncoder().encode(
  "unit-test-access-token-secret-not-used-in-production"
);

const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_ID = "22222222-2222-4222-8222-222222222222";
const TREASURER_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_ID = "44444444-4444-4444-8444-444444444444";
const EVENT_ID = "99999999-9999-4999-8999-999999999999";
const SMALL_EVENT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBERSHIP_ID = "66666666-6666-4666-8666-666666666666";

async function signToken(sub: string, claims: Record<string, unknown> = {}) {
  return new jose.SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(TEST_SECRET);
}

const testVerifyAccessToken = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, TEST_SECRET, {
    algorithms: ["HS256"],
    audience: "authenticated",
  });
  if (!payload.sub) {
    throw new Error("missing sub");
  }
  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
};

function seedUser(id: string, role: UserRole, extras: Partial<User> = {}): User {
  const now = new Date("2026-01-15T00:00:00.000Z");
  return {
    id,
    email: `${id}@campus.test`,
    fullName: `User ${role}`,
    studentId: null,
    phone: null,
    role,
    createdAt: now,
    updatedAt: now,
    ...extras,
  };
}

function createMemoryDb(seed: {
  users: User[];
  memberships?: Membership[];
  events?: Event[];
  tickets?: Ticket[];
  payments?: Payment[];
}) {
  const users = new Map(seed.users.map((user) => [user.id, { ...user }]));
  const memberships = new Map(
    (seed.memberships ?? []).map((row) => [row.id, { ...row }])
  );
  const events = new Map((seed.events ?? []).map((row) => [row.id, { ...row }]));
  const tickets = new Map((seed.tickets ?? []).map((row) => [row.id, { ...row }]));
  const payments = new Map(
    (seed.payments ?? []).map((row) => [row.id, { ...row }])
  );

  const db = {
    user: {
      async findUnique({ where }: { where: { id: string } }) {
        return users.get(where.id) ?? null;
      },
      async findMany() {
        return [...users.values()];
      },
      async update() {
        throw new Error("unused");
      },
    },
    membership: {
      async findFirst({
        where,
      }: {
        where: { userId: string; status?: MembershipStatus };
      }) {
        return (
          [...memberships.values()].find(
            (row) =>
              row.userId === where.userId &&
              (!where.status || row.status === where.status)
          ) ?? null
        );
      },
      async findMany({
        where,
      }: {
        where: { userId: { in: string[] } };
      }) {
        const ids = new Set(where.userId.in);
        return [...memberships.values()].filter((row) => ids.has(row.userId));
      },
      async create() {
        throw new Error("unused");
      },
      async update() {
        throw new Error("unused");
      },
    },
    payment: {
      async create({
        data,
      }: {
        data: Omit<Payment, "id" | "createdAt" | "updatedAt">;
      }) {
        if (
          data.externalRef &&
          [...payments.values()].some((row) => row.externalRef === data.externalRef)
        ) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
          });
        }
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Payment = {
          id: `88888888-8888-4888-8888-${String(payments.size).padStart(12, "0")}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        payments.set(row.id, row);
        return row;
      },
      async findMany({
        where,
      }: {
        where: { id: { in: string[] } };
      }) {
        const ids = new Set(where.id.in);
        return [...payments.values()].filter((row) => ids.has(row.id));
      },
    },
    event: {
      async findUnique({ where }: { where: { id: string } }) {
        return events.get(where.id) ?? null;
      },
      async findMany({
        where,
        orderBy,
      }: {
        where?: { id?: { in: string[] } };
        orderBy?: { startsAt?: string };
      } = {}) {
        let rows = [...events.values()];
        if (where?.id?.in) {
          const ids = new Set(where.id.in);
          rows = rows.filter((row) => ids.has(row.id));
        }
        if (orderBy?.startsAt === "asc") {
          rows.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
        }
        return rows;
      },
      async create({
        data,
      }: {
        data: Omit<Event, "id" | "createdAt" | "updatedAt" | "cancelledAt"> & {
          cancelledAt?: Date | null;
        };
      }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Event = {
          id: `bbbbbbbb-bbbb-4bbb-8bbb-${String(events.size).padStart(12, "0")}`,
          cancelledAt: data.cancelledAt ?? null,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        events.set(row.id, row);
        return row;
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Event>;
      }) {
        const row = events.get(where.id);
        if (!row) {
          throw new Error("event not found");
        }
        const updated = {
          ...row,
          ...data,
          updatedAt: new Date("2026-10-10T01:00:00.000Z"),
        };
        events.set(where.id, updated);
        return updated;
      },
    },
    ticket: {
      async findUnique({
        where,
      }: {
        where: { id?: string; validationCode?: string };
      }) {
        if (where.id) {
          return tickets.get(where.id) ?? null;
        }
        if (where.validationCode) {
          return (
            [...tickets.values()].find(
              (row) => row.validationCode === where.validationCode
            ) ?? null
          );
        }
        return null;
      },
      async findMany({
        where,
        orderBy,
      }: {
        where?: {
          userId?: string | null;
          eventId?: string | { in: string[] };
          status?: { in: TicketStatus[] };
        };
        orderBy?: { createdAt?: string };
      } = {}) {
        let rows = [...tickets.values()];
        if (where?.userId) {
          rows = rows.filter((row) => row.userId === where.userId);
        }
        if (typeof where?.eventId === "string") {
          rows = rows.filter((row) => row.eventId === where.eventId);
        } else if (where?.eventId && "in" in where.eventId) {
          const ids = new Set(where.eventId.in);
          rows = rows.filter((row) => ids.has(row.eventId));
        }
        if (where?.status?.in) {
          const allowed = new Set(where.status.in);
          rows = rows.filter((row) => allowed.has(row.status));
        }
        if (orderBy?.createdAt === "desc") {
          rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        if (orderBy?.createdAt === "asc") {
          rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
        return rows;
      },
      async create({
        data,
      }: {
        data: Omit<Ticket, "id" | "createdAt" | "updatedAt">;
      }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Ticket = {
          id: `cccccccc-cccc-4ccc-8ccc-${String(tickets.size).padStart(12, "0")}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        tickets.set(row.id, row);
        return row;
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Ticket>;
      }) {
        const row = tickets.get(where.id);
        if (!row) {
          throw new Error("ticket not found");
        }
        const updated = {
          ...row,
          ...data,
          updatedAt: new Date("2026-10-10T01:00:00.000Z"),
        };
        tickets.set(where.id, updated);
        return updated;
      },
      async count({
        where,
      }: {
        where: { eventId: string; status: { in: TicketStatus[] } };
      }) {
        const allowed = new Set(where.status.in);
        return [...tickets.values()].filter(
          (row) => row.eventId === where.eventId && allowed.has(row.status)
        ).length;
      },
    },
    async $transaction<T>(fn: (tx: typeof db) => Promise<T>) {
      return fn(db);
    },
  };

  return db as unknown as SkylineDb;
}

function defaultDb() {
  return createMemoryDb({
    users: [
      seedUser(STUDENT_ID, UserRole.STUDENT, {
        fullName: "Alex Student",
        email: "alex@campus.test",
      }),
      seedUser(ADMIN_ID, UserRole.ADMIN, {
        fullName: "Komal Admin",
        email: "komal@campus.test",
      }),
      seedUser(TREASURER_ID, UserRole.TREASURER, {
        fullName: "Riley Treasurer",
        email: "riley@campus.test",
      }),
      seedUser(OTHER_ID, UserRole.STUDENT, {
        fullName: "Blake Other",
        email: "blake@campus.test",
      }),
    ],
    memberships: [
      {
        id: MEMBERSHIP_ID,
        userId: STUDENT_ID,
        status: MembershipStatus.ACTIVE,
        startsOn: new Date("2026-01-01T00:00:00.000Z"),
        expiresOn: new Date("2027-01-01T00:00:00.000Z"),
        duesAmount: new Prisma.Decimal("500.00"),
        paymentId: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ],
    events: [
      {
        id: EVENT_ID,
        title: "HackCampus 2026",
        description: "24-hour sprint",
        location: "Hall A",
        startsAt: new Date("2026-11-01T09:00:00.000Z"),
        endsAt: new Date("2026-11-02T09:00:00.000Z"),
        capacity: 10,
        memberPrice: new Prisma.Decimal("100.00"),
        nonMemberPrice: new Prisma.Decimal("250.00"),
        createdById: ADMIN_ID,
        cancelledAt: null,
        createdAt: new Date("2026-10-01T00:00:00.000Z"),
        updatedAt: new Date("2026-10-01T00:00:00.000Z"),
      },
      {
        id: SMALL_EVENT_ID,
        title: "Tiny Workshop",
        description: null,
        location: "Lab",
        startsAt: new Date("2026-11-05T16:00:00.000Z"),
        endsAt: new Date("2026-11-05T18:00:00.000Z"),
        capacity: 1,
        memberPrice: new Prisma.Decimal("50.00"),
        nonMemberPrice: new Prisma.Decimal("50.00"),
        createdById: ADMIN_ID,
        cancelledAt: null,
        createdAt: new Date("2026-10-01T00:00:00.000Z"),
        updatedAt: new Date("2026-10-01T00:00:00.000Z"),
      },
    ],
  });
}

async function withServer(
  db: SkylineDb,
  run: (baseUrl: string) => Promise<void>
) {
  const app = createApp({
    prisma: db,
    verifyAccessToken: testVerifyAccessToken,
  });
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

test("unauthenticated event and ticket requests are rejected", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const list = await fetch(`${baseUrl}/api/events`);
    assert.equal(list.status, 401);

    const buy = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: PaymentMethod.CASH }),
    });
    assert.equal(buy.status, 401);

    const mine = await fetch(`${baseUrl}/api/me/tickets`);
    assert.equal(mine.status, 401);

    const admin = await fetch(`${baseUrl}/api/admin/events`, { method: "POST" });
    assert.equal(admin.status, 401);
  });
});

test("students cannot create events even if the JWT claims admin", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(STUDENT_ID, { role: UserRole.ADMIN });
    const res = await fetch(`${baseUrl}/api/admin/events`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        title: "Unauthorized event",
        startsAt: "2026-12-01T09:00:00.000Z",
        endsAt: "2026-12-01T11:00:00.000Z",
        capacity: 5,
        memberPrice: "10.00",
        nonMemberPrice: "20.00",
      }),
    });
    assert.equal(res.status, 403);
  });
});

test("admins can create events and treasurers cannot", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const treasurerToken = await signToken(TREASURER_ID);
    const denied = await fetch(`${baseUrl}/api/admin/events`, {
      method: "POST",
      headers: authHeader(treasurerToken),
      body: JSON.stringify({
        title: "Treasurer event",
        startsAt: "2026-12-01T09:00:00.000Z",
        endsAt: "2026-12-01T11:00:00.000Z",
        capacity: 5,
        memberPrice: "10.00",
        nonMemberPrice: "20.00",
      }),
    });
    assert.equal(denied.status, 403);

    const adminToken = await signToken(ADMIN_ID);
    const created = await fetch(`${baseUrl}/api/admin/events`, {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        title: "Career Night",
        description: "Talks",
        location: "Auditorium",
        startsAt: "2026-12-01T09:00:00.000Z",
        endsAt: "2026-12-01T11:00:00.000Z",
        capacity: 40,
        memberPrice: "0.00",
        nonMemberPrice: "15.00",
      }),
    });
    assert.equal(created.status, 201);
    const body = (await created.json()) as {
      event: { title: string; createdById: string; memberPrice: string };
    };
    assert.equal(body.event.title, "Career Night");
    assert.equal(body.event.createdById, ADMIN_ID);
    assert.equal(body.event.memberPrice, "0");
  });
});

test("ticket purchase uses membership-derived member vs non-member price", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const memberToken = await signToken(STUDENT_ID);
    const memberBuy = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(memberToken),
      body: JSON.stringify({ method: PaymentMethod.ONLINE }),
    });
    assert.equal(memberBuy.status, 201);
    const memberBody = (await memberBuy.json()) as {
      tickets: Array<{ pricedAsMember: boolean; pricePaid: string; userId: string; status: string }>;
      payment: { status: string; purpose: string; paidAt: string | null; amount: string };
    };
    assert.equal(memberBody.tickets.length, 1);
    assert.equal(memberBody.tickets[0].pricedAsMember, true);
    assert.equal(memberBody.tickets[0].pricePaid, "100");
    assert.equal(memberBody.tickets[0].userId, STUDENT_ID);
    assert.equal(memberBody.tickets[0].status, TicketStatus.RESERVED);
    assert.equal(memberBody.payment.status, PaymentStatus.PENDING);
    assert.equal(memberBody.payment.purpose, PaymentPurpose.EVENT_TICKET);
    assert.equal(memberBody.payment.paidAt, null);
    assert.equal(memberBody.payment.amount, "100");

    const guestToken = await signToken(OTHER_ID);
    const guestBuy = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(guestToken),
      body: JSON.stringify({ method: PaymentMethod.CASH }),
    });
    assert.equal(guestBuy.status, 201);
    const guestBody = (await guestBuy.json()) as {
      tickets: Array<{ pricedAsMember: boolean; pricePaid: string; userId: string }>;
    };
    assert.equal(guestBody.tickets[0].pricedAsMember, false);
    assert.equal(guestBody.tickets[0].pricePaid, "250");
    assert.equal(guestBody.tickets[0].userId, OTHER_ID);
  });
});

test("capacity is enforced and remaining tickets are isolated per user", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const first = await signToken(STUDENT_ID);
    const sold = await fetch(`${baseUrl}/api/events/${SMALL_EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(first),
      body: JSON.stringify({ method: PaymentMethod.CARD, quantity: 1 }),
    });
    assert.equal(sold.status, 201);

    const second = await signToken(OTHER_ID);
    const rejected = await fetch(`${baseUrl}/api/events/${SMALL_EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(second),
      body: JSON.stringify({ method: PaymentMethod.CARD }),
    });
    assert.equal(rejected.status, 409);

    const mine = await fetch(`${baseUrl}/api/me/tickets`, {
      headers: authHeader(second),
    });
    assert.equal(mine.status, 200);
    const body = (await mine.json()) as { tickets: unknown[] };
    assert.equal(body.tickets.length, 0);

    const owner = await fetch(`${baseUrl}/api/me/tickets`, {
      headers: authHeader(first),
    });
    const ownerBody = (await owner.json()) as {
      tickets: Array<{ eventId: string; userId: string }>;
    };
    assert.equal(ownerBody.tickets.length, 1);
    assert.equal(ownerBody.tickets[0].userId, STUDENT_ID);
    assert.equal(ownerBody.tickets[0].eventId, SMALL_EVENT_ID);
  });
});

test("client-supplied price and holder id are ignored", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(OTHER_ID);
    const res = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        method: PaymentMethod.CASH,
        pricePaid: "1.00",
        pricedAsMember: true,
        userId: STUDENT_ID,
      }),
    });
    assert.equal(res.status, 400);
  });
});

test("treasurers can inspect event tickets and revenue but cannot validate", async () => {
  const db = defaultDb();
  await withServer(db, async (baseUrl) => {
    const studentToken = await signToken(STUDENT_ID);
    const buy = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(studentToken),
      body: JSON.stringify({ method: PaymentMethod.ONLINE, quantity: 2 }),
    });
    assert.equal(buy.status, 201);

    const treasurerToken = await signToken(TREASURER_ID);
    const list = await fetch(`${baseUrl}/api/admin/events/${EVENT_ID}/tickets`, {
      headers: authHeader(treasurerToken),
    });
    assert.equal(list.status, 200);
    const body = (await list.json()) as {
      tickets: unknown[];
      revenue: { pendingAmount: string; ticketCount: number; attendingCount: number };
    };
    assert.equal(body.tickets.length, 2);
    assert.equal(body.revenue.ticketCount, 2);
    assert.equal(body.revenue.pendingAmount, "200");
    assert.equal(body.revenue.attendingCount, 0);

    const validate = await fetch(
      `${baseUrl}/api/admin/events/${EVENT_ID}/tickets/validate`,
      {
        method: "POST",
        headers: authHeader(treasurerToken),
        body: JSON.stringify({ validationCode: "not-used-here" }),
      }
    );
    assert.equal(validate.status, 403);
  });
});

test("admins can validate a PAID ticket once as attendance", async () => {
  const now = new Date("2026-10-10T00:00:00.000Z");
  const ticketId = "dddddddd-dddd-4ddd-8ddd-000000000001";
  const db = createMemoryDb({
    users: [
      seedUser(STUDENT_ID, UserRole.STUDENT),
      seedUser(ADMIN_ID, UserRole.ADMIN),
    ],
    events: [
      {
        id: EVENT_ID,
        title: "HackCampus 2026",
        description: null,
        location: "Hall A",
        startsAt: new Date("2026-11-01T09:00:00.000Z"),
        endsAt: new Date("2026-11-02T09:00:00.000Z"),
        capacity: 10,
        memberPrice: new Prisma.Decimal("100.00"),
        nonMemberPrice: new Prisma.Decimal("250.00"),
        createdById: ADMIN_ID,
        cancelledAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    tickets: [
      {
        id: ticketId,
        eventId: EVENT_ID,
        userId: STUDENT_ID,
        paymentId: null,
        status: TicketStatus.PAID,
        pricePaid: new Prisma.Decimal("0"),
        pricedAsMember: true,
        validationCode: "tck_valid-code-xyz",
        validatedAt: null,
        validatedById: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "dddddddd-dddd-4ddd-8ddd-000000000002",
        eventId: EVENT_ID,
        userId: STUDENT_ID,
        paymentId: null,
        status: TicketStatus.RESERVED,
        pricePaid: new Prisma.Decimal("100"),
        pricedAsMember: true,
        validationCode: "tck_reserved-code",
        validatedAt: null,
        validatedById: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });

  await withServer(db, async (baseUrl) => {
    const token = await signToken(ADMIN_ID);
    const reserved = await fetch(
      `${baseUrl}/api/admin/events/${EVENT_ID}/tickets/validate`,
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ validationCode: "tck_reserved-code" }),
      }
    );
    assert.equal(reserved.status, 400);

    const first = await fetch(
      `${baseUrl}/api/admin/events/${EVENT_ID}/tickets/validate`,
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ validationCode: "tck_valid-code-xyz" }),
      }
    );
    assert.equal(first.status, 200);
    const body = (await first.json()) as {
      attendance: boolean;
      ticket: { status: string; validatedById: string; validatedAt: string | null };
    };
    assert.equal(body.attendance, true);
    assert.equal(body.ticket.status, TicketStatus.VALIDATED);
    assert.equal(body.ticket.validatedById, ADMIN_ID);
    assert.ok(body.ticket.validatedAt);

    const again = await fetch(
      `${baseUrl}/api/admin/events/${EVENT_ID}/tickets/validate`,
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ validationCode: "tck_valid-code-xyz" }),
      }
    );
    assert.equal(again.status, 409);
  });
});

test("cancelled events cannot be purchased", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const adminToken = await signToken(ADMIN_ID);
    const cancel = await fetch(`${baseUrl}/api/admin/events/${EVENT_ID}`, {
      method: "PATCH",
      headers: authHeader(adminToken),
      body: JSON.stringify({ cancel: true }),
    });
    assert.equal(cancel.status, 200);

    const studentToken = await signToken(STUDENT_ID);
    const buy = await fetch(`${baseUrl}/api/events/${EVENT_ID}/tickets`, {
      method: "POST",
      headers: authHeader(studentToken),
      body: JSON.stringify({ method: PaymentMethod.CASH }),
    });
    assert.equal(buy.status, 400);
  });
});
