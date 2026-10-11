import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "./app";

test("Full Stack API Endpoints Integration Test Suite", async (t) => {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      })
  );

  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  // 1. Auth Login Test
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin1', password: 'admin123' }),
  });
  const loginData = (await loginRes.json()) as any;
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.user.username, 'admin1');
  assert.equal(loginData.user.role, 'admin');

  // 2. Events List Test
  const eventsRes = await fetch(`${baseUrl}/api/events`);
  const eventsData = (await eventsRes.json()) as any;
  assert.equal(eventsRes.status, 200);
  assert.ok(Array.isArray(eventsData.events));

  // 3. Ticket Checkout (RSVP/Purchase) Test
  const ticketRes = await fetch(`${baseUrl}/api/events/tickets/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: 'evt-101', userId: 'demo-member' }),
  });
  const ticketData = (await ticketRes.json()) as any;
  assert.equal(ticketRes.status, 201);
  assert.ok(ticketData.ticket.qrToken);

  // 4. Server-side QR Code Verification Test
  const qrRes = await fetch(`${baseUrl}/api/events/tickets/verify-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken: ticketData.ticket.qrToken }),
  });
  const qrData = (await qrRes.json()) as any;
  assert.equal(qrRes.status, 200);
  assert.equal(qrData.valid, true);

  // Re-verification (duplicate check-in) should be rejected
  const dupQrRes = await fetch(`${baseUrl}/api/events/tickets/verify-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken: ticketData.ticket.qrToken }),
  });
  assert.equal(dupQrRes.status, 400);

  // 5. Merchandise Checkout Test
  const orderRes = await fetch(`${baseUrl}/api/merchandise/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: 'prod-1', quantity: 1, userId: 'demo-member' }),
  });
  const orderData = (await orderRes.json()) as any;
  assert.equal(orderRes.status, 201);
  assert.equal(orderData.success, true);

  // 6. Payment Gateway Integration Test
  const paySessionRes = await fetch(`${baseUrl}/api/payments/checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'merchandise', itemId: 'prod-1', quantity: 2, userId: 'demo-member' }),
  });
  const paySessionData = (await paySessionRes.json()) as any;
  assert.equal(paySessionRes.status, 200);
  assert.ok(paySessionData.sessionId);
  assert.equal(paySessionData.totalAmount, 90.0);

  const verifyPayRes = await fetch(`${baseUrl}/api/payments/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: paySessionData.sessionId,
      type: 'merchandise',
      itemId: 'prod-1',
      quantity: 2,
      userId: 'demo-member',
    }),
  });
  const verifyPayData = (await verifyPayRes.json()) as any;
  assert.equal(verifyPayRes.status, 200);
  assert.equal(verifyPayData.success, true);

  // 7. Finance Summary & CSV Export Test
  const finRes = await fetch(`${baseUrl}/api/finance/summary`);
  const finData = (await finRes.json()) as any;
  assert.equal(finRes.status, 200);
  assert.ok(finData.totalIncome);

  const csvRes = await fetch(`${baseUrl}/api/finance/export`);
  assert.equal(csvRes.status, 200);
  assert.ok(csvRes.headers.get('content-type')?.includes('text/csv'));
});
