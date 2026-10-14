require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 5000);

// =========================================================
// 1. PATH RESOLUTIONS
// =========================================================
const defaultUploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.resolve(__dirname, '../uploads');

const uploadDir = process.env.UPLOAD_DIR || defaultUploadDir;
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('Upload directory warning:', e.message);
}

// Locate frontend directory (supports root/frontend and parent/frontend)
const frontendCandidates = [
  path.resolve(__dirname, '../../frontend'),
  path.resolve(__dirname, '../frontend'),
  path.resolve(process.cwd(), 'frontend')
];
const frontend = frontendCandidates.find(p => fs.existsSync(p)) || frontendCandidates[0];

// =========================================================
// 2. SECURITY & UTILITY MIDDLEWARES
// =========================================================
const corsOrigin = process.env.CLIENT_ORIGIN
  ? (process.env.CLIENT_ORIGIN === '*' ? true : process.env.CLIENT_ORIGIN)
  : true;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://unpkg.com", "https://*.tile.openstreetmap.org", "https://server.arcgisonline.com"],
      connectSrc: ["'self'", "https://unpkg.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://nominatim.openstreetmap.org", "https://*.tile.openstreetmap.org", "https://server.arcgisonline.com"],
      fontSrc: ["'self'", "data:", "https://unpkg.com", "https://fonts.gstatic.com"],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  }
}));

app.use(cors({ origin: corsOrigin, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// =========================================================
// 3. ADMIN ACCOUNT PROVISIONING
// =========================================================
let adminAccountEnsured = false;

async function ensureAdminAccount() {
  const email = String(process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || 'raviraj@2007');
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(first_name, last_name, email, phone, password_hash, role)
     VALUES(?, ?, ?, ?, ?, 'ADMIN')
     ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='ADMIN'`,
    ['Admin', 'Administrator', email, '0000000000', passwordHash]
  );
  console.log(`Admin account ready: ${email}`);
}

async function ensureAdminAccountSafely() {
  if (adminAccountEnsured) return;
  try {
    await ensureAdminAccount();
    adminAccountEnsured = true;
  } catch (err) {
    console.warn('Admin account initialization deferred:', err.code || err.message);
  }
}

// Auto-check admin account before processing any API requests
app.use('/api', (req, res, next) => {
  if (!adminAccountEnsured) {
    ensureAdminAccountSafely().catch(() => {});
  }
  next();
});

// =========================================================
// 4. API ROUTES
// =========================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'ParkSmart API', database: true });
  } catch (e) {
    console.error('Database health check failed:', e.code, e.message);
    res.status(503).json({
      ok: false,
      service: 'ParkSmart API',
      database: false,
      message: 'Database unavailable',
      error: e.code || e.message
    });
  }
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/access', require('./routes/access'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// =========================================================
// 5. STATIC FRONTEND & SPA FALLBACK
// =========================================================
app.get('/admin', (req, res) => res.sendFile(path.join(frontend, 'admin.html')));
app.use(express.static(frontend));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(frontend, 'index.html'));
});

// =========================================================
// 6. GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// =========================================================
// 7. SERVER STARTUP
// =========================================================
async function start() {
  try {
    await pool.query('SELECT 1');
    await ensureAdminAccount();
    adminAccountEnsured = true;
    console.log('MySQL connection: OK');
    app.listen(PORT, () => console.log(`ParkSmart running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('\nParkSmart could not connect to MySQL.\n');
    console.error('Error:', e.code || e.message);
    console.error('Check that MySQL80 is running and backend/.env has the correct DB_PASSWORD.');
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module && !process.env.VERCEL) {
  start();
}