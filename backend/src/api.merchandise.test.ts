import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import {
  FinancialEntryType,
  InventoryReason,
  OrderStatus,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  UserRole,
  type FinancialEntry,
  type InventoryMovement,
  type MerchandiseOrder,
  type OrderItem,
  type Payment,
  type Product,
  type ProductVariant,
  type User,
} from "@prisma/client";
import * as jose from "jose";
import { createApp } from "./app";
import { env } from "./config/env";
import type { SkylineDb } from "./lib/db";
import type { RazorpayGateway } from "./lib/razorpay";

const TEST_SECRET = new TextEncoder().encode(
  "unit-test-access-token-secret-not-used-in-production"
);
const CHECKOUT_SECRET = "rzp_test_checkout_secret";
const WEBHOOK_SECRET = "rzp_test_webhook_secret";
const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "44444444-4444-4444-8444-444444444444";
const PRODUCT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const VARIANT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OTHER_VARIANT_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const INACTIVE_PRODUCT_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const INACTIVE_VARIANT_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

async function signToken(sub: string) {
  return new jose.SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(TEST_SECRET);
}

const testVerifyAccessToken = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, TEST_SECRET, {
    algorithms: ["HS256"],
    audience: "authenticated",
  });
  if (!payload.sub) throw new Error("missing sub");
  return { sub: payload.sub };
};

function seedUser(id: string): User {
  const now = new Date("2026-10-10T00:00:00.000Z");
  return {
    id,
    email: `${id}@campus.test`,
    fullName: "Merchandise Buyer",
    studentId: null,
    phone: null,
    role: UserRole.STUDENT,
    createdAt: now,
    updatedAt: now,
  };
}

function seedProduct(id: string, isActive: boolean, name: string): Product {
  const now = new Date("2026-10-01T00:00:00.000Z");
  return {
    id,
    name,
    description: `${name} description`,
    isActive,
    createdAt: now,
    updatedAt: now,
  };
}

function seedVariant(input: {
  id: string;
  productId: string;
  size: string;
  price: string;
  stockQty: number;
}): ProductVariant {
  return {
    id: input.id,
    productId: input.productId,
    size: input.size,
    sku: `SKU-${input.size}`,
    price: new Prisma.Decimal(input.price),
    stockQty: input.stockQty,
  };
}

