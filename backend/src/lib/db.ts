import type { Prisma, PrismaClient } from "@prisma/client";

export type SkylineDb = {
  user: {
    findUnique: PrismaClient["user"]["findUnique"];
    findMany: PrismaClient["user"]["findMany"];
    update: PrismaClient["user"]["update"];
  };
  membership: {
    findFirst: PrismaClient["membership"]["findFirst"];
    findMany: PrismaClient["membership"]["findMany"];
    create: PrismaClient["membership"]["create"];
    update: PrismaClient["membership"]["update"];
  };
  payment: {
    create: PrismaClient["payment"]["create"];
    findMany: PrismaClient["payment"]["findMany"];
    findUnique: PrismaClient["payment"]["findUnique"];
    findFirst: PrismaClient["payment"]["findFirst"];
    update: PrismaClient["payment"]["update"];
    updateMany: PrismaClient["payment"]["updateMany"];
  };
  financialEntry: {
    create: PrismaClient["financialEntry"]["create"];
    findFirst: PrismaClient["financialEntry"]["findFirst"];
  };
  merchandiseOrder: {
    create: PrismaClient["merchandiseOrder"]["create"];
    findFirst: PrismaClient["merchandiseOrder"]["findFirst"];
    update: PrismaClient["merchandiseOrder"]["update"];
    updateMany: PrismaClient["merchandiseOrder"]["updateMany"];
  };
  product: {
    findMany: PrismaClient["product"]["findMany"];
  };
  productVariant: {
    findMany: PrismaClient["productVariant"]["findMany"];
    updateMany: PrismaClient["productVariant"]["updateMany"];
  };
  orderItem: {
    create: PrismaClient["orderItem"]["create"];
    findMany: PrismaClient["orderItem"]["findMany"];
  };
  inventoryMovement: {
    create: PrismaClient["inventoryMovement"]["create"];
  };
  event: {
    findUnique: PrismaClient["event"]["findUnique"];
    findMany: PrismaClient["event"]["findMany"];
    create: PrismaClient["event"]["create"];
    update: PrismaClient["event"]["update"];
  };
  ticket: {
    findUnique: PrismaClient["ticket"]["findUnique"];
    findMany: PrismaClient["ticket"]["findMany"];
    create: PrismaClient["ticket"]["create"];
    update: PrismaClient["ticket"]["update"];
    updateMany: PrismaClient["ticket"]["updateMany"];
    count: PrismaClient["ticket"]["count"];
  };
  announcement: {
    findUnique: PrismaClient["announcement"]["findUnique"];
    findMany: PrismaClient["announcement"]["findMany"];
    create: PrismaClient["announcement"]["create"];
    update: PrismaClient["announcement"]["update"];
  };
  $transaction: PrismaClient["$transaction"];
};

export type TransactionClient = Prisma.TransactionClient;
