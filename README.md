# Eve Planner — AI-Powered Celebration & Event Marketplace

[![GitHub Repository](https://img.shields.io/badge/GitHub-Eve--Planner-181717?style=for-the-badge&logo=github)](https://github.com/bhavya14032007/Eve-planner)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

> **Live Repository:** [https://github.com/bhavya14032007/Eve-planner](https://github.com/bhavya14032007/Eve-planner)  
> Eve Planner is a responsive, database-backed celebration and event-planning marketplace connecting event hosts with local verified vendors (banquet halls, catering chefs, decorators, photographers, DJs, and dessert artists) empowered by Google Gemini AI.

---

## 1. Chosen Vertical & Business Problem

### Vertical
**Celebrations & Event-Planning Marketplace** covering Birthdays, Kids' Parties, Romantic Anniversaries, Proposals, Weddings, Baby Showers, and Corporate Galas.

### The Problem
- **Fragmented Vendor Discovery:** Celebration hosts spend weeks negotiating individually with banquet halls, caterers, decorators, and photographers across disparate channels with zero unified accountability.
- **Opaque Pricing & Hidden Add-Ons:** Host budgets are routinely broken by unexpected surcharges, taxes, or unitemized proposals.
- **Coordination Fatigue:** Coordinating 3 to 5 independent vendors on the day of an event causes severe anxiety.
- **Unverified Vendors:** Misleading online portfolios result in ruined milestones.

### The Eve Planner Solution
1. **Pre-Built Configurable Packages:** Curated combos across Delhi NCR, Mumbai, and Bangalore with verified database pricing.
2. **Hybrid Gemini AI Recommendation Engine:** Matches budget, guest count, and aesthetic preferences against live database packages with suitability scoring and grounded explanations.
3. **Atomic Multi-Vendor Bookings:** A single reservation automatically generates linked, isolated service requests for all participating vendors.
4. **Transparent Server-Side Price Verification:** Every price calculation, add-on recalculation, and tax is computed server-side to prevent client tampering.
5. **Vendor Onboarding with Admin Moderation:** Strict `PENDING_REVIEW` -> `APPROVED` state machine preventing rogue listings.

---

## 2. Approach and Architectural Logic

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Frontend Client                               │
│       React 18 + Vite + TypeScript + Tailwind CSS (8px Grid)          │
│        WCAG 2.2 AA Accessible • CSS Variables (Light/Dark Theme)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API & Bearer JWT
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Express 4.21 + Node.js API                       │
│  - Helmet, CORS, Rate Limiters (General, Auth, AI)                     │
│  - JWT Auth Middleware & Role-Based Access Control (RBAC)              │
│  - Centralized Zod Validation & Error Handling                         │
│  - Atomic Database Transactions ($transaction)                         │
└─────────────┬──────────────────────────┬───────────────────────────────┘
              │                          │
┌─────────────▼──────────────┐ ┌─────────▼───────────────────────────────┐
│     Google Gemini AI       │ │               Prisma ORM                │
│  - @google/generative-ai   │ │ - Normalized 20-Model Schema            │
│  - Temperature: 0.2        │ │ - PostgreSQL (Production: Render/Neon)  │
│  - Grounded Context Only   │ │ - SQLite (Zero-Dependency Dev/Vitest)   │
│  - Offline Heuristic Engine│ └─────────────────────────────────────────┘
└────────────────────────────┘
```

### Hybrid Gemini AI Recommendation System
The system refuses to let Gemini hallucinate prices, non-existent vendors, or impossible capacities:
1. **Database Query:** Retrieves active celebration packages and services from PostgreSQL/SQLite.
2. **Suitability Scoring:** Evaluates candidate packages across 4 dimensions:
   - **Event Type Affinity (35%):** Exact or closely related celebration type match.
   - **Budget Fit (25%):** Proportional distance from target budget with penalty for overages.
   - **Guest Capacity (20%):** Ensures venue and catering comfortably accommodate guest count.
   - **Popularity & Service Breadth (20%):** Rewards featured combos and multi-service breadth.
3. **Gemini SDK Reasoning:** Prompts Gemini 1.5 with the top scored database records, instructing the model to generate personalized explanations, customization tips, and an actionable planning timeline.
4. **Safety & Fallback Guardrails:** If `GEMINI_API_KEY` is omitted or network times out, an intelligent heuristic rule engine provides transparent recommendations without crashing.

---

## 3. Normalized Database Schema (20 Models)

The Prisma schema is fully normalized and supports PostgreSQL production as well as SQLite local development:

1. **`User`**: Account identity (`email`, `passwordHash`, `role: CUSTOMER | VENDOR | ADMIN`, `phone`, `isActive`).
2. **`CustomerProfile`**: User address, preferred city, target budget.
3. **`VendorProfile`**: Business name, slug, category, service area, address, city, rating, review count, verification status (`PENDING_REVIEW`, `APPROVED`, `REJECTED`).
4. **`VendorDocument`**: KYC and business registration records (`BUSINESS_REGISTRATION`, `ID_PROOF`, `TAX_GST`).
5. **`ServiceCategory`**: Categories with icon references and sorting order.
6. **`ServiceListing`**: Vendor listings with starting prices, price units, capacity, inclusions, exclusions.
7. **`ServiceImage`**: Curated gallery photography with primary image flags.
8. **`ServiceAvailability`**: Per-date calendar availability slots.
9. **`EventPackage`**: Pre-built packages with base price, capacity, duration, inclusions, exclusions.
10. **`PackageService`**: Many-to-many join between packages and constituent vendor listings.
11. **`PackageAddon`**: Customizable add-ons with unit prices and maximum allowable quantities.
12. **`EventBooking`**: Master booking (`bookingNumber`, customer, package, dates, amounts, `status: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED`, `paymentStatus: UNPAID | PARTIAL | PAID | REFUNDED`).
13. **`BookingService`**: Line-item individual services attached to a booking.
14. **`VendorBookingRequest`**: Isolated booking requests assigned to respective vendors (`PENDING`, `ACCEPTED`, `DECLINED`).
15. **`Payment`**: Payment transaction record (`transactionId`, gateway, amount, currency, status).
16. **`Review`**: Customer reviews with 1–5 star ratings, feedback comments, and vendor responses.
17. **`Wishlist`**: User bookmarks for packages and service listings.
18. **`ChatConversation`**: Threaded conversations (`AI_ASSISTANT`, `VENDOR_CHAT`, `SUPPORT`).
19. **`ChatMessage`**: Messages with `isAiGenerated` flag and grounding metadata.
20. **`SupportTicket`**: Customer service tickets with priority and resolution notes.
21. **`AdminAuditLog`**: Audit trail recording administrative actions (`VENDOR_APPROVED`, `VENDOR_REJECTED`, etc.).

---

## 4. UI/UX Design System & Accessibility

- **Color Palette & Theme Switching:** CSS variables for `--color-bg`, `--color-surface`, `--color-primary`, `--color-border`, supporting warm white (`#FAF9F6`) with muted coral (`#D84C38`) in Light Mode, and sleek slate (`#0F172A`) in Dark Mode.
- **8px Grid Spacing:** Spacing tokens structured in multiples of 8px (`p-2`, `p-4`, `p-6`, `p-8`, `gap-2`, `gap-4`).
- **Typography:** Display typography in Google Font **Outfit**; body text in **Plus Jakarta Sans**.
- **WCAG 2.2 AA Accessibility:**
  - High contrast ratios across light and dark modes.
  - Semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
  - Strict keyboard navigation with clear focus rings (`*:focus-visible`).
  - `@media (prefers-reduced-motion: reduce)` disables or shortens all transitions.

---

## 5. Security & Efficiency Implementations

- **Password Security:** Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Authentication & RBAC:** Stateless JWT tokens verified via middleware. Strict role validation (`CUSTOMER`, `VENDOR`, `ADMIN`).
- **Vendor Data Isolation:** Vendor endpoints enforce `where: { vendorId: currentVendor.id }`. Vendors cannot view other vendors' booking requests or earnings.
- **Server-Side Price Calculation:** The frontend never submits arbitrary total amounts. All subtotals, add-on quantities, and taxes are calculated and validated in backend transactions.
- **Rate Limiting:** `express-rate-limit` guards general APIs (300 req/15m), auth endpoints (30 req/15m), and AI endpoints (40 req/5m).
- **HTTP Security Headers:** Protected with `helmet` and strict `cors` policies.

---

## 6. Assumptions Made

1. **Payment Gateway Demo Mode:** Because live Razorpay API secret keys require commercial KYC credentials, a simulated payment verification flow is included that generates realistic transaction IDs (`TXN-DEMO-...`) and transitions booking status to `PAID` / `CONFIRMED`.
2. **PostgreSQL / SQLite Dual Strategy:** Production schema is tailored for PostgreSQL (`prisma/schema.prisma`). For zero-dependency local development and CI testing without external cloud databases, a SQLite schema (`prisma/schema.sqlite.prisma`) provides instant out-of-the-box execution.
3. **Gemini SDK Fallback:** The backend uses the official `@google/generative-ai` SDK. If a `GEMINI_API_KEY` is not present in `.env`, the system smoothly switches to rule-grounded database heuristics without failing.

---

## 7. Pre-Seeded Demo Accounts

Run `npm run db:seed` to populate the database with realistic data:

| Role | Email | Password | Access & Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eveplanner.com` | `Admin@123` | Moderate vendors, audit logs, platform statistics |
| **Vendor** | `royalpalace@eveplanner.com` | `Vendor@123` | Vendor dashboard, accept/decline booking requests |
| **Customer** | `riya.sharma@example.com` | `Customer@123` | Book packages, AI planner, track reservations |

*Convenient 1-click Quick-Fill buttons are built into the `/login` page for frictionless pair-programming testing.*

---

## 8. Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24.15.0)
- npm v9+

### Installation & Database Initialization

```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Initialize local database with Prisma
cd backend
npm run prisma:generate:sqlite
npm run db:push:sqlite

# 3. Seed verified vendors, packages, listings, and demo users
npm run seed
cd ..
```

### Running Locally (Backend & Frontend Concurrently)

```bash
# Run both servers with one command:
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 9. Testing & Quality Validation

### Automated Backend Tests
Run the 18 Vitest unit and integration tests:

```bash
npm run test
```

**Tested Test Suites:**
- ✅ Health and public catalog endpoints (categories, packages).
- ✅ Authentication, bcrypt password verification, and JWT issuance.
- ✅ Role-Based Access Control (Customer blocked from `/api/admin/stats`).
- ✅ Pricing integrity: tamper-resistant calculation of base price, add-ons, and taxes.
- ✅ Hybrid AI celebration recommendations and database grounding.
- ✅ Grounded AI assistant chatbot queries.
- ✅ Multi-vendor booking creation in atomic transactions.
- ✅ Vendor isolation: private analytics and assigned request views.

### Frontend Production Build Check
```bash
cd frontend
npm run build
```
*Builds successfully with zero TypeScript compiler errors.*

---

## 10. Deployment Instructions

### Frontend (Vercel)
1. Import repository on Vercel with Root Directory set to `frontend`.
2. Build Command: `npm run build`, Output Directory: `dist`.
3. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.

### Backend (Render / Railway)
1. Deploy a Node.js web service pointing to the `backend` directory.
2. Build Command: `npm install && npm run build`.
3. Start Command: `npm run start`.
4. Configure environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://user:password@host:5432/eveplanner?sslmode=require
   JWT_SECRET=production-secret-key-min-32-chars
   GEMINI_API_KEY=your_google_gemini_key
   GEMINI_MODEL=gemini-1.5-flash
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Run migrations: `npx prisma db push --schema=prisma/schema.prisma`.
