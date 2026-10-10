import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import {
  env,
  isRazorpayConfigured,
  isRazorpayWebhookConfigured,
} from "../config/env";
import { BadRequestError, ServiceUnavailableError } from "./errors";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string | null;
  status?: string;
};

export type RazorpayPayment = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
};

export type RazorpayGateway = {
  createOrder: (input: {
    amountPaise: number;
    currency: string;
    receipt: string;
    notes: Record<string, string>;
  }) => Promise<RazorpayOrder>;
  fetchPayment: (razorpayPaymentId: string) => Promise<RazorpayPayment>;
};

export function amountToPaise(amount: Prisma.Decimal | string | number): number {
  const decimal = amount instanceof Prisma.Decimal ? amount : new Prisma.Decimal(amount);
  const paise = decimal.mul(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
  return paise.toNumber();
}

function hmacSha256Hex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function signaturesMatch(expectedHex: string, provided: string): boolean {
  const expected = Buffer.from(expectedHex, "utf8");
  const actual = Buffer.from(provided, "utf8");
  if (expected.length !== actual.length) {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): void {
  const secret = input.secret ?? env.razorpayKeySecret;
  if (!secret) {
    throw new ServiceUnavailableError(
      "Razorpay is not configured. Set RAZORPAY_KEY_SECRET."
    );
  }
  const expected = hmacSha256Hex(secret, `${input.orderId}|${input.paymentId}`);
  if (!signaturesMatch(expected, input.signature)) {
    throw new BadRequestError("Invalid Razorpay checkout signature");
  }
}

export function verifyWebhookSignature(input: {
  rawBody: string | Buffer;
  signature: string | undefined;
  secret?: string;
}): void {
  const secret = input.secret ?? env.razorpayWebhookSecret;
  if (!secret) {
    throw new ServiceUnavailableError(
      "Razorpay webhooks are not configured. Set RAZORPAY_WEBHOOK_SECRET."
    );
  }
  if (!input.signature) {
    throw new BadRequestError("Missing Razorpay webhook signature");
  }
  const payload =
    typeof input.rawBody === "string"
      ? input.rawBody
      : input.rawBody.toString("utf8");
  const expected = hmacSha256Hex(secret, payload);
  if (!signaturesMatch(expected, input.signature)) {
    throw new BadRequestError("Invalid Razorpay webhook signature");
  }
}

function basicAuthHeader(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export function createRazorpayGateway(): RazorpayGateway {
  return {
    async createOrder(input) {
      if (!isRazorpayConfigured() || !env.razorpayKeyId || !env.razorpayKeySecret) {
        throw new ServiceUnavailableError(
          "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        );
      }
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: basicAuthHeader(env.razorpayKeyId, env.razorpayKeySecret),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: input.amountPaise,
          currency: input.currency,
          receipt: input.receipt,
          notes: input.notes,
          payment_capture: 1,
        }),
      });
      if (!response.ok) {
        throw new ServiceUnavailableError("Unable to create Razorpay order");
      }
      const body = (await response.json()) as {
        id: string;
        amount: number;
        currency: string;
        receipt?: string;
        status?: string;
      };
      return {
        id: body.id,
        amount: body.amount,
        currency: body.currency,
        receipt: body.receipt,
        status: body.status,
      };
    },
    async fetchPayment(razorpayPaymentId) {
      if (!isRazorpayConfigured() || !env.razorpayKeyId || !env.razorpayKeySecret) {
        throw new ServiceUnavailableError(
          "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        );
      }
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
        {
          headers: {
            Authorization: basicAuthHeader(env.razorpayKeyId, env.razorpayKeySecret),
          },
        }
      );
      if (!response.ok) {
        throw new BadRequestError("Razorpay payment could not be retrieved");
      }
      const body = (await response.json()) as {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, string>;
      };
      return {
        id: body.id,
        orderId: body.order_id,
        amount: body.amount,
        currency: body.currency,
        status: body.status,
        notes: body.notes,
      };
    },
  };
}

export { isRazorpayConfigured, isRazorpayWebhookConfigured };
