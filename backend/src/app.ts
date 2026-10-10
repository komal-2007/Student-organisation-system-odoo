import cors from "cors";
import express from "express";
import { env } from "./config/env";
import type { SkylineDb } from "./lib/db";
import { verifyAccessToken, type VerifyAccessToken } from "./lib/jwt";
import { prisma } from "./lib/prisma";
import {
  createRazorpayGateway,
  type RazorpayGateway,
} from "./lib/razorpay";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { createAdminAnnouncementsRouter } from "./routes/adminAnnouncements";
import { createAdminEventsRouter } from "./routes/adminEvents";
import { createAdminMembersRouter } from "./routes/adminMembers";
import { createAnnouncementsRouter } from "./routes/announcements";
import { createEventsRouter } from "./routes/events";
import { healthRouter } from "./routes/health";
import { createMerchandiseRouter } from "./routes/merchandise";
import { createMeRouter } from "./routes/me";
import { createPaymentsRouter } from "./routes/payments";
import { createRazorpayWebhookRouter } from "./routes/razorpayWebhook";

export type AppDeps = {
  prisma?: SkylineDb;
  verifyAccessToken?: VerifyAccessToken;
  razorpay?: RazorpayGateway;
};

export function createApp(deps: AppDeps = {}) {
  const db = deps.prisma ?? prisma;
  const verify = deps.verifyAccessToken ?? verifyAccessToken;
  const razorpay = deps.razorpay ?? createRazorpayGateway();
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin ?? false,
      credentials: true,
    })
  );

  // Signature verification needs the exact raw body. Mount this before JSON parsing.
  app.use(
    "/api/webhooks/razorpay",
    express.raw({ type: "application/json" }),
    createRazorpayWebhookRouter({ prisma: db })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/health", healthRouter);
  app.use("/api/me", createMeRouter({ prisma: db, verifyAccessToken: verify }));
  app.use(
    "/api/merchandise",
    createMerchandiseRouter({ prisma: db, verifyAccessToken: verify })
  );
  app.use(
    "/api/payments",
    createPaymentsRouter({
      prisma: db,
      verifyAccessToken: verify,
      razorpay,
    })
  );
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
