import dotenv from "dotenv";
import path from "node:path";

// Load backend/.env whether we run from TypeScript (src/) or compiled JS (dist/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
};