function createMemoryDb() {
  const users = new Map(
    [seedUser(STUDENT_ID), seedUser(OTHER_ID)].map((row) => [row.id, row])
  );
  const products = new Map(
    [
      seedProduct(PRODUCT_ID, true, "Skyline Hoodie"),
      seedProduct(INACTIVE_PRODUCT_ID, false, "Hidden Product"),
    ].map((row) => [row.id, row])
  );
  const variants = new Map(
    [
      seedVariant({
        id: VARIANT_ID,
        productId: PRODUCT_ID,
        size: "M",
        price: "19.99",
        stockQty: 5,
      }),
      seedVariant({
        id: OTHER_VARIANT_ID,
        productId: PRODUCT_ID,
        size: "L",
        price: "0.00",
        stockQty: 2,
      }),
      seedVariant({
        id: INACTIVE_VARIANT_ID,
        productId: INACTIVE_PRODUCT_ID,
        size: "S",
        price: "10.00",
        stockQty: 8,
      }),
    ].map((row) => [row.id, row])
  );
  const payments = new Map<string, Payment>();
  const orders = new Map<string, MerchandiseOrder>();
  const orderItems = new Map<string, OrderItem>();
  const movements = new Map<string, InventoryMovement>();
  const financialEntries = new Map<string, FinancialEntry>();
  let nextId = 1;
  let nextLedgerId = 1;
  let currentRazorpayOrder = "order_merchandiseCheckout";
  let currentRazorpayAmount = 0;
  const id = () =>
    `99999999-9999-4999-8999-${String(nextId++).padStart(12, "0")}`;

  const db = {
    user: {
      async findUnique({ where }: { where: { id: string } }) {
        return users.get(where.id) ?? null;
      },
      async findMany() {
        return [...users.values()];
      },
      async update() {
        throw new Error("unused");
      },
    },
    product: {
      async findMany({ where }: { where: { isActive: boolean } }) {
        return [...products.values()]
          .filter((product) => product.isActive === where.isActive)
          .map((product) => ({
            ...product,
            variants: [...variants.values()]
              .filter((variant) => variant.productId === product.id)
              .sort((a, b) => a.size.localeCompare(b.size)),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
    },
    productVariant: {
      async findMany({
        where,
      }: {
        where: { id: { in: string[] }; product: { isActive: boolean } };
      }) {
        const ids = new Set(where.id.in);
        return [...variants.values()]
          .filter((variant) => {
            const product = products.get(variant.productId);
            return (
              ids.has(variant.id) &&
              product?.isActive === where.product.isActive
            );
          })
          .map((variant) => ({
            ...variant,
            product: products.get(variant.productId)!,
          }));
      },
      async updateMany({
        where,
        data,
      }: {
        where: { id: string; stockQty?: { gte: number } };
        data: { stockQty: { decrement?: number; increment?: number } };
      }) {
        const variant = variants.get(where.id);
        if (
          !variant ||
          (where.stockQty && variant.stockQty < where.stockQty.gte)
        ) {
          return { count: 0 };
        }
        const delta =
          data.stockQty.increment !== undefined
            ? data.stockQty.increment
            : -(data.stockQty.decrement ?? 0);
        variants.set(where.id, { ...variant, stockQty: variant.stockQty + delta });
        return { count: 1 };
      },
    },
    payment: {
      async create({ data }: { data: Record<string, unknown> }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: Payment = {
          id: id(),
          userId: data.userId as string,
          amount: data.amount as Prisma.Decimal,
          currency: data.currency as string,
          status: data.status as PaymentStatus,
          method: data.method as PaymentMethod,
          purpose: data.purpose as PaymentPurpose,
          externalRef: (data.externalRef as string | null | undefined) ?? null,
          paidAt: (data.paidAt as Date | null | undefined) ?? null,
          createdAt: now,
          updatedAt: now,
        };
        payments.set(row.id, row);
        return row;
      },
      async findUnique({ where }: { where: { id: string } }) {
        return payments.get(where.id) ?? null;
      },
      async findFirst({ where }: { where: { externalRef?: string } }) {
        return (
          [...payments.values()].find(
            (payment) => payment.externalRef === where.externalRef
          ) ?? null
        );
      },
      async findMany() {
        return [...payments.values()];
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Payment>;
      }) {
        const current = payments.get(where.id);
        if (!current) throw new Error("payment not found");
        const updated = { ...current, ...data, updatedAt: new Date() };
        payments.set(where.id, updated);
        return updated;
      },
      async updateMany({
        where,
        data,
      }: {
        where: { id: string; status: PaymentStatus };
        data: Partial<Payment>;
      }) {
        const current = payments.get(where.id);
        if (!current || current.status !== where.status) return { count: 0 };
        payments.set(where.id, { ...current, ...data, updatedAt: new Date() });
        return { count: 1 };
      },
    },
    financialEntry: {
      async findFirst({
        where,
      }: {
        where: { paymentId?: string; type?: FinancialEntryType };
      }) {
        return (
          [...financialEntries.values()].find(
            (entry) =>
              (!where.paymentId || entry.paymentId === where.paymentId) &&
              (!where.type || entry.type === where.type)
          ) ?? null
        );
      },
      async create({
        data,
      }: {
        data: Omit<FinancialEntry, "id" | "createdAt">;
      }) {
        if (
          [...financialEntries.values()].some(
            (entry) =>
              entry.paymentId === data.paymentId && entry.type === data.type
          )
        ) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
          });
        }
        const row: FinancialEntry = {
          id: `88888888-8888-4888-8888-${String(nextLedgerId++).padStart(12, "0")}`,
          createdAt: new Date(),
          ...data,
        };
        financialEntries.set(row.id, row);
        return row;
      },
    },
    merchandiseOrder: {
      async create({ data }: { data: Record<string, unknown> }) {
        const now = new Date("2026-10-10T00:00:00.000Z");
        const row: MerchandiseOrder = {
          id: id(),
          userId: data.userId as string,
          status: data.status as OrderStatus,
          totalAmount: data.totalAmount as Prisma.Decimal,
          paymentId: (data.paymentId as string | null) ?? null,
          createdAt: now,
          updatedAt: now,
        };
        orders.set(row.id, row);
        return row;
      },
      async findFirst({ where }: { where: { paymentId?: string } }) {
        return (
          [...orders.values()].find(
            (order) => order.paymentId === where.paymentId
          ) ?? null
        );
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<MerchandiseOrder>;
      }) {
        const current = orders.get(where.id);
        if (!current) throw new Error("order not found");
        const updated = { ...current, ...data, updatedAt: new Date() };
        orders.set(where.id, updated);
        return updated;
      },
      async updateMany({
        where,
        data,
      }: {
        where: { paymentId: string; status: OrderStatus };
        data: Partial<MerchandiseOrder>;
      }) {
        const matching = [...orders.values()].find(
          (order) =>
            order.paymentId === where.paymentId && order.status === where.status
        );
        if (!matching) return { count: 0 };
        orders.set(matching.id, { ...matching, ...data, updatedAt: new Date() });
        return { count: 1 };
      },
    },
    orderItem: {
      async create({ data }: { data: Record<string, unknown> }) {
        const row: OrderItem = {
          id: id(),
          orderId: data.orderId as string,
          variantId: data.variantId as string,
          quantity: data.quantity as number,
          unitPrice: data.unitPrice as Prisma.Decimal,
        };
        orderItems.set(row.id, row);
        return row;
      },
      async findMany({ where }: { where: { orderId: string } }) {
        return [...orderItems.values()].filter(
          (item) => item.orderId === where.orderId
        );
      },
    },
    inventoryMovement: {
      async create({ data }: { data: Record<string, unknown> }) {
        const orderItemId = data.orderItemId as string;
        if (
          [...movements.values()].some(
            (movement) => movement.orderItemId === orderItemId
          )
        ) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
            code: "P2002",
            clientVersion: "test",
          });
        }
        const row: InventoryMovement = {
          id: id(),
          variantId: data.variantId as string,
          quantityDelta: data.quantityDelta as number,
          reason: data.reason as InventoryReason,
          orderItemId,
          createdById: (data.createdById as string | null) ?? null,
          createdAt: new Date(),
        };
        movements.set(row.id, row);
        return row;
      },
    },
    membership: {
      async findFirst() {
        return null;
      },
    },
    ticket: {
      async findMany() {
        return [];
      },
      async updateMany() {
        return { count: 0 };
      },
    },
    async $transaction<T>(run: (tx: typeof db) => Promise<T>) {
      const snapshots = {
        variants: new Map(variants),
        payments: new Map(payments),
        orders: new Map(orders),
        orderItems: new Map(orderItems),
        movements: new Map(movements),
        financialEntries: new Map(financialEntries),
      };
      try {
        return await run(db);
      } catch (error) {
        for (const [target, snapshot] of [
          [variants, snapshots.variants],
          [payments, snapshots.payments],
          [orders, snapshots.orders],
          [orderItems, snapshots.orderItems],
          [movements, snapshots.movements],
          [financialEntries, snapshots.financialEntries],
        ] as const) {
          target.clear();
          for (const [key, value] of snapshot) target.set(key, value);
        }
        throw error;
      }
    },
  };

  const gateway: RazorpayGateway = {
    async createOrder(input) {
      currentRazorpayOrder = "order_merchandiseCheckout";
      currentRazorpayAmount = input.amountPaise;
      return {
        id: currentRazorpayOrder,
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        status: "created",
      };
    },
    async fetchPayment(paymentId) {
      return {
        id: paymentId,
        orderId: currentRazorpayOrder,
        amount: currentRazorpayAmount,
        currency: "INR",
        status: "captured",
        notes: {},
      };
    },
  };

  return {
    db: db as unknown as SkylineDb,
    gateway,
    products,
    variants,
    payments,
    orders,
    orderItems,
    movements,
    financialEntries,
  };
}

