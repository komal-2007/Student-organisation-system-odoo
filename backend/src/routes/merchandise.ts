import { Router, Request, Response } from 'express';
import { store, OrderRecord } from '../services/store';

const router = Router();

// Get Merchandise Catalog
router.get('/', (_req: Request, res: Response) => {
  return res.json({ merchandise: store.db.merchandise });
});

// Merchandise Checkout (Server-validated stock, total calculation, sandbox payment)
router.post('/orders/checkout', (req: Request, res: Response) => {
  const { itemId, quantity = 1, userId, pickupLocation } = req.body;
  const item = store.db.merchandise.find((m) => m.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Merchandise item not found.' });
  }

  if (!item.inStock || item.stockCount < quantity) {
    return res.status(400).json({ error: `Insufficient stock. Only ${item.stockCount} items remaining.` });
  }

  const user = store.db.users.find((u) => u.id === userId || u.username === userId) || store.db.users[1];

  // Calculate authoritative server price total
  const totalPrice = item.rawPrice * quantity;
  
  // Decrement stock
  item.stockCount -= quantity;
  if (item.stockCount <= 0) {
    item.inStock = false;
  }

  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: OrderRecord = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: user.id,
    userName: user.name,
    itemId: item.id,
    itemName: item.name,
    quantity,
    totalPrice,
    status: 'CONFIRMED',
    paymentRef: `PAY-SANDBOX-${Date.now()}`,
    pickupLocation: pickupLocation || item.pickupLocation || 'Campus Center Room 204',
    createdAt: new Date().toISOString(),
  };

  store.db.orders.unshift(newOrder);
  store.commit();

  return res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Order created and sandbox payment confirmed successfully.',
  });
});

// Get My Orders
router.get('/orders/my-orders', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || req.headers['x-user-id'] || 'demo-member';
  const myOrders = store.db.orders.filter((o) => o.userId === userId || o.userName.toLowerCase().includes(String(userId).toLowerCase()));
  return res.json({ orders: myOrders });
});

export { router as merchandiseRouter };
