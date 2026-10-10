import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import type { SkylineDb } from "../lib/db";
import { BadRequestError } from "../lib/errors";
import { verifyWebhookSignature } from "../lib/razorpay";
import { applyRazorpayPaymentEntity } from "../services/payments";

type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

function readRawBody(req: { body: unknown }): string {
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }
  if (typeof req.body === "string") {
    return req.body;
  }
  throw new BadRequestError("Razorpay webhook body must be raw JSON");
}

export function createRazorpayWebhookRouter(deps: { prisma: SkylineDb }) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const rawBody = readRawBody(req);
      const signature = req.header("x-razorpay-signature");
      verifyWebhookSignature({ rawBody, signature });

      let parsed: RazorpayWebhookBody;
      try {
        parsed = JSON.parse(rawBody) as RazorpayWebhookBody;
      } catch {
        throw new BadRequestError("Razorpay webhook payload is not valid JSON");
      }

      const event = parsed.event;
      const entity = parsed.payload?.payment?.entity;
      if (!event) {
        throw new BadRequestError("Razorpay webhook is missing an event name");
      }

      if (event !== "payment.captured" && event !== "payment.failed") {
        res.status(200).json({ received: true, ignored: event });
        return;
      }

      if (
        !entity?.id ||
        !entity.order_id ||
        typeof entity.amount !== "number" ||
        !entity.currency ||
        !entity.status
      ) {
        throw new BadRequestError("Razorpay payment entity is incomplete");
      }

      const result = await applyRazorpayPaymentEntity(
        deps.prisma,
        {
          id: entity.id,
          orderId: entity.order_id,
          amount: entity.amount,
          currency: entity.currency,
          status: entity.status,
          notes: entity.notes,
        },
        event
      );

      res.status(200).json({ received: true, ...result });
    })
  );

  return router;
}
