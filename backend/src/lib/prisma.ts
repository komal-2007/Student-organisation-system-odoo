import { env } from '../config/env';

let prismaInstance: any = null;

export function getPrisma() {
  if (!prismaInstance && env.databaseUrl) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const { PrismaPg } = require('@prisma/adapter-pg');
      const adapter = new PrismaPg({ connectionString: env.databaseUrl });
      prismaInstance = new PrismaClient({ adapter });
    } catch (e) {
      console.warn('Prisma adapter initialization warning:', e);
    }
  }
  return prismaInstance;
}

export const prisma = getPrisma();
