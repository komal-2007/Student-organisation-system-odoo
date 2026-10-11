import { Router, Request, Response } from 'express';
import { store, TicketRecord } from '../services/store';

const router = Router();

// Get Events
router.get('/', (_req: Request, res: Response) => {
  return res.json({ events: store.db.events });
});

// Create Event
router.post('/', (req: Request, res: Response) => {
  const { title, date, time, venue, category, capacity, description, ticketPrice, organizer, status } = req.body;
  
  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date are required.' });
  }

  const rawPrice = ticketPrice && String(ticketPrice).includes('$')
    ? parseFloat(String(ticketPrice).replace('$', ''))
    : (typeof ticketPrice === 'number' ? ticketPrice : (parseFloat(ticketPrice) || 0));

  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    date,
    time: time || '10:00 AM',
    venue: venue || 'Campus Hall',
    category: category || 'General',
    capacity: capacity ? Number(capacity) : 100,
    registered: 0,
    status: status || 'upcoming',
    description: description || '',
    organizer: organizer || 'Club Admin',
    ticketPrice: ticketPrice ? String(ticketPrice) : 'Free',
    rawPrice,
  };

  store.db.events.unshift(newEvent);
  store.commit();

  return res.status(201).json({ event: newEvent, message: 'Event created successfully.' });
});

// Update Event
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, date, time, venue, category, capacity, description, ticketPrice, organizer, status } = req.body;

  const eventIndex = store.db.events.findIndex((event) => event.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const nextEvent = {
    ...store.db.events[eventIndex],
    ...(title !== undefined ? { title } : {}),
    ...(date !== undefined ? { date } : {}),
    ...(time !== undefined ? { time } : {}),
    ...(venue !== undefined ? { venue } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(ticketPrice !== undefined ? { ticketPrice } : {}),
    ...(organizer !== undefined ? { organizer } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  store.db.events[eventIndex] = nextEvent;
  store.commit();

  return res.json({ event: nextEvent, message: 'Event updated successfully.' });
});

// Delete Event
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const eventIndex = store.db.events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const [removed] = store.db.events.splice(eventIndex, 1);
  store.commit();

  return res.json({ success: true, message: `Removed event ${removed.title}.` });
});

// Ticket Checkout / RSVP
router.post('/tickets/checkout', (req: Request, res: Response) => {
  const { eventId, userId, paymentRef } = req.body;
  const event = store.db.events.find((e) => e.id === eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.registered >= event.capacity) {
    return res.status(400).json({ error: 'Event is fully booked at capacity.' });
  }

  const user = store.db.users.find((u) => u.id === userId || u.username === userId) || store.db.users[1];
  const existingTicket = store.db.tickets.find(
    (t) => t.userId === user.id && t.eventId === event.id && ['VALID', 'USED'].includes(t.status)
  );

  if (existingTicket) {
    return res.status(409).json({
      success: false,
      error: 'You already have an active ticket for this event.',
      ticket: existingTicket,
    });
  }

  // Increment registered count
  event.registered += 1;

  const ticketNumber = `SKY-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const qrToken = `QR-TOKEN-${ticketNumber}-${Date.now()}`;

  const newTicket: TicketRecord = {
    id: `tkt-${Date.now()}`,
    ticketNumber,
    eventId: event.id,
    eventTitle: event.title,
    userId: user.id,
    userName: user.name,
    qrToken,
    status: 'VALID',
    paymentRef: paymentRef || (event.rawPrice > 0 ? `PAY-SANDBOX-${Date.now()}` : 'FREE-RSVP'),
    paidAmount: event.rawPrice,
    createdAt: new Date().toISOString(),
  };

  store.db.tickets.unshift(newTicket);
  store.commit();

  return res.status(201).json({
    success: true,
    ticket: newTicket,
    message: 'Ticket confirmed and issued successfully.',
  });
});

// Get My Tickets
router.get('/tickets/my-tickets', (req: Request, res: Response) => {
  const rawUserId = (req.query.userId as string) || req.headers['x-user-id'] || 'demo-member';
  const userId = String(rawUserId).trim();

  const seen = new Set<string>();
  const myTickets = store.db.tickets
    .filter((t) => t.userId === userId || t.userName.toLowerCase().includes(userId.toLowerCase()))
    .map((ticket) => {
      const event = store.db.events.find((entry) => entry.id === ticket.eventId);
      const normalized = {
        ...ticket,
        eventTitle: ticket.eventTitle || event?.title || 'Event',
        eventDate: event?.date || 'Not provided',
        eventTime: event?.time || 'Not provided',
        eventVenue: event?.venue || 'Not provided',
        date: event?.date || 'Not provided',
        time: event?.time || 'Not provided',
        venue: event?.venue || 'Not provided',
        category: event?.category || (typeof ticket.eventTitle === 'string' && ticket.eventTitle.toLowerCase().includes('workshop') ? 'Workshop' : 'General'),
        ticketType: 'Admission Pass',
        status: ticket.status || 'VALID',
      };

      const dedupeKey = `${ticket.id}:${ticket.ticketNumber}:${ticket.eventId}:${ticket.userId}`;
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);
      return normalized;
    })
    .filter(Boolean);

  return res.json({ tickets: myTickets });
});

// Server-side QR Code Verification
router.post('/tickets/verify-qr', (req: Request, res: Response) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return res.status(400).json({ valid: false, message: 'Missing QR Token.' });
  }

  const ticket = store.db.tickets.find((t) => t.qrToken === qrToken);

  if (!ticket) {
    return res.status(404).json({ valid: false, message: 'Invalid or unrecognized ticket QR code.' });
  }

  if (ticket.status === 'USED') {
    return res.status(400).json({
      valid: false,
      message: `Ticket ${ticket.ticketNumber} has ALREADY been used for entry at ${ticket.checkedInAt}.`,
      ticket,
    });
  }

  if (ticket.status === 'CANCELLED') {
    return res.status(400).json({
      valid: false,
      message: `Ticket ${ticket.ticketNumber} has been cancelled.`,
      ticket,
    });
  }

  // Mark ticket as used
  ticket.status = 'USED';
  ticket.checkedInAt = new Date().toISOString();
  store.commit();

  return res.json({
    valid: true,
    message: `Access Granted! Ticket ${ticket.ticketNumber} verified for ${ticket.userName}.`,
    ticket,
  });
});

export { router as eventsRouter };
