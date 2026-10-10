import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import { getAnnouncement, listAnnouncements } from "../services/announcements";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readUuidParam(value: string | string[] | undefined, label: string) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestError(`${label} must be a UUID`);
  }
  return id;
}

export function createAnnouncementsRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate, requireCurrentUser);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const result = await listAnnouncements(deps.prisma, req.currentUser!);
      res.status(200).json(result);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Announcement id");
      const result = await getAnnouncement(deps.prisma, req.currentUser!, id);
      res.status(200).json(result);
    })
  );

  return router;
}
