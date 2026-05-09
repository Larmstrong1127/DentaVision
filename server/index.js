require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinics');
const patientRoutes = require('./routes/patients');
const scanRoutes = require('./routes/scan');
const educationRoutes = require('./routes/education');

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────
// Dev: very permissive so page loads never hit limits
// Production: tighten before going live
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

// ── Database ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/education', educationRoutes);

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🦷 DentaVision server running on port ${PORT}`));
