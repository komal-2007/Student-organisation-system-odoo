import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

// Create Payment Checkout Session (Server-side price calculation & payment intent)
router.post('/checkout-session', (req: Request, res: Response) => {
  const { type, itemId, quantity = 1, userId, paymentMethod = 'card' } = req.body;

  if (!type || !itemId) {
    return res.status(400).json({ error: 'Payment type (ticket/merchandise) and itemId are required.' });
  }

  let totalAmount = 0;
  let itemName = '';
  let itemDescription = '';

  if (type === 'merchandise') {
    const item = store.db.merchandise.find((m) => m.id === itemId);
    if (!item) return res.status(404).json({ error: 'Merchandise product not found.' });
    if (!item.inStock || item.stockCount < quantity) {
      return res.status(400).json({ error: `Insufficient stock available (${item.stockCount} remaining).` });
    }
    totalAmount = item.rawPrice * quantity;
    itemName = item.name;
    itemDescription = `${quantity}x ${item.name} (${item.category})`;
  } else if (type === 'ticket') {
    const event = store.db.events.find((e) => e.id === itemId);
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (event.registered >= event.capacity) {
      return res.status(400).json({ error: 'Event has reached maximum capacity.' });
    }
    totalAmount = event.rawPrice * quantity;
    itemName = `Ticket: ${event.title}`;
    itemDescription = `Admission ticket for ${event.title} on ${event.date}`;
  } else {
    return res.status(400).json({ error: 'Invalid payment type.' });
  }

  const sessionId = `CS-SANDBOX-${Math.floor(100000 + Math.random() * 900000)}`;
  const clientSecret = `secret_sandbox_${Date.now()}`;

  return res.json({
    sessionId,
    clientSecret,
    paymentProvider: 'Skyline Sandbox Gateway',
    currency: 'USD',
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    itemName,
    itemDescription,
    status: 'requires_payment_confirmation',
  });
});

// Server-side Payment Verification & Order/Ticket Fulfillment
router.post('/verify-payment', (req: Request, res: Response) => {
  const { sessionId, type, itemId, userId, quantity = 1, pickupLocation } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID is required for verification.' });
  }

  const user = store.db.users.find((u) => u.id === userId || u.username === userId) || store.db.users[1];
  const paymentRef = `PAY-VERIFIED-${sessionId.replace('CS-SANDBOX-', '')}`;

  if (type === 'merchandise') {
    const item = store.db.merchandise.find((m) => m.id === itemId);
    if (!item) return res.status(404).json({ success: false, error: 'Product not found.' });

    // Server-authoritative stock deduction
    item.stockCount = Math.max(0, item.stockCount - quantity);
    if (item.stockCount === 0) item.inStock = false;

    const totalPrice = item.rawPrice * quantity;
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: user.id,
      userName: user.name,
      itemId: item.id,
      itemName: item.name,
      quantity,
      totalPrice,
      status: 'CONFIRMED' as const,
      paymentRef,
      pickupLocation: pickupLocation || item.pickupLocation || 'Campus Center Room 204',
      createdAt: new Date().toISOString(),
    };

    store.db.orders.unshift(newOrder);

    // Record in Treasury Ledger as Income
    store.db.transactions.unshift({
      id: `tx-${Date.now()}`,
      title: `Merchandise Purchase — ${item.name}`,
      type: 'income',
      amount: `+$${totalPrice.toFixed(2)}`,
      rawAmount: totalPrice,
      category: 'Merchandise',
      method: 'Credit Card (Sandbox Gateway)',
      ref: paymentRef,
      notes: `Order #${orderNumber} by ${user.name}`,
      date: new Date().toISOString().slice(0, 10),
    });

    store.commit();

    return res.json({
      success: true,
      order: newOrder,
      message: 'Payment verified and merchandise order confirmed!',
    });
  } else if (type === 'ticket') {
    const event = store.db.events.find((e) => e.id === itemId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    event.registered += 1;

    const ticketNumber = `SKY-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrToken = `QR-TOKEN-${ticketNumber}-${Date.now()}`;

    const newTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      eventId: event.id,
      eventTitle: event.title,
      userId: user.id,
      userName: user.name,
      qrToken,
      status: 'VALID' as const,
      paymentRef,
      paidAmount: event.rawPrice,
      createdAt: new Date().toISOString(),
    };

    store.db.tickets.unshift(newTicket);

    if (event.rawPrice > 0) {
      store.db.transactions.unshift({
        id: `tx-${Date.now()}`,
        title: `Ticket Purchase — ${event.title}`,
        type: 'income',
        amount: `+$${event.rawPrice.toFixed(2)}`,
        rawAmount: event.rawPrice,
        category: 'Tickets',
        method: 'Credit Card (Sandbox Gateway)',
        ref: paymentRef,
        notes: `Ticket #${ticketNumber} for ${user.name}`,
        date: new Date().toISOString().slice(0, 10),
      });
    }

    store.commit();

    return res.json({
      success: true,
      ticket: newTicket,
      message: 'Payment verified and event ticket issued!',
    });
  }

  return res.status(400).json({ success: false, error: 'Invalid checkout type.' });
});

export { router as paymentsRouter };
