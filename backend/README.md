# Skyline backend

API for **Skyline — Student Organization System**.

Node.js + TypeScript + Express 5, with Prisma ORM 7 (`adapter-pg`) against PostgreSQL (Supabase). Auth is external: application `User.id` must equal the access-token `sub` (Supabase Auth user id). Roles are stored on `users.role` (`STUDENT`, `ADMIN`, `TREASURER`) and are never taken from the request body or JWT claims.

## Prerequisites

- Node.js 18 or newer (this project was set up with Node.js 22)
- npm

Run commands from the `backend` folder.

## Setup

1. Copy the environment template and fill in local values:

```
cp .env.example .env
```

Keep real secrets in `.env` only. Never commit them.

Required to **start the HTTP server** (`npm run dev` / `npm start`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres URL for the running app |
| `CORS_ORIGIN` | Single allowed browser origin (no wildcard) |
| `SUPABASE_URL` and/or `SUPABASE_JWT_SECRET` | JWT verification (JWKS and/or legacy HS256) |

Also set `DIRECT_URL` for Prisma CLI. Optional: `JWT_JWKS_URL`, `JWT_ISSUER`, `JWT_AUDIENCE` (default `authenticated`), `MEMBERSHIP_DUES_AMOUNT`, `MEMBERSHIP_PERIOD_DAYS`, and the Razorpay keys below.

2. Install dependencies and generate the Prisma client:

```
npm install
npm run prisma:generate
```

The initial schema lives in `prisma/schema.prisma` with SQL in `prisma/migrations/20261010094800_init/`. **Do not assume that migration is applied** on Supabase until you verify it separately. Do not use `db push`.

## Run in development

```
npm run dev
```

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health) → `{ "status": "ok" }`

## Build and run for production

```
npm run build
npm start
```

`src/index.ts` calls `validateRuntimeEnv()` before listening.

## Authentication

Send `Authorization: Bearer <access_token>`.

Verification:

1. If the token `alg` is `HS256`, it is verified with `SUPABASE_JWT_SECRET` (no hardcoded secret).
2. Otherwise it is verified against JWKS at `JWT_JWKS_URL`, or `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.
3. `sub` must be a UUID. That value is the user id.
4. Role checks load `users.role` from the database.

There is no development auth bypass. If JWT verification is not configured, authenticated routes return `503`.

Application users are **not** auto-created from a token. A valid token for an unknown `sub` yields `404` on `/api/me/profile`.

## Razorpay

Online checkout is optional. The HTTP server still starts if these are unset; checkout and webhook routes then return `503`.

| Variable | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` | Publishable key returned to the browser with a created order |
| `RAZORPAY_KEY_SECRET` | Server secret for order APIs, payment fetch, and checkout HMAC (`order_id\|payment_id`) |
| `RAZORPAY_WEBHOOK_SECRET` | Dashboard webhook secret (`X-Razorpay-Signature` over the **raw** JSON body) |

In the Razorpay dashboard, point the webhook at `POST /api/webhooks/razorpay` and enable `payment.captured` and `payment.failed`. This API verifies the signature against the unmodified request bytes (the webhook route is mounted before `express.json()`).

A checkout starts only for a **PENDING** INR `Payment` owned by the authenticated user. After a verified capture, memberships move `PENDING → ACTIVE`, reserved tickets move `RESERVED → PAID`, merchandise orders move `PENDING → PAID`, and one `FinancialEntry` INCOME is inserted. Merchandise checkout reserves stock atomically when the order is created; a failed-payment webhook cancels the order and releases the reservation. A successful payment writes one `SALE` inventory movement per order item. Repeating the same capture is idempotent.

## Implemented endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/health` | none | `{ "status": "ok" }` |
| `GET` | `/api/me/profile` | bearer | Current user + latest membership |
| `POST` | `/api/me/memberships/renew` | bearer, linked user | Inserts a **PENDING** membership and a **PENDING** payment record. Does not capture or complete payment. |
| `GET` | `/api/me/tickets` | bearer, linked user | Tickets for the verified user only, including event snapshot and `validationCode` |
| `GET` | `/api/events` | bearer | Catalogue with capacity remaining and `yourPrice` from current ACTIVE membership |
| `GET` | `/api/events/:id` | bearer | Single event |
| `POST` | `/api/events/:id/tickets` | bearer, linked user | Purchase; server computes member vs non-member price. Payment is **PENDING**; tickets are **RESERVED**. |
| `GET` | `/api/merchandise/products` | bearer | Active product and variant catalogue with server prices and available stock |
| `POST` | `/api/merchandise/orders` | bearer, linked user | Create an order from `{ "items": [{ "variantId": "...", "quantity": 1 }] }`; prices are read from the database and stock is reserved atomically. Positive totals create a **PENDING** INR merchandise payment; zero-total orders are immediately **PAID** without a payment record. |
| `GET` | `/api/admin/members` | `ADMIN` or `TREASURER` | Directory with current membership |
| `PATCH` | `/api/admin/members/:id` | `ADMIN` | `role` and/or `membershipStatus` |
| `POST` | `/api/admin/events` | `ADMIN` | Create event (`createdById` from the verified user) |
| `PATCH` | `/api/admin/events/:id` | `ADMIN` | Update schedule/capacity/prices or `cancel` |
| `GET` | `/api/admin/events/:id/tickets` | `ADMIN` or `TREASURER` | Ticket list, attendance count, pending vs completed revenue |
| `POST` | `/api/admin/events/:id/tickets/validate` | `ADMIN` | `PAID` → `VALIDATED` once (`validatedAt` is attendance) |
| `GET` | `/api/announcements` | bearer, linked user | `PUBLISHED` only for users with a current ACTIVE membership. `ADMIN` sees every status. |
| `GET` | `/api/announcements/:id` | bearer, linked user | Same visibility. Unpublished rows are `404` for non-admins. |
| `GET` | `/api/admin/announcements` | `ADMIN` | All drafts, published, and archived |
| `POST` | `/api/admin/announcements` | `ADMIN` | Create; `createdById` from the verified user. Default status `DRAFT`. |
| `PATCH` | `/api/admin/announcements/:id` | `ADMIN` | `title`, `body`, and/or `status` |
| `POST` | `/api/payments/:id/razorpay/order` | bearer, linked owner | Creates a Razorpay order for a **PENDING** INR payment owned by the caller and stores `order_…` on `Payment.externalRef` |
| `POST` | `/api/payments/razorpay/verify` | bearer, linked owner | Verifies checkout HMAC, fetches the payment from Razorpay, then completes the Skyline payment |
| `POST` | `/api/webhooks/razorpay` | Razorpay HMAC | Raw-body webhook. Handles `payment.captured` and `payment.failed`. Other events are acknowledged and ignored |

