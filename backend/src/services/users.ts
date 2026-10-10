import type { Membership, MembershipStatus, User, UserRole } from "@prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../lib/errors";
import type { SkylineDb } from "../lib/db";
import { serializeMembership, serializeUser } from "../lib/serialize";

const MEMBERSHIP_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  PENDING: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["EXPIRED", "CANCELLED"],
  EXPIRED: [],
  CANCELLED: [],
};

export function serializeMemberRecord(user: User, membership: Membership | null) {
  return {
    ...serializeUser(user),
    currentMembership: membership ? serializeMembership(membership) : null,
  };
}

export async function getUserById(
  db: Pick<SkylineDb, "user">,
  id: string
): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

export async function getLatestMembership(
  db: Pick<SkylineDb, "membership">,
  userId: string
): Promise<Membership | null> {
  return db.membership.findFirst({
    where: { userId },
    orderBy: [{ expiresOn: "desc" }, { createdAt: "desc" }],
  });
}

function utcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function isMembershipCurrentlyActive(
  membership: Membership | null | undefined
): boolean {
  if (!membership || membership.status !== "ACTIVE") {
    return false;
  }
  const today = utcDateOnly(new Date());
  const startsOn = utcDateOnly(membership.startsOn);
  const expiresOn = utcDateOnly(membership.expiresOn);
  return startsOn <= today && today <= expiresOn;
}

export async function getCurrentActiveMembership(
  db: Pick<SkylineDb, "membership">,
  userId: string
): Promise<Membership | null> {
  const memberships = await db.membership.findMany({
    where: { userId: { in: [userId] } },
  });
  return memberships.find((row) => isMembershipCurrentlyActive(row)) ?? null;
}

export async function getProfile(db: SkylineDb, userId: string) {
  const user = await getUserById(db, userId);
  if (!user) {
    throw new NotFoundError("No application user is linked to this identity");
  }

  const membership = await getLatestMembership(db, userId);
  return {
    user: serializeUser(user),
    membership: membership ? serializeMembership(membership) : null,
  };
}

export async function listMembers(db: SkylineDb) {
  const users = await db.user.findMany({
    orderBy: { fullName: "asc" },
  });
  const ids = users.map((user) => user.id);
  const memberships =
    ids.length === 0
      ? []
      : await db.membership.findMany({
          where: { userId: { in: ids } },
          orderBy: [{ expiresOn: "desc" }, { createdAt: "desc" }],
        });

  const latestByUser = new Map<string, Membership>();
  for (const membership of memberships) {
    if (!latestByUser.has(membership.userId)) {
      latestByUser.set(membership.userId, membership);
    }
  }

  return {
    members: users.map((user) =>
      serializeMemberRecord(user, latestByUser.get(user.id) ?? null)
    ),
  };
}

function assertMembershipTransition(
  from: MembershipStatus,
  to: MembershipStatus
) {
  if (from === to) {
    return;
  }
  const allowed = MEMBERSHIP_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestError(
      `Cannot change membership status from ${from} to ${to}`,
      { from, to, allowed }
    );
  }
}

export async function adminUpdateMember(
  db: SkylineDb,
  actor: { id: string; role: UserRole },
  memberId: string,
  patch: { role?: UserRole; membershipStatus?: MembershipStatus }
) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("Only admins may change member records");
  }

  if (!patch.role && !patch.membershipStatus) {
    throw new BadRequestError("Provide role and/or membershipStatus");
  }

  const user = await getUserById(db, memberId);
  if (!user) {
    throw new NotFoundError("Member not found");
  }

  let updatedUser = user;
  if (patch.role && patch.role !== user.role) {
    updatedUser = await db.user.update({
      where: { id: memberId },
      data: { role: patch.role },
    });
  }

  let membership = await getLatestMembership(db, memberId);
  if (patch.membershipStatus) {
    if (!membership) {
      throw new BadRequestError(
        "This member has no membership record to update"
      );
    }
    assertMembershipTransition(membership.status, patch.membershipStatus);
    if (membership.status !== patch.membershipStatus) {
      membership = await db.membership.update({
        where: { id: membership.id },
        data: { status: patch.membershipStatus },
      });
    }
  }

  return serializeMemberRecord(updatedUser, membership);
}
