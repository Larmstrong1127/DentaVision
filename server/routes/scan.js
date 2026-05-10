const express = require('express');
const multer = require('multer');
const { authenticate, requireClinic } = require('../middleware/auth');
const { parseTreatmentPlan } = require('../services/aiService');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');

const router = express.Router();

// Store uploads in memory (convert to base64 for Claude)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WebP, or PDF allowed'));
  }
});

// ── Clinic scans a plan for a patient ────────────────────
// POST /api/scan/plan
router.post('/plan', authenticate, requireClinic, upload.single('plan'), async (req, res) => {
  try {
    const { patientId, rawText } = req.body;

    // Find patient and verify they belong to this clinic
    const patient = await Patient.findOne({ _id: patientId, clinicId: req.clinic._id });
    if (!patient) return res.status(404).json({ error: 'Patient not found in your clinic' });

    // ── Rate limit: max 2 scans per patient per calendar day ─
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rl = patient.scanRateLimit || {};
    const isToday = rl.date && new Date(rl.date) >= todayStart;
    const scanCountToday = isToday ? (rl.count || 0) : 0;

    if (scanCountToday >= 2) {
      return res.status(429).json({
        error: 'Daily scan limit reached for this patient. A patient\'s plan can only be updated twice per day. Please try again tomorrow.'
      });
    }

    let imageBase64 = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (!rawText) {
      return res.status(400).json({ error: 'Either upload an image/PDF or provide plan text' });
    }

    // Parse with Claude AI
    const parsed = await parseTreatmentPlan(imageBase64, mimeType, rawText);

    // Build treatment plan object
    const plan = {
      scanDate: new Date(),
      rawText: rawText || null,
      findings: parsed.findings,
      appointments: parsed.appointments || [],
      aiSummary: parsed.summary,
      status: 'complete'
    };

    // ── Replace (not append) — patient always has exactly one active plan ─
    patient.treatmentPlans = [plan];

    // ── Update rate limit counter ─────────────────────────────
    patient.scanRateLimit = {
      date:  new Date(),
      count: scanCountToday + 1
    };

    await patient.save();

    // Update clinic stats
    await Clinic.findByIdAndUpdate(req.clinic._id, {
      $inc: { 'stats.totalScans': 1 }
    });

    const savedPlan = patient.treatmentPlans[0];

    res.json({
      success: true,
      planId: savedPlan._id,
      plan: savedPlan,
      patientName: patient.fullName,
      scansRemainingToday: 2 - (scanCountToday + 1)
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message || 'Scan failed. Please try again.' });
  }
});

// ── Check patient scan status (for clinic UI pre-submit warning) ─
// GET /api/scan/patient-status/:patientId
router.get('/patient-status/:patientId', authenticate, requireClinic, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      clinicId: req.clinic._id
    }).select('firstName lastName treatmentPlans scanRateLimit');

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rl = patient.scanRateLimit || {};
    const isToday = rl.date && new Date(rl.date) >= todayStart;
    const scanCountToday = isToday ? (rl.count || 0) : 0;

    res.json({
      hasPlan: patient.treatmentPlans.length > 0,
      lastScanDate: patient.treatmentPlans[0]?.scanDate || null,
      scansUsedToday: scanCountToday,
      scansRemainingToday: Math.max(0, 2 - scanCountToday),
      patientName: `${patient.firstName} ${patient.lastName}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Patient views their own plans ─────────────────────────
// GET /api/scan/my-plans
router.get('/my-plans', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patient account required' });

    const patient = await Patient.findById(req.user.id)
      .populate('clinicId', 'name address phone logoUrl');

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Track plan view
    await Patient.findByIdAndUpdate(req.user.id, {
      $inc: { 'engagement.planViewCount': 1 }
    });

    res.json({
      plans: patient.treatmentPlans,
      clinic: patient.clinicId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single plan ───────────────────────────────────────
// GET /api/scan/plan/:planId
router.get('/plan/:planId', authenticate, async (req, res) => {
  try {
    const patient = await Patient.findOne(
      req.user.role === 'patient'
        ? { _id: req.user.id }
        : { clinicId: req.user.id }
    );
    if (!patient) return res.status(404).json({ error: 'Not found' });

    const plan = patient.treatmentPlans.id(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Patient confirms visit appointments ───────────────────
// POST /api/scan/plan/:planId/accept
router.post('/plan/:planId/accept', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' });
    const { acceptedVisits } = req.body; // array of visit numbers the patient confirmed

    const patient = await Patient.findById(req.user.id);
    const plan = patient.treatmentPlans.id(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    plan.acceptedVisits = acceptedVisits;
    await patient.save();

    // Update clinic accepted-treatment count
    if (patient.clinicId) {
      await Clinic.findByIdAndUpdate(patient.clinicId, {
        $inc: { 'stats.acceptedTreatments': acceptedVisits.length }
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
