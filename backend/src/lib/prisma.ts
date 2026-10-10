import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) {
    if (!env.databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const adapter = new PrismaPg({ connectionString: env.databaseUrl });
    client = new PrismaClient({ adapter });
  }
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const value = Reflect.get(getPrisma(), prop, getPrisma());
    if (typeof value === "function") {
      return value.bind(getPrisma());
    }
    return value;
  },
});
