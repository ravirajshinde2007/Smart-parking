# ParkSmart — Node.js + Express + MySQL Backend

This package keeps the existing ParkSmart UI/idea and moves the important state and business logic to the server.

## What moved to the backend

- User registration/login with bcrypt password hashing + JWT
- Parking locations and availability
- Slot status and server-side double-booking protection
- Booking creation/cancellation
- Payment records and transaction IDs
- Entry/exit logs
- Vehicle photos
- Server-side OCR of the captured vehicle image
- Plate matching against the vehicle number entered during booking
- Extra payment calculation after exit
- Notifications
- Protected access to stored vehicle photos

The frontend keeps only a short-lived authentication token and UI/cache state. Booking records are no longer stored in localStorage/IndexedDB.

## Project layout

```text
parksmart-node-backend/
├─ backend/
│  ├─ src/
│  │  ├─ middleware/auth.js
│  │  ├─ routes/auth.js
│  │  ├─ routes/parking.js
│  │  ├─ routes/bookings.js
│  │  ├─ routes/access.js
│  │  ├─ routes/payments.js
│  │  ├─ routes/notifications.js
│  │  ├─ utils/ocr.js
│  │  ├─ utils/plate.js
│  │  ├─ db.js
│  │  └─ server.js
│  ├─ schema.sql
│  ├─ seed.sql
│  ├─ package.json
│  └─ .env.example
└─ frontend/
   ├─ index.html
   ├─ script.js
   ├─ style.css
   └─ backend.js
```

## 1. Create the MySQL database

Open MySQL Workbench or the MySQL terminal:

```sql
SOURCE /full/path/to/backend/schema.sql;
SOURCE /full/path/to/backend/seed.sql;
```

Or paste the two SQL files into MySQL Workbench and execute them.

## 2. Configure the backend

Open `backend/.env.example`, copy it to `backend/.env`, then set your MySQL password and JWT secret.

Example:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=parksmart
DB_USER=root
DB_PASSWORD=your_mysql_password

UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=8
OCR_LANGUAGE=eng
ALLOW_MANUAL_PLATE=false
```

`ALLOW_MANUAL_PLATE=false` is intentional: entry/exit should not be accepted just because a user typed a matching number. The server checks the captured image with OCR.

## 3. Install and start

```bash
cd backend
npm install
npm run dev
```

Open:

```text
http://localhost:5000
```

Do not open `frontend/index.html` directly with `file://`. Camera access and API calls are more reliable through `localhost` or HTTPS.

## Camera + plate matching flow

1. User books a slot and enters vehicle number, e.g. `MH 15 AB 1234`.
2. Booking is stored in MySQL.
3. At entry, ParkSmart opens the browser camera.
4. The user captures the vehicle/plate photo.
5. The image is uploaded to Express using `multipart/form-data`.
6. Tesseract OCR runs on the server.
7. The detected plate is normalized and compared with the booking number.
8. If it matches, the booking becomes `PARKED` and the slot becomes `OCCUPIED`.
9. At exit, the same process happens again.
10. If it matches, the booking becomes `COMPLETED` and the slot becomes `VACANT`.
11. If it does not match, the photo/log is saved and the booking is placed into review instead of silently allowing exit.

For a production parking gate, replace the demo OCR with a dedicated ALPR/ANPR engine or camera service because ordinary OCR is not reliable enough for every plate, angle, lighting condition, and distance.

## API overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Parking
- `GET /api/parking/search?q=Nashik`
- `GET /api/parking/nearby?lat=19.99&lng=73.76&radiusKm=15`
- `GET /api/parking/:id/slots`

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/bookings/:id/cancel`

### Entry/Exit
- `POST /api/access/:bookingId/entry`
- `POST /api/access/:bookingId/exit`
- `GET /api/access/:bookingId/logs`
- `GET /api/access/photo/:photoId`

### Payments
- `GET /api/payments`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/:id/read`

## Important production upgrades

- Use Razorpay/Stripe instead of the current demo payment form.
- Add an operator/admin dashboard for manual plate-review cases.
- Add QR code on the booking confirmation so a gate scanner can find the booking immediately.
- Add automatic reservation expiry if a driver does not enter within the allowed grace period.
- Add real-time slot updates with Socket.IO.
- Add EV-only, disabled-access, and two-wheeler slot types.
- Add audit logs for operator actions.
- Move uploaded photos to S3/Cloud Storage in production rather than local disk.
- Encrypt sensitive data at rest and apply strict retention/deletion rules for vehicle images.
- Add rate limiting and account lockout/2FA for operator/admin accounts.

## Admin panel

A separate read-only admin panel is included at:

`http://localhost:5000/admin`

It uses the existing ParkSmart authentication and the existing MySQL data. The customer-facing UI and its existing booking/payment/entry-exit logic are not replaced.

Admin panel features:
- Dashboard summary
- Users
- Parking locations and slot status
- All bookings
- All payments
- Entry/exit and plate-review logs
- Search/filter tables
- Refresh data

The admin API is read-only and accepts only `ADMIN` or `OPERATOR` JWT roles. It does not update or delete customer data.

Use an existing account whose `role` is `ADMIN` or `OPERATOR`. Normal `USER` accounts are intentionally rejected from the admin panel.

## Admin login

The admin version automatically creates or updates this dedicated admin account when the backend starts:

```text
Email: admin@gmail.com
Password: raviraj@2007
Role: ADMIN
```

Open `http://localhost:5000/admin` for the admin panel. The startup provisioning only changes the account with this exact email; existing customer accounts and their data are otherwise preserved.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New...** > **Project** and import this repository.
3. Keep default settings (Root directory `./`, Framework: Other).
4. Add the required Environment Variables under **Settings > Environment Variables**:
   - `DB_HOST`: Host of your cloud MySQL database (e.g. TiDB Cloud, Aiven, Railway, AWS RDS)
   - `DB_PORT`: `3306` (or provider's port)
   - `DB_NAME`: `parksmart`
   - `DB_USER`: Your cloud database user
   - `DB_PASSWORD`: Your cloud database password
   - `DB_SSL`: `true` (if your cloud MySQL provider requires SSL)
   - `JWT_SECRET`: A long secure random string
   - `ADMIN_EMAIL`: `admin@gmail.com`
   - `ADMIN_PASSWORD`: `raviraj@2007`
   - `UPLOAD_DIR`: `/tmp/uploads`
5. Click **Deploy**. Vercel will host both the frontend and backend serverless API seamlessly using `vercel.json` and `api/index.js`.
