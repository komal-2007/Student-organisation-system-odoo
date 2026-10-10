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
  UserRole,
  type Membership,
  type Payment,
  type User,
} from "@prisma/client";
import * as jose from "jose";
import { createApp } from "./app";
import type { SkylineDb } from "./lib/db";
import { env } from "./config/env";

const TEST_SECRET = new TextEncoder().encode(
  "unit-test-access-token-secret-not-used-in-production"
);

const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_ID = "22222222-2222-4222-8222-222222222222";
const TREASURER_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_ID = "44444444-4444-4444-8444-444444444444";
const UNKNOWN_ID = "55555555-5555-4555-8555-555555555555";
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

function seedUser(
  id: string,
  role: UserRole,
  extras: Partial<User> = {}
): User {
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

function createMemoryDb(seed: { users: User[]; memberships: Membership[] }) {
  const users = new Map(seed.users.map((user) => [user.id, { ...user }]));
  const memberships = new Map(
    seed.memberships.map((membership) => [membership.id, { ...membership }])
  );
  const payments = new Map<string, Payment>();

  const db = {
    user: {
      async findUnique({ where }: { where: { id: string } }) {
        return users.get(where.id) ?? null;
      },
      async findMany() {
        return [...users.values()].sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: { role?: UserRole };
      }) {
        const user = users.get(where.id);
        if (!user) {
          throw new Error("user not found");
        }
        const updated = {
          ...user,
          ...data,
          updatedAt: new Date("2026-01-16T00:00:00.000Z"),
        };
        users.set(where.id, updated);
        return updated;
      },
    },
    membership: {
      async findFirst({
        where,
        orderBy,
      }: {
        where: { userId: string; status?: MembershipStatus };
        orderBy?: Array<Record<string, string>>;
      }) {
        let rows = [...memberships.values()].filter(
          (row) => row.userId === where.userId
        );
        if (where.status) {
          rows = rows.filter((row) => row.status === where.status);
        }
        if (orderBy?.length) {
          rows.sort((a, b) => {
            for (const rule of orderBy) {
              const key = Object.keys(rule)[0] as keyof Membership;
              const dir = rule[key];
              const av = a[key];
              const bv = b[key];
              if (av < bv) {
                return dir === "desc" ? 1 : -1;
              }
              if (av > bv) {
                return dir === "desc" ? -1 : 1;
              }
            }
            return 0;
          });
        }
        return rows[0] ?? null;
      },
      async findMany({
        where,
      }: {
        where: { userId: { in: string[] } };
      }) {
        const ids = new Set(where.userId.in);
        return [...memberships.values()]
          .filter((row) => ids.has(row.userId))
          .sort((a, b) => b.expiresOn.getTime() - a.expiresOn.getTime());
      },
      async create({ data }: { data: Omit<Membership, "id" | "createdAt" | "updatedAt"> }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Membership = {
          id: `77777777-7777-4777-8777-${String(memberships.size).padStart(12, "0")}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        memberships.set(row.id, row);
        return row;
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: { status?: MembershipStatus };
      }) {
        const row = memberships.get(where.id);
        if (!row) {
          throw new Error("membership not found");
        }
        const updated = {
          ...row,
          ...data,
          updatedAt: new Date("2026-01-16T00:00:00.000Z"),
        };
        memberships.set(where.id, updated);
        return updated;
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
      seedUser(STUDENT_ID, UserRole.STUDENT, { fullName: "Alex Student", email: "alex@campus.test" }),
      seedUser(ADMIN_ID, UserRole.ADMIN, { fullName: "Komal Admin", email: "komal@campus.test" }),
      seedUser(TREASURER_ID, UserRole.TREASURER, {
        fullName: "Riley Treasurer",
        email: "riley@campus.test",
      }),
      seedUser(OTHER_ID, UserRole.STUDENT, { fullName: "Blake Other", email: "blake@campus.test" }),
    ],
    memberships: [
      {
        id: MEMBERSHIP_ID,
        userId: STUDENT_ID,
        status: MembershipStatus.PENDING,
        startsOn: new Date("2026-01-01T00:00:00.000Z"),
        expiresOn: new Date("2027-01-01T00:00:00.000Z"),
        duesAmount: new Prisma.Decimal("500.00"),
        paymentId: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
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

test("unauthenticated requests are rejected", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const profile = await fetch(`${baseUrl}/api/me/profile`);
    assert.equal(profile.status, 401);

    const members = await fetch(`${baseUrl}/api/admin/members`);
    assert.equal(members.status, 401);

    const renew = await fetch(`${baseUrl}/api/me/memberships/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: PaymentMethod.CASH }),
    });
    assert.equal(renew.status, 401);
  });
});

