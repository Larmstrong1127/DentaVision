const express = require('express');
const ConsultationRequest = require('../models/ConsultationRequest');

const router = express.Router();

// ── POST /api/consultations ───────────────────────────────
// Public — no auth required
router.post('/', async (req, res) => {
  try {
    const { practiceName, contactName, email, phone, npi, providerCount, currentSoftware, message } = req.body;
    if (!practiceName || !contactName || !email) {
      return res.status(400).json({ error: 'Practice name, contact name, and email are required.' });
    }
    await ConsultationRequest.create({ practiceName, contactName, email, phone, npi, providerCount, currentSoftware, message });
    res.status(201).json({ message: 'Thank you! We will be in touch within 1 business day.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/consultations ────────────────────────────────
// Placeholder
router.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

module.exports = router;
