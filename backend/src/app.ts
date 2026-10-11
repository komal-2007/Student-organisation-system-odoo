import express from 'express';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { eventsRouter } from './routes/events';
import { merchandiseRouter } from './routes/merchandise';
import { financeRouter } from './routes/finance';
import { announcementsRouter } from './routes/announcements';
import { volunteersRouter } from './routes/volunteers';
import { fundraisingRouter } from './routes/fundraising';
import { membersRouter } from './routes/members';
import { paymentsRouter } from './routes/payments';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Simple CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventsRouter);
app.use('/api/merchandise', merchandiseRouter);
app.use('/api/finance', financeRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/fundraising', fundraisingRouter);
app.use('/api/admin/fundraising', fundraisingRouter);
app.use('/api/admin/events', eventsRouter);
app.use('/api/admin/members', membersRouter);
app.use('/api/payments', paymentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
