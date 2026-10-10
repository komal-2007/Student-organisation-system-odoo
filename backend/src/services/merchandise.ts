import { Prisma, type User } from "@prisma/client";
import type { SkylineDb } from "../lib/db";
import { BadRequestError, ConflictError, NotFoundError } from "../lib/errors";
import { serializePayment } from "../lib/serialize";

const MAX_MONEY = new Prisma.Decimal("9999999999.99");

export async function listProducts(db: SkylineDb) {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      variants: {
        orderBy: { size: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        sku: variant.sku,
        price: variant.price.toString(),
        stockQty: variant.stockQty,
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })),
  };
}

export async function createMerchandiseOrder(
  db: SkylineDb,
  buyer: Pick<User, "id">,
  requestedItems: { variantId: string; quantity: number }[]
) {
  if (requestedItems.length === 0) {
    throw new BadRequestError("At least one merchandise item is required");
  }
  if (
    requestedItems.some(
      ({ quantity }) =>
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 2_147_483_647
    )
  ) {
    throw new BadRequestError("Each quantity must be a positive integer");
  }

  const variantIds = requestedItems.map((item) => item.variantId);
  if (new Set(variantIds).size !== variantIds.length) {
    throw new BadRequestError("Each variant may only appear once per order");
  }

  try {
    return await db.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
          product: { isActive: true },
        },
        include: { product: true },
      });
      const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
      if (variants.length !== variantIds.length) {
        throw new NotFoundError("One or more product variants were not found");
      }

      const items = requestedItems.map((item) => {
        const variant = variantsById.get(item.variantId);
        if (!variant) {
          throw new NotFoundError("One or more product variants were not found");
        }
        if (variant.price.lt(0)) {
          throw new BadRequestError("Product prices cannot be negative");
        }
        return { ...item, variant };
      });

      const totalAmount = items.reduce(
        (total, item) =>
          total.add(item.variant.price.mul(item.quantity)),
        new Prisma.Decimal(0)
      );
      if (totalAmount.gt(MAX_MONEY)) {
        throw new BadRequestError("Order total exceeds the supported amount");
      }

      for (const item of [...items].sort((a, b) =>
        a.variant.id.localeCompare(b.variant.id)
      )) {
        const reservation = await tx.productVariant.updateMany({
          where: {
            id: item.variant.id,
            stockQty: { gte: item.quantity },
          },
          data: { stockQty: { decrement: item.quantity } },
        });
        if (reservation.count !== 1) {
          throw new ConflictError(
            `Insufficient stock for ${item.variant.product.name} (${item.variant.size})`,
            {
              variantId: item.variant.id,
              requested: item.quantity,
            }
          );
        }
      }

      const isFree = totalAmount.isZero();
      const payment = isFree
        ? null
        : await tx.payment.create({
            data: {
              userId: buyer.id,
              amount: totalAmount,
              currency: "INR",
              status: "PENDING",
              method: "ONLINE",
              purpose: "MERCHANDISE",
              paidAt: null,
            },
          });

      const order = await tx.merchandiseOrder.create({
        data: {
          userId: buyer.id,
          status: isFree ? "PAID" : "PENDING",
          totalAmount,
          paymentId: payment?.id ?? null,
        },
      });

      const orderItems = [];
      for (const item of items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variant.id,
            quantity: item.quantity,
            unitPrice: item.variant.price,
          },
        });
        orderItems.push({
          id: orderItem.id,
          variantId: item.variant.id,
          productName: item.variant.product.name,
          size: item.variant.size,
          sku: item.variant.sku,
          quantity: item.quantity,
          unitPrice: item.variant.price.toString(),
        });

        if (isFree) {
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variant.id,
              quantityDelta: -item.quantity,
              reason: "SALE",
              orderItemId: orderItem.id,
              createdById: buyer.id,
            },
          });
        }
      }

      return {
        order: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount.toString(),
          paymentId: order.paymentId,
          items: orderItems,
          createdAt: order.createdAt.toISOString(),
        },
        payment: payment ? serializePayment(payment) : null,
        paymentNote: payment
          ? "Payment recorded as PENDING. No payment has been processed or confirmed. Stock is reserved until payment completes or fails."
          : "No payment record was created because the order total is zero.",
      };
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("This merchandise order has already been recorded");
    }
    throw err;
  }
}
