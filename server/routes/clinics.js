const express = require('express');
const { authenticate, requireClinic } = require('../middleware/auth');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');

const router = express.Router();

// ── Clinic dashboard data ─────────────────────────────────
router.get('/dashboard', authenticate, requireClinic, async (req, res) => {
  try {
    const clinic = req.clinic;

    // Get recent patients with their latest plan
    const patients = await Patient.find({ clinicId: clinic._id })
      .select('firstName lastName email engagement treatmentPlans createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    // Compute acceptance rate from recent plans
    let totalProcedures = 0, acceptedProcedures = 0;
    patients.forEach(p => {
      p.treatmentPlans.forEach(plan => {
        const findings = plan.findings.filter(f => f.priority !== 'healthy');
        totalProcedures += findings.length;
        acceptedProcedures += (plan.acceptedProcedures || []).length;
      });
    });

    const acceptanceRate = totalProcedures > 0
      ? Math.round((acceptedProcedures / totalProcedures) * 100)
      : 0;

    res.json({
      clinic,
      stats: {
        ...clinic.stats,
        acceptanceRate,
        activePatientsThisMonth: patients.filter(p => {
          const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
          return p.engagement.lastLogin > cutoff;
        }).length
      },
      recentPatients: patients.map(p => ({
        id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        lastLogin: p.engagement.lastLogin,
        planCount: p.treatmentPlans.length,
        latestPlanDate: p.treatmentPlans[p.treatmentPlans.length - 1]?.scanDate,
        hasUrgent: p.treatmentPlans.some(plan =>
          plan.findings.some(f => f.priority === 'urgent')
        )
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all clinic patients ───────────────────────────────
router.get('/patients', authenticate, requireClinic, async (req, res) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const query = { clinicId: req.clinic._id };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .select('-treatmentPlans.rawText') // don't send raw text in list
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    res.json({ patients, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single patient detail ─────────────────────────────
router.get('/patients/:patientId', authenticate, requireClinic, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      clinicId: req.clinic._id
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update clinic profile ─────────────────────────────────
router.put('/profile', authenticate, requireClinic, async (req, res) => {
  try {
    const { name, phone, address, website } = req.body;
    const clinic = await Clinic.findByIdAndUpdate(
      req.clinic._id,
      { name, phone, address, website },
      { new: true }
    );
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get registration code ─────────────────────────────────
router.get('/registration-code', authenticate, requireClinic, async (req, res) => {
  res.json({
    code: req.clinic.registrationCode,
    shareUrl: `${process.env.CLIENT_URL}/join/${req.clinic.registrationCode}`
  });
});

module.exports = router;
