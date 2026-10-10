import assert from "node:assert/strict";
import { test } from "node:test";
import * as jose from "jose";
import { env } from "./config/env";
import { AppError } from "./lib/errors";
import { verifyAccessToken } from "./lib/jwt";

test("HS256 access tokens verify against the configured secret only", async () => {
  const previousSecret = env.supabaseJwtSecret;
  const previousIssuer = env.jwtIssuer;
  const secretValue = "configured-test-secret-not-a-product-default";
  env.supabaseJwtSecret = secretValue;
  env.jwtIssuer = undefined;

  try {
    const secret = new TextEncoder().encode(secretValue);
    const sub = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const token = await new jose.SignJWT({ email: "user@campus.test" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(sub)
      .setAudience(env.jwtAudience)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const claims = await verifyAccessToken(token);
    assert.equal(claims.sub, sub);
    assert.equal(claims.email, "user@campus.test");

    const other = await new jose.SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(sub)
      .setAudience(env.jwtAudience)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("some-other-secret"));

    await assert.rejects(() => verifyAccessToken(other), (err: unknown) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 401);
      return true;
    });
  } finally {
    env.supabaseJwtSecret = previousSecret;
    env.jwtIssuer = previousIssuer;
  }
});