function checkoutSignature(orderId: string, paymentId: string) {
  return createHmac("sha256", CHECKOUT_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

function webhookSignature(body: string) {
  return createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function withServer(
  deps: { prisma: SkylineDb; razorpay: RazorpayGateway },
  run: (baseUrl: string) => Promise<void>
) {
  const previousSecret = env.razorpayKeySecret;
  const previousKeyId = env.razorpayKeyId;
  const previousWebhook = env.razorpayWebhookSecret;
  env.razorpayKeySecret = CHECKOUT_SECRET;
  env.razorpayKeyId = "rzp_test_key";
  env.razorpayWebhookSecret = WEBHOOK_SECRET;
  const server = createServer(
    createApp({
      prisma: deps.prisma,
      verifyAccessToken: testVerifyAccessToken,
      razorpay: deps.razorpay,
    })
  );
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve())
  );
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    env.razorpayKeySecret = previousSecret;
    env.razorpayKeyId = previousKeyId;
    env.razorpayWebhookSecret = previousWebhook;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

async function createOrder(baseUrl: string, userId = STUDENT_ID) {
  const token = await signToken(userId);
  return fetch(`${baseUrl}/api/merchandise/orders`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      items: [{ variantId: VARIANT_ID, quantity: 2 }],
    }),
  });
}

