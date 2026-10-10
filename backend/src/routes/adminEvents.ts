import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  createEvent,
  parseEventMoney,
  updateEvent,
} from "../services/events";
import { listEventTickets, validateTicket } from "../services/tickets";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const moneyString = z.string().regex(/^\d+(\.\d{1,2})?$/);

const createBodySchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).nullable().optional(),
    location: z.string().max(300).nullable().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    capacity: z.number().int().min(0),
    memberPrice: moneyString,
    nonMemberPrice: moneyString,
  })
  .strict();

const patchBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    location: z.string().max(300).nullable().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    capacity: z.number().int().min(0).optional(),
    memberPrice: moneyString.optional(),
    nonMemberPrice: moneyString.optional(),
    cancel: z.boolean().optional(),
  })
  .strict();

const validateBodySchema = z
  .object({
    validationCode: z.string().min(8).max(120),
  })
  .strict();

function readUuidParam(value: string | string[] | undefined, label: string) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestError(`${label} must be a UUID`);
  }
  return id;
}

export function createAdminEventsRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate, requireCurrentUser, requireRole("ADMIN", "TREASURER"));

  router.post(
    "/",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const body = createBodySchema.parse(req.body ?? {});
      const result = await createEvent(deps.prisma, req.currentUser!, {
        title: body.title,
        description: body.description,
        location: body.location,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        capacity: body.capacity,
        memberPrice: parseEventMoney(body.memberPrice, "memberPrice"),
        nonMemberPrice: parseEventMoney(body.nonMemberPrice, "nonMemberPrice"),
      });
      res.status(201).json(result);
    })
  );

  router.patch(
    "/:id",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Event id");
      const body = patchBodySchema.parse(req.body ?? {});
      if (Object.keys(body).length === 0) {
        throw new BadRequestError("Provide at least one field to update");
      }
      const result = await updateEvent(deps.prisma, id, {
        ...body,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        memberPrice: body.memberPrice
          ? parseEventMoney(body.memberPrice, "memberPrice")
          : undefined,
        nonMemberPrice: body.nonMemberPrice
          ? parseEventMoney(body.nonMemberPrice, "nonMemberPrice")
          : undefined,
      });
      res.status(200).json(result);
    })
  );

  router.get(
    "/:id/tickets",
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Event id");
      const result = await listEventTickets(deps.prisma, id);
      res.status(200).json(result);
    })
  );

  router.post(
    "/:id/tickets/validate",
    requireRole("ADMIN"),
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Event id");
      const body = validateBodySchema.parse(req.body ?? {});
      const result = await validateTicket(
        deps.prisma,
        req.currentUser!,
        id,
        body.validationCode
      );
      res.status(200).json(result);
    })
  );

  return router;
}
