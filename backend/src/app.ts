import cors from "cors";
import express from "express";
import { env } from "./config/env";
import type { SkylineDb } from "./lib/db";
import { verifyAccessToken, type VerifyAccessToken } from "./lib/jwt";
import { prisma } from "./lib/prisma";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createAdminAnnouncementsRouter } from "./routes/adminAnnouncements";
import { createAdminEventsRouter } from "./routes/adminEvents";
import { createAdminMembersRouter } from "./routes/adminMembers";
import { createAnnouncementsRouter } from "./routes/announcements";
import { createEventsRouter } from "./routes/events";
import { healthRouter } from "./routes/health";
import { createMeRouter } from "./routes/me";

export type AppDeps = {
  prisma?: SkylineDb;
  verifyAccessToken?: VerifyAccessToken;
};

export function createApp(deps: AppDeps = {}) {
  const db = deps.prisma ?? prisma;
  const verify = deps.verifyAccessToken ?? verifyAccessToken;
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin ?? false,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/health", healthRouter);
  app.use("/api/me", createMeRouter({ prisma: db, verifyAccessToken: verify }));
  app.use("/api/events", createEventsRouter({ prisma: db, verifyAccessToken: verify }));
  app.use(
    "/api/announcements",
    createAnnouncementsRouter({ prisma: db, verifyAccessToken: verify })
  );
  app.use(
    "/api/admin/members",
    createAdminMembersRouter({ prisma: db, verifyAccessToken: verify })
  );
  app.use(
    "/api/admin/events",
    createAdminEventsRouter({ prisma: db, verifyAccessToken: verify })
  );
  app.use(
    "/api/admin/announcements",
    createAdminAnnouncementsRouter({ prisma: db, verifyAccessToken: verify })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
