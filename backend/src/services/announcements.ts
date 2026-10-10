import type { Announcement, AnnouncementStatus, User } from "@prisma/client";
import type { SkylineDb } from "../lib/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../lib/errors";
import { serializeAnnouncement } from "../lib/serialize";
import { getCurrentActiveMembership } from "./users";

const STATUS_TRANSITIONS: Record<AnnouncementStatus, AnnouncementStatus[]> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
};

export type AnnouncementActor = Pick<User, "id" | "role">;

function assertStatusTransition(from: AnnouncementStatus, to: AnnouncementStatus) {
  if (from === to) {
    return;
  }
  const allowed = STATUS_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestError(
      `Cannot change announcement status from ${from} to ${to}`,
      { from, to, allowed }
    );
  }
}

export async function canViewMemberAnnouncements(
  db: SkylineDb,
  actor: AnnouncementActor
): Promise<boolean> {
  if (actor.role === "ADMIN") {
    return true;
  }
  const membership = await getCurrentActiveMembership(db, actor.id);
  return Boolean(membership);
}

function isVisibleTo(
  announcement: Announcement,
  actor: AnnouncementActor
): boolean {
  if (actor.role === "ADMIN") {
    return true;
  }
  return announcement.status === "PUBLISHED";
}

export async function listAnnouncements(db: SkylineDb, actor: AnnouncementActor) {
  const permitted = await canViewMemberAnnouncements(db, actor);
  if (!permitted) {
    throw new ForbiddenError(
      "An active membership is required to view announcements"
    );
  }

  const announcements = await db.announcement.findMany({
    where: actor.role === "ADMIN" ? undefined : { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return {
    announcements: announcements.map(serializeAnnouncement),
  };
}

export async function getAnnouncement(
  db: SkylineDb,
  actor: AnnouncementActor,
  id: string
) {
  const permitted = await canViewMemberAnnouncements(db, actor);
  if (!permitted) {
    throw new ForbiddenError(
      "An active membership is required to view announcements"
    );
  }

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement || !isVisibleTo(announcement, actor)) {
    throw new NotFoundError("Announcement not found");
  }

  return { announcement: serializeAnnouncement(announcement) };
}

export async function createAnnouncement(
  db: SkylineDb,
  actor: AnnouncementActor,
  input: { title: string; body: string; status?: AnnouncementStatus }
) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("Only admins may create announcements");
  }

  const status = input.status ?? "DRAFT";
  const now = new Date();
  const announcement = await db.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      status,
      createdById: actor.id,
      publishedAt: status === "PUBLISHED" ? now : null,
    },
  });

  return { announcement: serializeAnnouncement(announcement) };
}

export async function updateAnnouncement(
  db: SkylineDb,
  actor: AnnouncementActor,
  id: string,
  patch: { title?: string; body?: string; status?: AnnouncementStatus }
) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("Only admins may update announcements");
  }

  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement) {
    throw new NotFoundError("Announcement not found");
  }

  if (patch.status) {
    assertStatusTransition(announcement.status, patch.status);
  }

  let publishedAt = announcement.publishedAt;
  const nextStatus = patch.status ?? announcement.status;
  if (nextStatus === "PUBLISHED" && !publishedAt) {
    publishedAt = new Date();
  }

  const updated = await db.announcement.update({
    where: { id },
    data: {
      title: patch.title ?? announcement.title,
      body: patch.body ?? announcement.body,
      status: nextStatus,
      publishedAt,
    },
  });

  return { announcement: serializeAnnouncement(updated) };
}
