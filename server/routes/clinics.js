const express = require('express');
const { authenticate, requireClinic } = require('../middleware/auth');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');

const router = express.Router();

// ── Clinic dashboard data ─────────────────────────────────
router.get('/dashboard', authenticate, requireClinic, async (req, res) => {
  try {
    const clinic = req.clinic;

    // Fetch ALL patients for accurate analytics
    const allPatients = await Patient.find({ clinicId: clinic._id })
      .select('firstName lastName email engagement treatmentPlans createdAt');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const totalPatients = allPatients.length;
    const withPlan = allPatients.filter(p => p.treatmentPlans.length > 0).length;
    const withUrgent = allPatients.filter(p =>
      p.treatmentPlans.some(plan => plan.findings.some(f => f.priority === 'urgent'))
    ).length;
    const newThisMonth = allPatients.filter(p => new Date(p.createdAt) >= monthStart).length;
    const activeThisMonth = allPatients.filter(p =>
      p.engagement.lastLogin && new Date(p.engagement.lastLogin) >= thirtyDaysAgo
    ).length;
    const planEngagement = totalPatients > 0
      ? Math.round((withPlan / totalPatients) * 100)
      : 0;

    // Acceptance rate across all plans
    let totalProcedures = 0, acceptedProcedures = 0;
    allPatients.forEach(p => {
      p.treatmentPlans.forEach(plan => {
        const findings = plan.findings.filter(f => f.priority !== 'healthy');
        totalProcedures += findings.length;
        acceptedProcedures += (plan.acceptedProcedures || []).length;
      });
    });
    const acceptanceRate = totalProcedures > 0
      ? Math.round((acceptedProcedures / totalProcedures) * 100)
      : 0;

    // Recent patients (last 8, newest first)
    const recentPatients = [...allPatients]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(p => ({
        id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        joinedAt: p.createdAt,
        lastLogin: p.engagement.lastLogin,
        planCount: p.treatmentPlans.length,
        latestPlanDate: p.treatmentPlans[p.treatmentPlans.length - 1]?.scanDate,
        hasUrgent: p.treatmentPlans.some(plan =>
          plan.findings.some(f => f.priority === 'urgent')
        )
      }));

    res.json({
      clinic,
      stats: {
        totalPatients,
        withPlan,
        withUrgent,
        newThisMonth,
        activeThisMonth,
        planEngagement,
        acceptanceRate,
        totalScans: clinic.stats.totalScans,
      },
      recentPatients,
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

    // Support multi-field search: firstName, lastName, preferredName, dob, email
    const { firstName, lastName, preferredName, dob } = req.query;
    const orClauses = [];
    if (search) {
      orClauses.push(
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { preferredName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      );
    }
    if (firstName) query.firstName = { $regex: firstName, $options: 'i' };
    if (lastName)  query.lastName  = { $regex: lastName,  $options: 'i' };
    if (preferredName) {
      orClauses.push(
        { preferredName: { $regex: preferredName, $options: 'i' } },
        { firstName:     { $regex: preferredName, $options: 'i' } }
      );
    }
    if (dob) {
      // Match date of birth — accept partial strings like "1990" or "05/12"
      const dobDate = new Date(dob);
      if (!isNaN(dobDate)) {
        const start = new Date(dobDate); start.setHours(0,0,0,0);
        const end   = new Date(dobDate); end.setHours(23,59,59,999);
        query.dateOfBirth = { $gte: start, $lte: end };
      }
    }
    if (orClauses.length > 0) query.$or = orClauses;

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
