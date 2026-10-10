import * as jose from "jose";
import { env, isJwtVerificationConfigured } from "../config/env";
import { ServiceUnavailableError, UnauthorizedError } from "./errors";

export type AccessTokenClaims = {
  sub: string;
  email?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let remoteJwks: ReturnType<typeof jose.createRemoteJWKSet> | undefined;

export type VerifyAccessToken = (token: string) => Promise<AccessTokenClaims>;

function getRemoteJwks() {
  if (!env.jwtJwksUrl) {
    throw new UnauthorizedError("Invalid or unverifiable access token");
  }
  if (!remoteJwks) {
    remoteJwks = jose.createRemoteJWKSet(new URL(env.jwtJwksUrl));
  }
  return remoteJwks;
}

function verifyOptions(): jose.JWTVerifyOptions {
  const options: jose.JWTVerifyOptions = {
    clockTolerance: 5,
    audience: env.jwtAudience,
  };
  if (env.jwtIssuer) {
    options.issuer = env.jwtIssuer;
  }
  return options;
}

function claimsFromPayload(payload: jose.JWTPayload): AccessTokenClaims {
  if (!payload.sub || !UUID_RE.test(payload.sub)) {
    throw new UnauthorizedError("Access token is missing a valid subject");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}

export const verifyAccessToken: VerifyAccessToken = async (token) => {
  if (!isJwtVerificationConfigured()) {
    throw new ServiceUnavailableError(
      "Authentication is not configured. Set SUPABASE_URL (JWKS) and/or SUPABASE_JWT_SECRET."
    );
  }

  let header: jose.ProtectedHeaderParameters;
  try {
    header = jose.decodeProtectedHeader(token);
  } catch {
    throw new UnauthorizedError("Invalid or unverifiable access token");
  }

  const alg = header.alg;
  const options = verifyOptions();

  try {
    if (alg === "HS256") {
      if (!env.supabaseJwtSecret) {
        throw new UnauthorizedError("Invalid or unverifiable access token");
      }
      const secret = new TextEncoder().encode(env.supabaseJwtSecret);
      const { payload } = await jose.jwtVerify(token, secret, {
        ...options,
        algorithms: ["HS256"],
      });
      return claimsFromPayload(payload);
    }

    if (!env.jwtJwksUrl) {
      throw new UnauthorizedError("Invalid or unverifiable access token");
    }

    const { payload } = await jose.jwtVerify(token, getRemoteJwks(), options);
    return claimsFromPayload(payload);
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ServiceUnavailableError) {
      throw err;
    }
    throw new UnauthorizedError("Invalid or unverifiable access token");
  }
};
