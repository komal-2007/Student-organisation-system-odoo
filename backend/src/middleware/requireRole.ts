import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (!allowed.includes(req.currentUser.role)) {
      next(new ForbiddenError("Insufficient role for this resource"));
      return;
    }

    next();
  };
}
