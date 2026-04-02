# 🎬 MovieHub — Backend API

A robust RESTful API for a Movie & Series Rating and Streaming Portal. Built with Express.js, Prisma ORM, PostgreSQL, Better Auth, Stripe, and Nodemailer.

## 🔗 Live Demo

- **Backend API:** [Deployed on Vercel](https://movie-series-portal-backend.vercel.app)
- **Frontend App:** [Deployed on Vercel](https://movie-series-portal-frontend.vercel.app)

---

## 🛠️ Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Runtime        | Node.js + TypeScript (ES2022)     |
| Framework      | Express.js 4.x                    |
| ORM            | Prisma 7.x with `@prisma/adapter-pg` |
| Database       | PostgreSQL (Neon Serverless)      |
| Authentication | Better Auth (JWT + Sessions)      |
| Payments       | Stripe (Subscriptions & Checkout) |
| Email          | Nodemailer (SMTP / Gmail)         |
| Validation     | Zod                               |
| Security       | Helmet, CORS                      |
| Deployment     | Vercel (Serverless)               |

---

## 📁 Project Structure

```
movie-hub-backend/
├── api/
│   └── index.ts              # Vercel serverless entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app.ts                 # Express app setup, routes, middleware
│   ├── server.ts              # Server entry (local dev)
│   ├── config/
│   │   └── env.ts             # Zod-validated environment variables
│   ├── lib/
│   │   ├── auth.ts            # Better Auth configuration
│   │   ├── email.ts           # Email transporter & templates
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── stripe.ts          # Stripe client
│   ├── middleware/
│   │   ├── auth.ts            # requireAuth, requireAdmin guards
│   │   ├── error-handler.ts   # Global error handler
│   │   └── validate.ts        # Zod request validation
│   ├── modules/
│   │   ├── admin/             # Admin dashboard & management
│   │   ├── comment/           # Review comments (nested replies)
│   │   ├── media/             # Movies & series CRUD
│   │   ├── payment/           # Stripe checkout & webhooks
│   │   ├── review/            # User reviews & ratings
│   │   └── watchlist/         # Personal watchlist
│   ├── seed/
│   │   └── seed.ts            # Database seeder
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── vercel.json                # Vercel deployment config
├── prisma.config.ts           # Prisma config
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Models

| Model          | Description                           |
| -------------- | ------------------------------------- |
| `User`         | User accounts with role (USER/ADMIN)  |
| `Session`      | Authentication sessions               |
| `Account`      | OAuth provider accounts               |
| `Verification` | Email verification tokens             |
| `Media`        | Movies & series entries               |
| `Review`       | User ratings (1–10) and written reviews |
| `Comment`      | Comments on reviews (supports nesting)|
| `Like`         | Review likes (one per user per review)|
| `Watchlist`    | Saved titles per user                 |
| `Subscription` | Stripe payment subscriptions          |

---

## 🚏 API Endpoints

### Public

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/`                             | Health check             |
| GET    | `/api/media`                    | List all media (filters) |
| GET    | `/api/media/featured`           | Featured titles          |
| GET    | `/api/media/top-rated`          | Top rated titles         |
| GET    | `/api/media/newly-added`        | Recently added titles    |
| GET    | `/api/media/:id`                | Single media details     |
| GET    | `/api/reviews/media/:mediaId`   | Reviews for a title      |
| GET    | `/api/comments/review/:reviewId`| Comments on a review     |

### Authenticated (User)

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/api/reviews`                  | Create a review          |
| PUT    | `/api/reviews/:id`              | Update own review        |
| DELETE | `/api/reviews/:id`              | Delete own review        |
| GET    | `/api/reviews/user/me`          | My reviews               |
| POST   | `/api/comments`                 | Add comment              |
| PATCH  | `/api/comments/:id`             | Edit comment             |
| DELETE | `/api/comments/:id`             | Delete comment           |
| GET    | `/api/watchlist`                | Get my watchlist         |
| POST   | `/api/watchlist`                | Add to watchlist         |
| DELETE | `/api/watchlist/:mediaId`       | Remove from watchlist    |
| POST   | `/api/payments/create-checkout`  | Create Stripe checkout   |
| POST   | `/api/payments/cancel`           | Cancel subscription      |
| GET    | `/api/payments/subscription`     | Get subscription status  |

### Admin Only

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/admin/stats`              | Dashboard statistics     |
| GET    | `/api/admin/users`              | Manage users             |
| GET    | `/api/admin/reviews`            | Moderate reviews         |
| PATCH  | `/api/admin/reviews/:id/status` | Approve/unpublish review |
| GET    | `/api/admin/media`              | Manage media             |
| POST   | `/api/admin/media`              | Create media             |
| PUT    | `/api/admin/media/:id`          | Update media             |
| DELETE | `/api/admin/media/:id`          | Delete media             |

### Auth (Better Auth)

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/api/auth/sign-up/email`       | Register with email      |
| POST   | `/api/auth/sign-in/email`       | Login with email         |
| POST   | `/api/auth/sign-out`            | Logout                   |
| GET    | `/api/auth/get-session`         | Get current session      |

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** database (recommend [Neon](https://neon.tech))
- **Stripe** account (for payments)
- **Gmail App Password** (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/islamemon59/movie-series-portal-backend.git
cd movie-series-portal-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual credentials
```

### Environment Variables

| Variable                 | Description                          |
| ------------------------ | ------------------------------------ |
| `DATABASE_URL`           | PostgreSQL connection string         |
| `PORT`                   | Server port (default: 5000)          |
| `NODE_ENV`               | `development` or `production`        |
| `FRONTEND_URL`           | Frontend URL for CORS                |
| `BETTER_AUTH_SECRET`     | Auth secret key (min 32 chars)       |
| `BETTER_AUTH_URL`        | Backend base URL                     |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret           |
| `STRIPE_SECRET_KEY`      | Stripe secret key                    |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook signing secret        |
| `STRIPE_MONTHLY_PRICE_ID`| Stripe monthly price ID             |
| `STRIPE_YEARLY_PRICE_ID` | Stripe yearly price ID              |
| `SMTP_HOST`              | Email SMTP host                      |
| `SMTP_PORT`              | Email SMTP port (587 or 465)         |
| `SMTP_USER`              | SMTP username                        |
| `SMTP_PASS`              | SMTP password / app password         |
| `EMAIL_FROM`             | Sender email address                 |

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### Run Development Server

```bash
npm run dev
# Server runs at http://localhost:5000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🚀 Deploy to Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Add all environment variables from `.env.example`
3. Set `FRONTEND_URL` to your deployed frontend URL
4. Set `BETTER_AUTH_URL` to your deployed backend URL
5. Set `NODE_ENV` to `production`
6. Deploy — Vercel will auto-detect the `vercel.json` config

---

## 📜 Available Scripts

| Script          | Description                            |
| --------------- | -------------------------------------- |
| `npm run dev`   | Start dev server with hot reload (tsx) |
| `npm run build` | Compile TypeScript + generate Prisma   |
| `npm start`     | Run compiled production server         |
| `npm run db:generate` | Generate Prisma client            |
| `npm run db:push`     | Push schema to database           |
| `npm run db:migrate`  | Run database migrations           |
| `npm run db:seed`     | Seed database with sample data    |
| `npm run db:studio`   | Open Prisma Studio                |
| `npm run lint`        | Type-check with TypeScript        |