test("authenticated merchandise catalogue lists active products and variants", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const unauthenticated = await fetch(`${baseUrl}/api/merchandise/products`);
    assert.equal(unauthenticated.status, 401);

    const token = await signToken(STUDENT_ID);
    const response = await fetch(`${baseUrl}/api/merchandise/products`, {
      headers: authHeader(token),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      products: Array<{
        id: string;
        variants: Array<{ id: string; price: string; stockQty: number }>;
      }>;
    };
    assert.equal(body.products.length, 1);
    assert.equal(body.products[0]?.id, PRODUCT_ID);
    assert.equal(body.products[0]?.variants[0]?.price, "0");
    assert.equal(body.products[0]?.variants[1]?.price, "19.99");
    assert.equal(body.products[0]?.variants[1]?.stockQty, 5);
  });
});

test("order creation validates quantities, rejects client pricing, and prices from the database", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const token = await signToken(STUDENT_ID);
    for (const quantity of [0, 1.5]) {
      const invalid = await fetch(`${baseUrl}/api/merchandise/orders`, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ items: [{ variantId: VARIANT_ID, quantity }] }),
      });
      assert.equal(invalid.status, 400);
    }
    const untrustedPrice = await fetch(`${baseUrl}/api/merchandise/orders`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        items: [{ variantId: VARIANT_ID, quantity: 2, unitPrice: 0.01 }],
      }),
    });
    assert.equal(untrustedPrice.status, 400);

    const response = await createOrder(baseUrl);
    assert.equal(response.status, 201);
    const body = (await response.json()) as {
      order: { userId: string; totalAmount: string; status: string };
      payment: {
        amount: string;
        currency: string;
        purpose: string;
        status: string;
      };
    };
    assert.equal(body.order.userId, STUDENT_ID);
    assert.equal(body.order.totalAmount, "39.98");
    assert.equal(body.order.status, "PENDING");
    assert.equal(body.payment.amount, "39.98");
    assert.equal(body.payment.currency, "INR");
    assert.equal(body.payment.purpose, "MERCHANDISE");
    assert.equal(body.payment.status, "PENDING");
    assert.equal(store.variants.get(VARIANT_ID)?.stockQty, 3);
  });
});

test("merchandise orders require a linked user, reject unknown variants, and prevent overselling", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const unlinked = await signToken("77777777-7777-4777-8777-777777777777");
    const noUser = await fetch(`${baseUrl}/api/merchandise/orders`, {
      method: "POST",
      headers: authHeader(unlinked),
      body: JSON.stringify({
        items: [{ variantId: VARIANT_ID, quantity: 1 }],
      }),
    });
    assert.equal(noUser.status, 404);

    const token = await signToken(STUDENT_ID);
    const hiddenVariant = await fetch(`${baseUrl}/api/merchandise/orders`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        items: [{ variantId: INACTIVE_VARIANT_ID, quantity: 1 }],
      }),
    });
    assert.equal(hiddenVariant.status, 404);

    const insufficient = await fetch(`${baseUrl}/api/merchandise/orders`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        items: [{ variantId: VARIANT_ID, quantity: 6 }],
      }),
    });
    assert.equal(insufficient.status, 409);
    assert.equal(store.variants.get(VARIANT_ID)?.stockQty, 5);
    assert.equal(store.orders.size, 0);
    assert.equal(store.payments.size, 0);
  });
});

