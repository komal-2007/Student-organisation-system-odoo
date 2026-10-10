import dotenv from "dotenv";
import path from "node:path";

// Load backend/.env whether we run from TypeScript (src/) or compiled JS (dist/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function optional(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

const supabaseUrl = optional("SUPABASE_URL");
const explicitJwksUrl = optional("JWT_JWKS_URL");
const derivedJwksUrl = supabaseUrl
  ? `${trimTrailingSlash(supabaseUrl)}/auth/v1/.well-known/jwks.json`
  : undefined;
const derivedIssuer = supabaseUrl
  ? `${trimTrailingSlash(supabaseUrl)}/auth/v1`
  : undefined;

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: optional("DATABASE_URL") ?? "",
  directUrl: optional("DIRECT_URL") ?? "",
  corsOrigin: optional("CORS_ORIGIN"),
  supabaseUrl,
  supabaseJwtSecret: optional("SUPABASE_JWT_SECRET"),
  jwtJwksUrl: explicitJwksUrl ?? derivedJwksUrl,
  jwtIssuer: optional("JWT_ISSUER") ?? derivedIssuer,
  jwtAudience: optional("JWT_AUDIENCE") ?? "authenticated",
  membershipDuesAmount: optional("MEMBERSHIP_DUES_AMOUNT"),
  membershipPeriodDays: Number(optional("MEMBERSHIP_PERIOD_DAYS") ?? "365"),
  razorpayKeyId: optional("RAZORPAY_KEY_ID"),
  razorpayKeySecret: optional("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
};

export function isRazorpayConfigured(): boolean {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}

export function isRazorpayWebhookConfigured(): boolean {
  return Boolean(env.razorpayWebhookSecret);
}

export function isJwtVerificationConfigured(): boolean {
  return Boolean(env.supabaseJwtSecret || env.jwtJwksUrl);
}

export function validateRuntimeEnv(): void {
  const missing: string[] = [];

  if (!env.databaseUrl) {
    missing.push("DATABASE_URL");
  }
  if (!env.corsOrigin) {
    missing.push("CORS_ORIGIN");
  }
  if (!isJwtVerificationConfigured()) {
    missing.push("SUPABASE_JWT_SECRET or JWT_JWKS_URL or SUPABASE_URL");
  }
  if (Number.isNaN(env.membershipPeriodDays) || env.membershipPeriodDays <= 0) {
    missing.push("MEMBERSHIP_PERIOD_DAYS (must be a positive number)");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing or invalid required environment variable(s): ${missing.join(", ")}`
    );
  }
}
