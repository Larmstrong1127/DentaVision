const express = require('express');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Clinic registration ───────────────────────────────────
router.post('/clinic/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await Clinic.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const clinic = await Clinic.create({ name, email, password, phone, address });
    const token = signToken(clinic._id, 'clinic');

    res.status(201).json({
      token,
      user: clinic,
      message: `Welcome to DentaVision! Your clinic registration code is: ${clinic.registrationCode}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Clinic login ──────────────────────────────────────────
router.post('/clinic/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clinic = await Clinic.findOne({ email }).select('+password');
    if (!clinic || !(await clinic.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (clinic.status === 'pending') {
      return res.status(403).json({ error: 'Your clinic account is pending admin approval. You will receive an email when approved.', status: 'pending' });
    }
    if (clinic.status === 'rejected') {
      return res.status(403).json({ error: 'Your clinic application was not approved. Contact support@dentavision.app', status: 'rejected' });
    }
    const token = signToken(clinic._id, 'clinic');
    res.json({ token, user: clinic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Patient registration ──────────────────────────────────
router.post('/patient/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, phone, clinicCode } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email and password required' });
    }

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    let clinicId = null;
    if (clinicCode) {
      const clinic = await Clinic.findOne({ registrationCode: clinicCode.toUpperCase() });
      if (!clinic) return res.status(404).json({ error: 'Clinic code not found. Check with your dental office.' });
      clinicId = clinic._id;
      // Increment clinic patient count
      await Clinic.findByIdAndUpdate(clinicId, { $inc: { 'stats.totalPatients': 1 } });
    }

    const patient = await Patient.create({
      firstName, lastName, email, password, dateOfBirth, phone,
      clinicId, clinicRegistrationCode: clinicCode?.toUpperCase()
    });

    const token = signToken(patient._id, 'patient');
    res.status(201).json({ token, user: patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Patient login ─────────────────────────────────────────
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient || !(await patient.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Track login
    await Patient.findByIdAndUpdate(patient._id, {
      $inc: { 'engagement.totalLogins': 1 },
      $set: { 'engagement.lastLogin': new Date() }
    });
    const token = signToken(patient._id, 'patient');
    res.json({ token, user: patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get current user ──────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const Model = req.user.role === 'clinic' ? Clinic : Patient;
    const user = await Model.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