### Response shapes

`GET /api/me/profile`

```json
{
  "user": {
    "id": "uuid",
    "email": "alex@campus.test",
    "fullName": "Alex Student",
    "studentId": null,
    "phone": null,
    "role": "STUDENT",
    "createdAt": "2026-01-15T00:00:00.000Z",
    "updatedAt": "2026-01-15T00:00:00.000Z"
  },
  "membership": {
    "id": "uuid",
    "userId": "uuid",
    "status": "PENDING",
    "startsOn": "2026-01-01",
    "expiresOn": "2027-01-01",
    "duesAmount": "500",
    "paymentId": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

`membership` is `null` when the user has no rows.

`POST /api/me/memberships/renew` — body `{ "method": "CASH" | "CARD" | "ONLINE" | "OTHER" }` (201)

```json
{
  "membership": { },
  "payment": {
    "status": "PENDING",
    "purpose": "MEMBERSHIP_DUES",
    "paidAt": null
  },
  "paymentNote": "Payment recorded as PENDING. No payment has been processed or confirmed."
}
```

Dues amount is snapshotted from `MEMBERSHIP_DUES_AMOUNT` (INR). A second PENDING membership for the same user returns `409`.

`POST /api/events/:id/tickets` — body `{ "method": "CASH" | "CARD" | "ONLINE" | "OTHER", "quantity"?: 1-20, "idempotencyKey"?: string }` (201)

```json
{
  "event": { "yourPrice": "100", "pricedAsMember": true, "remainingCapacity": 9 },
  "tickets": [{ "status": "RESERVED", "pricePaid": "100", "pricedAsMember": true }],
  "payment": { "status": "PENDING", "purpose": "EVENT_TICKET", "paidAt": null },
  "paymentNote": "Payment recorded as PENDING. No payment has been processed or confirmed. Tickets remain RESERVED until the payment is completed."
}
```

Price is never taken from the client. An ACTIVE membership covering today uses `memberPrice`; otherwise `nonMemberPrice`. Held tickets (`RESERVED` / `PAID` / `VALIDATED`) count against `capacity`. A zero-price ticket inserts no payment row and is stored as `PAID`. Extra body fields are rejected.

`POST /api/admin/events/:id/tickets/validate` — body `{ "validationCode": "..." }`

Only `PAID` tickets for that event become `VALIDATED`. Repeating validation returns `409`. `RESERVED` tickets cannot be checked in until payment is completed.

`GET /api/admin/members`

```json
{
  "members": [
    {
      "id": "uuid",
      "role": "STUDENT",
      "currentMembership": { }
    }
  ]
}
```

`PATCH /api/admin/members/:id` — body `{ "role"?: "STUDENT" | "ADMIN" | "TREASURER", "membershipStatus"?: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" }`

Allowed membership-status transitions: `PENDING → ACTIVE | CANCELLED`, `ACTIVE → EXPIRED | CANCELLED`. `EXPIRED` and `CANCELLED` cannot be moved by this endpoint. Roles are the Prisma `UserRole` enum only. Extra body fields are rejected.

`POST /api/admin/announcements` — body `{ "title": string, "body": string, "status"?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }` (201)

Default status is `DRAFT` with `publishedAt: null`. Creating or transitioning to `PUBLISHED` sets `publishedAt` once. `createdById` and `publishedAt` in the request body are rejected.

Allowed announcement-status transitions: `DRAFT → PUBLISHED | ARCHIVED`, `PUBLISHED → ARCHIVED`. `ARCHIVED` cannot be moved by this endpoint. There is no targeting table; member visibility is ACTIVE membership plus `PUBLISHED` status.

Errors: `{ "error": "Unauthorized" | "Forbidden" | "Not Found" | "Bad Request" | "Conflict" | "...", "message": "..." }`.

## Tests

```
npm test
```

Uses Node's test runner. Auth, membership, event, announcement, merchandise, and payment tests use an in-memory Prisma stand-in and locally signed JWTs. Razorpay is mocked. They do not connect to Supabase or reset data.

## Folder layout

```
backend/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/env.ts
│   ├── lib/          # prisma, jwt, errors, serialize
│   ├── middleware/   # auth, requireRole, errorHandler
│   ├── routes/
│   ├── services/
│   └── *.test.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── prisma7.config.ts
├── .env.example
└── package.json
```
