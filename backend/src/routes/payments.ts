import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import type { VerifyAccessToken } from "../lib/jwt";
import type { RazorpayGateway } from "../lib/razorpay";
import { createAuthenticate, requireCurrentUser } from "../middleware/auth";
import {
  createRazorpayOrderForPayment,
  verifyRazorpayCheckout,
} from "../services/payments";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const verifyBodySchema = z
  .object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
  })
  .strict();

function readUuidParam(value: string | string[] | undefined, label: string) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestError(`${label} must be a UUID`);
  }
  return id;
}

export function createPaymentsRouter(deps: {
  prisma: SkylineDb;
  verifyAccessToken: VerifyAccessToken;
  razorpay: RazorpayGateway;
}) {
  const router = Router();
  const authenticate = createAuthenticate({
    prisma: deps.prisma,
    verifyAccessToken: deps.verifyAccessToken,
  });

  router.use(authenticate, requireCurrentUser);

  router.post(
    "/razorpay/verify",
    asyncHandler(async (req, res) => {
      const body = verifyBodySchema.parse(req.body ?? {});
      const result = await verifyRazorpayCheckout(
        deps.prisma,
        deps.razorpay,
        req.currentUser!.id,
        {
          orderId: body.razorpay_order_id,
          paymentId: body.razorpay_payment_id,
          signature: body.razorpay_signature,
        }
      );
      res.status(200).json(result);
    })
  );

  router.post(
    "/:id/razorpay/order",
    asyncHandler(async (req, res) => {
      const id = readUuidParam(req.params.id, "Payment id");
      const result = await createRazorpayOrderForPayment(
        deps.prisma,
        deps.razorpay,
        req.currentUser!.id,
        id
      );
      res.status(201).json(result);
    })
  );

  return router;
}
