import { PaymentMethod } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import { getEvent, listEvents } from "../services/events";
import { purchaseTickets } from "../services/tickets";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const purchaseBodySchema = z
  .object({
    method: z.enum([
      PaymentMethod.CASH,
      PaymentMethod.CARD,
      PaymentMethod.ONLINE,
      PaymentMethod.OTHER,
    ]),
    quantity: z.number().int().min(1).max(20).optional(),
    idempotencyKey: z.string().min(8).max(120).optional(),
  })
  .strict();

function readUuidParam(value: string | string[] | undefined, label: string) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestError(`${label} must be a UUID`);
  }
  return id;
}

export function createEventsRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const result = await listEvents(deps.prisma, req.currentUser?.id);
      res.status(200).json(result);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Event id");
      const result = await getEvent(deps.prisma, id, req.currentUser?.id);
      res.status(200).json(result);
    })
  );

  router.post(
    "/:id/tickets",
    requireCurrentUser,
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Event id");
      const body = purchaseBodySchema.parse(req.body ?? {});
      const result = await purchaseTickets(deps.prisma, req.currentUser!, id, {
        method: body.method,
        quantity: body.quantity ?? 1,
        idempotencyKey: body.idempotencyKey,
      });
      res.status(201).json(result);
    })
  );

  return router;
}
