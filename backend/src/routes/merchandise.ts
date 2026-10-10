import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import type { VerifyAccessToken } from "../lib/jwt";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import {
  createMerchandiseOrder,
  listProducts,
} from "../services/merchandise";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createOrderBodySchema = z
  .object({
    items: z
      .array(
        z
          .object({
            variantId: z.string().regex(UUID_RE, "variantId must be a UUID"),
            quantity: z.number().int().min(1),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export function createMerchandiseRouter(deps: {
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
    "/products",
    asyncHandler(async (_req, res) => {
      res.status(200).json(await listProducts(deps.prisma));
    })
  );

  router.post(
    "/orders",
    requireCurrentUser,
    asyncHandler(async (req, res) => {
      const body = createOrderBodySchema.parse(req.body ?? {});
      const result = await createMerchandiseOrder(
        deps.prisma,
        req.currentUser!,
        body.items
      );
      res.status(201).json(result);
    })
  );

  return router;
}
