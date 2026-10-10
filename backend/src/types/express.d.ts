import type { UserRole } from "@prisma/client";
import type { AccessTokenClaims } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenClaims;
      currentUser?: {
        id: string;
        email: string;
        fullName: string;
        studentId: string | null;
        phone: string | null;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
