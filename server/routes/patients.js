const express = require('express');
const { authenticate, requirePatient } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');

const router = express.Router();

// ── Patient profile ───────────────────────────────────────
router.get('/profile', authenticate, requirePatient, async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id)
      .populate('clinicId', 'name address phone logoUrl registrationCode');
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update patient profile ────────────────────────────────
router.put('/profile', authenticate, requirePatient, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.patient._id,
      { firstName, lastName, phone, dateOfBirth },
      { new: true }
    ).populate('clinicId', 'name address phone');
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Link patient to a clinic via registration code ────────
router.post('/link-clinic', authenticate, requirePatient, async (req, res) => {
  try {
    const { code } = req.body;
    const clinic = await Clinic.findOne({ registrationCode: code.toUpperCase() });
    if (!clinic) return res.status(404).json({ error: 'Clinic code not found' });

    await Patient.findByIdAndUpdate(req.patient._id, {
      clinicId: clinic._id,
      clinicRegistrationCode: code.toUpperCase()
    });

    await Clinic.findByIdAndUpdate(clinic._id, {
      $inc: { 'stats.totalPatients': 1 }
    });

    res.json({ success: true, clinic: { name: clinic.name, address: clinic.address } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
