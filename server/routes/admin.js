const express = require('express');
const Clinic = require('../models/Clinic');
const ConsultationRequest = require('../models/ConsultationRequest');

const router = express.Router();

// ── Admin auth middleware ──────────────────────────────────
const adminAuth = async (req, res, next) => {
  const { authenticate } = require('../middleware/auth');
  authenticate(req, res, async () => {
    if (req.user.role !== 'clinic') return res.status(403).json({ error: 'Admin access required' });
    const clinic = await Clinic.findById(req.user.id);
    if (!clinic || !clinic.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  });
};

// ── GET /api/admin/stats ──────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalClinics, pendingClinics, approvedClinics, totalConsultations, newConsultations] = await Promise.all([
      Clinic.countDocuments({}),
      Clinic.countDocuments({ status: 'pending' }),
      Clinic.countDocuments({ status: 'approved' }),
      ConsultationRequest.countDocuments({}),
      ConsultationRequest.countDocuments({ status: 'new' }),
    ]);
    res.json({ totalClinics, pendingClinics, approvedClinics, totalConsultations, newConsultations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/clinics ────────────────────────────────
router.get('/clinics', adminAuth, async (req, res) => {
  try {
    const clinics = await Clinic.find({})
      .sort({ createdAt: -1 })
      .select('name email npi providerCount status stats subscription.plan createdAt');
    res.json({ clinics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/clinics/:id/approve ────────────────────
router.put('/clinics/:id/approve', adminAuth, async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/clinics/:id/reject ─────────────────────
router.put('/clinics/:id/reject', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminNotes: reason },
      { new: true }
    );
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/consultations ──────────────────────────
router.get('/consultations', adminAuth, async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({}).sort({ createdAt: -1 });
    res.json({ consultations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/consultations/:id/status ───────────────
router.put('/consultations/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const consultation = await ConsultationRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json({ consultation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
