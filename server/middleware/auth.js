const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');

// Verify JWT and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Must be a clinic account
const requireClinic = async (req, res, next) => {
  if (req.user?.role !== 'clinic') {
    return res.status(403).json({ error: 'Clinic account required' });
  }
  const clinic = await Clinic.findById(req.user.id);
  if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
  if (!clinic.isActive) return res.status(403).json({ error: 'Clinic subscription inactive' });
  req.clinic = clinic;
  next();
};

// Must be a patient account
const requirePatient = async (req, res, next) => {
  if (req.user?.role !== 'patient') {
    return res.status(403).json({ error: 'Patient account required' });
  }
  const patient = await Patient.findById(req.user.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  req.patient = patient;
  next();
};

// Clinic OR patient can access (used for shared resources)
const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
};

module.exports = { authenticate, requireClinic, requirePatient, requireAuth };
