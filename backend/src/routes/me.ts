import { PaymentMethod } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import type { VerifyAccessToken } from "../lib/jwt";
import { renewMembership } from "../services/memberships";
import { listMyTickets } from "../services/tickets";
import { getProfile } from "../services/users";

const renewBodySchema = z.object({
  method: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.ONLINE,
    PaymentMethod.OTHER,
  ]),
});

export function createMeRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.get(
    "/profile",
    authenticate,
    asyncHandler(async (req, res) => {
      const profile = await getProfile(deps.prisma, req.auth!.sub);
      res.status(200).json(profile);
    })
  );

  router.post(
    "/memberships/renew",
    authenticate,
    requireCurrentUser,
    asyncHandler(async (req, res) => {
      const body = renewBodySchema.parse(req.body);
      const result = await renewMembership(
        deps.prisma,
        req.currentUser!.id,
        body.method
      );
      res.status(201).json(result);
    })
  );

  router.get(
    "/tickets",
    authenticate,
    requireCurrentUser,
    asyncHandler(async (req, res) => {
      const result = await listMyTickets(deps.prisma, req.currentUser!.id);
      res.status(200).json(result);
    })
  );

  return router;
}