test("invalid bearer tokens are rejected", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/me/profile`, {
      headers: { Authorization: "Bearer not-a-jwt" },
    });
    assert.equal(res.status, 401);
  });
});

test("GET /api/me/profile returns the verified user's record only", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(STUDENT_ID, { role: UserRole.ADMIN });
    const res = await fetch(`${baseUrl}/api/me/profile`, {
      headers: authHeader(token),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      user: { id: string; role: string; email: string };
      membership: { status: string } | null;
    };
    assert.equal(body.user.id, STUDENT_ID);
    assert.equal(body.user.role, UserRole.STUDENT);
    assert.equal(body.user.email, "alex@campus.test");
    assert.equal(body.membership?.status, MembershipStatus.PENDING);
  });
});

test("GET /api/me/profile 404s when the identity is not linked", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(UNKNOWN_ID);
    const res = await fetch(`${baseUrl}/api/me/profile`, {
      headers: authHeader(token),
    });
    assert.equal(res.status, 404);
  });
});

test("students cannot access admin member routes", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(STUDENT_ID, { role: UserRole.ADMIN });
    const list = await fetch(`${baseUrl}/api/admin/members`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 403);

    const patch = await fetch(`${baseUrl}/api/admin/members/${OTHER_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ role: UserRole.ADMIN }),
    });
    assert.equal(patch.status, 403);
  });
});

test("treasurers may list members but cannot change them", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(TREASURER_ID);
    const list = await fetch(`${baseUrl}/api/admin/members`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 200);
    const body = (await list.json()) as { members: Array<{ id: string }> };
    assert.equal(body.members.length, 4);

    const patch = await fetch(`${baseUrl}/api/admin/members/${STUDENT_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ role: UserRole.TREASURER }),
    });
    assert.equal(patch.status, 403);
  });
});

test("admins can list members and update allowed fields", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(ADMIN_ID);
    const list = await fetch(`${baseUrl}/api/admin/members`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 200);

    const patch = await fetch(`${baseUrl}/api/admin/members/${STUDENT_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({
        role: UserRole.TREASURER,
        membershipStatus: MembershipStatus.ACTIVE,
      }),
    });
    assert.equal(patch.status, 200);
    const body = (await patch.json()) as {
      member: { role: string; currentMembership: { status: string } };
    };
    assert.equal(body.member.role, UserRole.TREASURER);
    assert.equal(body.member.currentMembership.status, MembershipStatus.ACTIVE);
  });
});

test("admin membership-status transitions are validated", async () => {
  const db = defaultDb();
  await withServer(db, async (baseUrl) => {
    const token = await signToken(ADMIN_ID);
    const activate = await fetch(`${baseUrl}/api/admin/members/${STUDENT_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ membershipStatus: MembershipStatus.ACTIVE }),
    });
    assert.equal(activate.status, 200);

    const invalid = await fetch(`${baseUrl}/api/admin/members/${STUDENT_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ membershipStatus: MembershipStatus.PENDING }),
    });
    assert.equal(invalid.status, 400);
  });
});

test("membership renewal records a pending payment and does not mark it paid", async () => {
  const previous = env.membershipDuesAmount;
  env.membershipDuesAmount = "500.00";
  const db = createMemoryDb({
    users: [seedUser(OTHER_ID, UserRole.STUDENT, { email: "blake@campus.test" })],
    memberships: [],
  });

  try {
    await withServer(db, async (baseUrl) => {
      const token = await signToken(OTHER_ID);
      const res = await fetch(`${baseUrl}/api/me/memberships/renew`, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ method: PaymentMethod.ONLINE }),
      });
      assert.equal(res.status, 201);
      const body = (await res.json()) as {
        membership: { status: string; userId: string; duesAmount: string };
        payment: {
          status: string;
          purpose: string;
          paidAt: string | null;
          method: string;
        };
      };
      assert.equal(body.membership.status, MembershipStatus.PENDING);
      assert.equal(body.membership.userId, OTHER_ID);
      assert.equal(body.membership.duesAmount, "500");
      assert.equal(body.payment.status, PaymentStatus.PENDING);
      assert.equal(body.payment.purpose, PaymentPurpose.MEMBERSHIP_DUES);
      assert.equal(body.payment.method, PaymentMethod.ONLINE);
      assert.equal(body.payment.paidAt, null);

      const again = await fetch(`${baseUrl}/api/me/memberships/renew`, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ method: PaymentMethod.ONLINE }),
      });
      assert.equal(again.status, 409);
    });
  } finally {
    env.membershipDuesAmount = previous;
  }
});

test("membership renewal is isolated to the authenticated user", async () => {
  const previous = env.membershipDuesAmount;
  env.membershipDuesAmount = "500.00";
  const db = createMemoryDb({
    users: [
      seedUser(STUDENT_ID, UserRole.STUDENT),
      seedUser(OTHER_ID, UserRole.STUDENT),
    ],
    memberships: [],
  });

  try {
    await withServer(db, async (baseUrl) => {
      const token = await signToken(STUDENT_ID);
      const res = await fetch(`${baseUrl}/api/me/memberships/renew`, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ method: PaymentMethod.CASH }),
      });
      assert.equal(res.status, 201);
      const body = (await res.json()) as { membership: { userId: string } };
      assert.equal(body.membership.userId, STUDENT_ID);
    });
  } finally {
    env.membershipDuesAmount = previous;
  }
});
