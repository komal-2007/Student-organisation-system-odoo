import { MembershipStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { adminUpdateMember, listMembers } from "../services/users";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const patchBodySchema = z
  .object({
    role: z.enum([UserRole.STUDENT, UserRole.ADMIN, UserRole.TREASURER]).optional(),
    membershipStatus: z
      .enum([
        MembershipStatus.PENDING,
        MembershipStatus.ACTIVE,
        MembershipStatus.EXPIRED,
        MembershipStatus.CANCELLED,
      ])
      .optional(),
  })
  .strict();

export function createAdminMembersRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate, requireCurrentUser, requireRole("ADMIN", "TREASURER"));

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const result = await listMembers(deps.prisma);
      res.status(200).json(result);
    })
  );

  router.patch(
    "/:id",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id || !UUID_RE.test(id)) {
        throw new BadRequestError("Member id must be a UUID");
      }

      const body = patchBodySchema.parse(req.body ?? {});
      if (!body.role && !body.membershipStatus) {
        throw new BadRequestError("Provide role and/or membershipStatus");
      }

      const member = await adminUpdateMember(
        deps.prisma,
        req.currentUser!,
        id,
        body
      );
      res.status(200).json({ member });
    })
  );

  return router;
}
