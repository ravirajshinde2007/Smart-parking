# ParkSmart — Smart Parking Management System

A full-stack, enterprise-grade smart parking reservation, camera plate recognition (OCR), and slot management system.

---

## Project Structure & Architecture

The codebase is organized into cleanly separated tiers:

```text
Smart parking/
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── middleware/       # Authentication & security middlewares
│   │   │   └── auth.js       # JWT verification & role guard (USER, ADMIN, OPERATOR)
│   │   ├── routes/           # RESTful API route controllers
│   │   │   ├── access.js     # Vehicle camera OCR entry/exit verification
│   │   │   ├── admin.js      # Admin dashboard statistics & management
│   │   │   ├── auth.js       # Register, login, profile & password
│   │   │   ├── bookings.js   # Slot booking, cancellation & status
│   │   │   ├── notifications.js # System & user notifications
│   │   │   ├── parking.js    # Locations, search & real-time slots
│   │   │   └── payments.js   # Payment processing & transaction history
│   │   ├── utils/            # Utilities & background engines
│   │   │   ├── ocr.js        # Tesseract.js optical character recognition
│   │   │   └── plate.js      # Indian license plate normalization & fuzzy match
│   │   ├── db.js             # MySQL connection pool configuration
│   │   └── server.js         # Express app entry, routes mounting & error handling
│   ├── schema.sql            # MySQL DDL table schema definitions
│   ├── seed.sql              # Initial parking lots, slots & demo data
│   ├── uploads/              # Stored vehicle entrance/exit snapshot photos
│   ├── package.json          # Backend dependencies (Express, Tesseract, MySQL2)
│   └── .env.example          # Backend environment template
│
├── frontend/                 # Classic Vanilla Frontend (Served by Express)
│   ├── index.html            # Main customer application UI
│   ├── style.css             # Full ParkSmart responsive theme & animations
│   ├── script.js             # Client-side map & UI interactions
│   ├── backend.js            # API communication layer (Auth, Bookings, Camera OCR)
│   ├── admin.html            # Admin dashboard interface
│   ├── admin.css             # Admin dashboard dark-mode styling
│   ├── admin.js              # Admin dashboard data fetching & table rendering
│   ├── manifest.json         # PWA web manifest
│   ├── service-worker.js     # Offline service worker cache
│   ├── parking-8k.jpg        # Hero banner background asset
│   ├── live-parking.mp4      # Live CCTV video feed simulation asset
│   └── icons/                # Vector app icons
│
├── src/                      # Next.js 15 Full-Stack React 19 Application
│   ├── app/                  # Next.js App Router
│   │   ├── admin/page.tsx    # React Admin Dashboard
│   │   ├── api/              # Serverless Next.js API route handlers
│   │   ├── globals.css       # Tailwind CSS base styles
│   │   ├── original.css      # Synchronized ParkSmart component styles
│   │   ├── layout.tsx        # Root HTML layout with Leaflet CDN
│   │   └── page.tsx          # Main React customer application & interactive map
│   ├── components/           # Modular React UI components
│   │   ├── AccessLogsView.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AuthModal.tsx
│   │   ├── BookingModal.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navbar.tsx
│   │   ├── ParkingCard.tsx
│   │   ├── PaymentsView.tsx
│   │   ├── ReservationsView.tsx
│   │   └── SlotMapModal.tsx
│   ├── lib/                  # Shared helper libraries (auth, db, plate, utils)
│   └── types/                # TypeScript type definitions (User, Booking, Slot, etc.)
│
├── public/                   # Static assets for Next.js (video, image, icons)
│   ├── icons/
│   ├── live-parking.mp4
│   └── parking-8k.jpg
│
├── package.json              # Workspace root configuration & convenience scripts
├── tsconfig.json             # TypeScript compiler settings
├── tailwind.config.ts        # Tailwind CSS utility configuration
├── next.config.mjs           # Next.js bundler & runtime configuration
├── START-WINDOWS.txt         # Quick execution sequence for Windows users
└── README.md                 # Complete project documentation
```

---

## Step-by-Step Execution Sequence

Follow these steps in sequence to set up and run the project:

### Sequence 1: Database Setup (Prerequisite)

1. Open **MySQL Workbench** or MySQL CLI.
2. Execute `backend/schema.sql` to create the `parksmart` database and all tables.
3. Execute `backend/seed.sql` to seed sample parking locations, slots, and demo data.

### Sequence 2: Configuration

1. In the `backend` directory, create `.env` from `.env.example`:
   ```bash
   copy backend\.env.example backend\.env
   ```
2. Edit `backend/.env` and enter your MySQL root password:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

### Sequence 3: Running the Application

Choose either stack:

#### Option A: Node.js Express + Vanilla Frontend
```bash
# From workspace root:
npm run dev:backend

# Or from backend directory:
cd backend
npm run dev
```
- **Customer UI**: [http://localhost:5000](http://localhost:5000)
- **Admin Dashboard**: [http://localhost:5000/admin](http://localhost:5000/admin)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Option B: Next.js 15 Full-Stack App
```bash
# From workspace root:
npm run dev
```
- **Customer UI**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Health**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@gmail.com` | `raviraj@2007` |
| **Demo Customer** | `rahul.verma@example.com` | `password123` |

*(The Admin account is automatically verified and provisioned in MySQL when the backend boots).*

---

## Workspace Scripts Summary

From the root directory:

- `npm run dev` — Starts Next.js development server on port 3000
- `npm run dev:backend` — Starts Express + MySQL backend on port 5000
- `npm run check` — Validates TypeScript types across the Next.js application
- `npm run check:backend` — Performs syntax check across all backend route and utility files
- `npm run build` — Builds production bundle for Next.js
