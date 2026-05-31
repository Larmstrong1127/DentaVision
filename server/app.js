require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinics');
const patientRoutes = require('./routes/patients');
const scanRoutes = require('./routes/scan');
const educationRoutes = require('./routes/education');
const billingRoutes = require('./routes/billing');
const adminRoutes = require('./routes/admin');
const consultationRoutes = require('./routes/consultations');

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Raw body required for Stripe webhook — must be before express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 500 : 50,
  message: 'Scan limit reached. Try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);
app.use('/api/scan', scanLimiter);

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consultations', consultationRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
