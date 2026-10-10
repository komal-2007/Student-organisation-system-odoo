import { AnnouncementStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "../services/announcements";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const statusSchema = z.enum([
  AnnouncementStatus.DRAFT,
  AnnouncementStatus.PUBLISHED,
  AnnouncementStatus.ARCHIVED,
]);

const createBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(20000),
    status: statusSchema.optional(),
  })
  .strict();

const patchBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().min(1).max(20000).optional(),
    status: statusSchema.optional(),
  })
  .strict();

function readUuidParam(value: string | string[] | undefined, label: string) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestError(`${label} must be a UUID`);
  }
  return id;
}

export function createAdminAnnouncementsRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate, requireCurrentUser, requireRole("ADMIN"));

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const result = await listAnnouncements(deps.prisma, req.currentUser!);
      res.status(200).json(result);
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = createBodySchema.parse(req.body ?? {});
      const result = await createAnnouncement(deps.prisma, req.currentUser!, body);
      res.status(201).json(result);
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Announcement id");
      const body = patchBodySchema.parse(req.body ?? {});
      if (!body.title && !body.body && !body.status) {
        throw new BadRequestError("Provide title, body, and/or status");
      }
      const result = await updateAnnouncement(
        deps.prisma,
        req.currentUser!,
        id,
        body
      );
      res.status(200).json(result);
    })
  );

  return router;
}
