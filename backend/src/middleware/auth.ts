import type { NextFunction, Request, Response } from "express";
import type { SkylineDb } from "../lib/db";
import type { VerifyAccessToken } from "../lib/jwt";
import { AppError, NotFoundError, UnauthorizedError } from "../lib/errors";
import { getUserById } from "../services/users";

function readBearerToken(req: Request): string | undefined {
  const header = req.header("authorization");
  if (!header) {
    return undefined;
  }
  const match = header.match(/^Bearer\s+(\S+)/i);
  return match?.[1];
}

export function createAuthenticate(deps: {
  verifyAccessToken: VerifyAccessToken;
  prisma: SkylineDb;
}) {
  return async function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      const token = readBearerToken(req);
      if (!token) {
        throw new UnauthorizedError("Missing bearer access token");
      }

      let claims;
      try {
        claims = await deps.verifyAccessToken(token);
      } catch (err) {
        if (err instanceof AppError) {
          throw err;
        }
        throw new UnauthorizedError("Invalid or unverifiable access token");
      }
      req.auth = claims;

      const user = await getUserById(deps.prisma, claims.sub);
      if (user) {
        req.currentUser = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          studentId: user.studentId,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireCurrentUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.currentUser) {
    next(
      new NotFoundError(
        "Authenticated identity is not linked to an application user"
      )
    );
    return;
  }
  next();
}