test("verified checkout pays an order once and duplicate captured webhooks do not duplicate ledgers or movements", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const orderResponse = await createOrder(baseUrl);
    const created = (await orderResponse.json()) as {
      order: { id: string; paymentId: string };
    };
    const token = await signToken(STUDENT_ID);

    const otherToken = await signToken(OTHER_ID);
    const forbidden = await fetch(
      `${baseUrl}/api/payments/${created.order.paymentId}/razorpay/order`,
      { method: "POST", headers: authHeader(otherToken) }
    );
    assert.equal(forbidden.status, 403);

    const razorpayOrderResponse = await fetch(
      `${baseUrl}/api/payments/${created.order.paymentId}/razorpay/order`,
      { method: "POST", headers: authHeader(token) }
    );
    assert.equal(razorpayOrderResponse.status, 201);
    const razorpayOrder = (await razorpayOrderResponse.json()) as {
      razorpayOrder: { id: string; amount: number; currency: string };
    };
    assert.equal(razorpayOrder.razorpayOrder.amount, 3998);
    assert.equal(razorpayOrder.razorpayOrder.currency, "INR");

    const paymentId = "pay_merchandiseCaptured";
    const verified = await fetch(`${baseUrl}/api/payments/razorpay/verify`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        razorpay_order_id: razorpayOrder.razorpayOrder.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: checkoutSignature(
          razorpayOrder.razorpayOrder.id,
          paymentId
        ),
      }),
    });
    assert.equal(verified.status, 200);
    assert.equal(store.orders.get(created.order.id)?.status, OrderStatus.PAID);
    assert.equal(store.payments.get(created.order.paymentId)?.status, PaymentStatus.COMPLETED);
    assert.equal(store.financialEntries.size, 1);
    assert.equal(store.movements.size, 1);
    assert.equal([...store.movements.values()][0]?.quantityDelta, -2);
    assert.equal(store.variants.get(VARIANT_ID)?.stockQty, 3);

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: razorpayOrder.razorpayOrder.id,
            amount: 3998,
            currency: "INR",
            status: "captured",
            notes: { skylinePaymentId: created.order.paymentId },
          },
        },
      },
    });
    const duplicateWebhook = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": webhookSignature(payload),
      },
      body: payload,
    });
    assert.equal(duplicateWebhook.status, 200);
    const duplicateBody = (await duplicateWebhook.json()) as {
      alreadyProcessed: boolean;
    };
    assert.equal(duplicateBody.alreadyProcessed, true);
    assert.equal(store.financialEntries.size, 1);
    assert.equal(store.movements.size, 1);
    assert.equal(store.variants.get(VARIANT_ID)?.stockQty, 3);
  });
});

test("failed merchandise payments cancel the order, release stock, and remain idempotent", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const response = await createOrder(baseUrl);
    const created = (await response.json()) as {
      order: { id: string; paymentId: string };
      payment: { externalRef: string | null };
    };
    const checkout = await fetch(
      `${baseUrl}/api/payments/${created.order.paymentId}/razorpay/order`,
      {
        method: "POST",
        headers: authHeader(await signToken(STUDENT_ID)),
      }
    );
    assert.equal(checkout.status, 201);
    const checkoutBody = (await checkout.json()) as {
      razorpayOrder: { id: string };
    };

    const payload = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_merchandiseFailed",
            order_id: checkoutBody.razorpayOrder.id,
            amount: 3998,
            currency: "INR",
            status: "failed",
            notes: { skylinePaymentId: created.order.paymentId },
          },
        },
      },
    });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const failed = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": webhookSignature(payload),
        },
        body: payload,
      });
      assert.equal(failed.status, 200);
    }
    assert.equal(store.payments.get(created.order.paymentId)?.status, PaymentStatus.FAILED);
    assert.equal(store.orders.get(created.order.id)?.status, OrderStatus.CANCELLED);
    assert.equal(store.variants.get(VARIANT_ID)?.stockQty, 5);
    assert.equal(store.movements.size, 0);
    assert.equal(store.financialEntries.size, 0);
  });
});

test("zero-total merchandise orders complete immediately without a payment", async () => {
  const store = createMemoryDb();
  await withServer({ prisma: store.db, razorpay: store.gateway }, async (baseUrl) => {
    const token = await signToken(STUDENT_ID);
    const response = await fetch(`${baseUrl}/api/merchandise/orders`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        items: [{ variantId: OTHER_VARIANT_ID, quantity: 1 }],
      }),
    });
    assert.equal(response.status, 201);
    const body = (await response.json()) as {
      order: { status: string; totalAmount: string; paymentId: string | null };
      payment: null;
    };
    assert.equal(body.order.status, "PAID");
    assert.equal(body.order.totalAmount, "0");
    assert.equal(body.order.paymentId, null);
    assert.equal(body.payment, null);
    assert.equal(store.variants.get(OTHER_VARIANT_ID)?.stockQty, 1);
    assert.equal(store.movements.size, 1);
  });
});
