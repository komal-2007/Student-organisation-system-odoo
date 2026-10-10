import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import {
  AnnouncementStatus,
  MembershipStatus,
  Prisma,
  UserRole,
  type Announcement,
  type Membership,
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
const UNKNOWN_ID = "55555555-5555-4555-8555-555555555555";
const PUBLISHED_ID = "aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const DRAFT_ID = "bbbb2222-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ARCHIVED_ID = "cccc3333-cccc-4ccc-8ccc-cccccccccccc";
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
  announcements?: Announcement[];
}) {
  const users = new Map(seed.users.map((user) => [user.id, { ...user }]));
  const memberships = new Map(
    (seed.memberships ?? []).map((row) => [row.id, { ...row }])
  );
  const announcements = new Map(
    (seed.announcements ?? []).map((row) => [row.id, { ...row }])
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
    announcement: {
      async findUnique({ where }: { where: { id: string } }) {
        return announcements.get(where.id) ?? null;
      },
      async findMany({
        where,
        orderBy,
      }: {
        where?: { status?: AnnouncementStatus };
        orderBy?: Array<Record<string, string>>;
      } = {}) {
        let rows = [...announcements.values()];
        if (where?.status) {
          rows = rows.filter((row) => row.status === where.status);
        }
        if (orderBy?.length) {
          rows.sort((a, b) => {
            for (const rule of orderBy) {
              const key = Object.keys(rule)[0] as keyof Announcement;
              const dir = rule[key];
              const av = a[key];
              const bv = b[key];
              const at = av instanceof Date ? av.getTime() : av ? String(av) : "";
              const bt = bv instanceof Date ? bv.getTime() : bv ? String(bv) : "";
              if (at < bt) {
                return dir === "desc" ? 1 : -1;
              }
              if (at > bt) {
                return dir === "desc" ? -1 : 1;
              }
            }
            return 0;
          });
        }
        return rows;
      },
      async create({
        data,
      }: {
        data: Omit<Announcement, "id" | "createdAt" | "updatedAt">;
      }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Announcement = {
          id: `dddddddd-dddd-4ddd-8ddd-${String(announcements.size).padStart(12, "0")}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        announcements.set(row.id, row);
        return row;
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Announcement>;
      }) {
        const row = announcements.get(where.id);
        if (!row) {
          throw new Error("announcement not found");
        }
        const updated = {
          ...row,
          ...data,
          updatedAt: new Date("2026-10-10T01:00:00.000Z"),
        };
        announcements.set(where.id, updated);
        return updated;
      },
    },
    async $transaction<T>(fn: (tx: typeof db) => Promise<T>) {
      return fn(db);
    },
  };

  return db as unknown as SkylineDb;
}

function activeMembership(userId: string, id: string): Membership {
  return {
    id,
    userId,
    status: MembershipStatus.ACTIVE,
    startsOn: new Date("2020-01-01T00:00:00.000Z"),
    expiresOn: new Date("2099-01-01T00:00:00.000Z"),
    duesAmount: new Prisma.Decimal("500.00"),
    paymentId: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function defaultDb() {
  const now = new Date("2026-10-01T00:00:00.000Z");
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
    memberships: [activeMembership(STUDENT_ID, MEMBERSHIP_ID)],
    announcements: [
      {
        id: PUBLISHED_ID,
        title: "HackCampus this weekend",
        body: "Bring your laptop.",
        status: AnnouncementStatus.PUBLISHED,
        createdById: ADMIN_ID,
        publishedAt: new Date("2026-10-02T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: DRAFT_ID,
        title: "Unpublished draft",
        body: "Staff only.",
        status: AnnouncementStatus.DRAFT,
        createdById: ADMIN_ID,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ARCHIVED_ID,
        title: "Old notice",
        body: "No longer current.",
        status: AnnouncementStatus.ARCHIVED,
        createdById: ADMIN_ID,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
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

test("unauthenticated announcement requests are rejected", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const list = await fetch(`${baseUrl}/api/announcements`);
    assert.equal(list.status, 401);

    const one = await fetch(`${baseUrl}/api/announcements/${PUBLISHED_ID}`);
    assert.equal(one.status, 401);

    const create = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nope", body: "Nope" }),
    });
    assert.equal(create.status, 401);
  });
});

test("unlinked identities cannot read announcements", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(UNKNOWN_ID);
    const res = await fetch(`${baseUrl}/api/announcements`, {
      headers: authHeader(token),
    });
    assert.equal(res.status, 404);
  });
});

test("students without an active membership cannot view announcements", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(OTHER_ID);
    const list = await fetch(`${baseUrl}/api/announcements`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 403);

    const one = await fetch(`${baseUrl}/api/announcements/${PUBLISHED_ID}`, {
      headers: authHeader(token),
    });
    assert.equal(one.status, 403);
  });
});

test("active members see published announcements only", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(STUDENT_ID, { role: UserRole.ADMIN });
    const list = await fetch(`${baseUrl}/api/announcements`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 200);
    const body = (await list.json()) as {
      announcements: Array<{ id: string; status: string }>;
    };
    assert.equal(body.announcements.length, 1);
    assert.equal(body.announcements[0].id, PUBLISHED_ID);
    assert.equal(body.announcements[0].status, AnnouncementStatus.PUBLISHED);

    const published = await fetch(`${baseUrl}/api/announcements/${PUBLISHED_ID}`, {
      headers: authHeader(token),
    });
    assert.equal(published.status, 200);

    const draft = await fetch(`${baseUrl}/api/announcements/${DRAFT_ID}`, {
      headers: authHeader(token),
    });
    assert.equal(draft.status, 404);

    const archived = await fetch(`${baseUrl}/api/announcements/${ARCHIVED_ID}`, {
      headers: authHeader(token),
    });
    assert.equal(archived.status, 404);
  });
});

test("missing announcements return 404 and invalid ids are rejected", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(STUDENT_ID);
    const missing = await fetch(
      `${baseUrl}/api/announcements/99999999-9999-4999-8999-999999999999`,
      { headers: authHeader(token) }
    );
    assert.equal(missing.status, 404);

    const invalid = await fetch(`${baseUrl}/api/announcements/not-a-uuid`, {
      headers: authHeader(token),
    });
    assert.equal(invalid.status, 400);
  });
});

test("students and treasurers cannot create or update announcements", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const studentToken = await signToken(STUDENT_ID, { role: UserRole.ADMIN });
    const studentCreate = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: "POST",
      headers: authHeader(studentToken),
      body: JSON.stringify({ title: "Hijack", body: "No" }),
    });
    assert.equal(studentCreate.status, 403);

    const treasurerToken = await signToken(TREASURER_ID);
    const treasurerCreate = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: "POST",
      headers: authHeader(treasurerToken),
      body: JSON.stringify({ title: "Treasurer note", body: "No" }),
    });
    assert.equal(treasurerCreate.status, 403);

    const patch = await fetch(`${baseUrl}/api/admin/announcements/${DRAFT_ID}`, {
      method: "PATCH",
      headers: authHeader(studentToken),
      body: JSON.stringify({ status: AnnouncementStatus.PUBLISHED }),
    });
    assert.equal(patch.status, 403);
  });
});

test("admins can create drafts and client author fields are ignored", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(ADMIN_ID);
    const created = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        title: "Meeting tomorrow",
        body: "Room 101",
      }),
    });
    assert.equal(created.status, 201);
    const body = (await created.json()) as {
      announcement: {
        title: string;
        status: string;
        createdById: string;
        publishedAt: string | null;
      };
    };
    assert.equal(body.announcement.title, "Meeting tomorrow");
    assert.equal(body.announcement.status, AnnouncementStatus.DRAFT);
    assert.equal(body.announcement.createdById, ADMIN_ID);
    assert.equal(body.announcement.publishedAt, null);

    const rejected = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        title: "Forged author",
        body: "Nope",
        createdById: STUDENT_ID,
        publishedAt: "2026-01-01T00:00:00.000Z",
      }),
    });
    assert.equal(rejected.status, 400);
  });
});

test("admins can list all statuses and publish a draft once", async () => {
  await withServer(defaultDb(), async (baseUrl) => {
    const token = await signToken(ADMIN_ID);
    const list = await fetch(`${baseUrl}/api/admin/announcements`, {
      headers: authHeader(token),
    });
    assert.equal(list.status, 200);
    const listed = (await list.json()) as {
      announcements: Array<{ id: string; status: string }>;
    };
    assert.equal(listed.announcements.length, 3);

    const publish = await fetch(`${baseUrl}/api/admin/announcements/${DRAFT_ID}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ status: AnnouncementStatus.PUBLISHED }),
    });
    assert.equal(publish.status, 200);
    const published = (await publish.json()) as {
      announcement: { status: string; publishedAt: string | null };
    };
    assert.equal(published.announcement.status, AnnouncementStatus.PUBLISHED);
    assert.ok(published.announcement.publishedAt);

    const invalid = await fetch(
      `${baseUrl}/api/admin/announcements/${ARCHIVED_ID}`,
      {
        method: "PATCH",
        headers: authHeader(token),
        body: JSON.stringify({ status: AnnouncementStatus.PUBLISHED }),
      }
    );
    assert.equal(invalid.status, 400);

    const missing = await fetch(
      `${baseUrl}/api/admin/announcements/99999999-9999-4999-8999-999999999999`,
      {
        method: "PATCH",
        headers: authHeader(token),
        body: JSON.stringify({ title: "Gone" }),
      }
    );
    assert.equal(missing.status, 404);
  });
});
