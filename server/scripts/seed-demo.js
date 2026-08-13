/**
 * Seed a self-contained demo clinic + patient so the live demo works for a
 * stranger with zero setup.
 *
 *   node scripts/seed-demo.js
 *
 * Idempotent: re-running replaces the demo accounts and their data. Reads
 * MONGODB_URI from the environment (same variable the server uses). Passwords
 * are hashed by the models' own pre-save hooks — this script never writes a
 * hash by hand.
 *
 * Demo credentials (intentionally public — this is sample data only):
 *   Clinic:  demo@dentavision.app  /  DemoClinic2026!
 *   Patient: patient@dentavision.app  /  DemoPatient2026!
 *   Clinic registration code: DEMO2026
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');

const CLINIC_EMAIL = 'demo@dentavision.app';
const PATIENT_EMAIL = 'patient@dentavision.app';

const FINDINGS = [
  { toothNumber: 3,  surfaces: ['occlusal'],            condition: 'caries',        cdtCodes: ['D2392'], priority: 'urgent',   procedureName: 'Composite filling (2 surfaces)', visitNumber: 1, visitLabel: 'Visit 1 — urgent care', notes: 'Deep occlusal decay, sensitive to cold.' },
  { toothNumber: 19, surfaces: ['mesial', 'occlusal'],  condition: 'fractured cusp', cdtCodes: ['D2740'], priority: 'urgent',   procedureName: 'Ceramic crown',                  visitNumber: 1, visitLabel: 'Visit 1 — urgent care', notes: 'Fracture line visible; crown recommended before it deepens.' },
  { toothNumber: 14, surfaces: ['occlusal'],            condition: 'caries',        cdtCodes: ['D2391'], priority: 'moderate', procedureName: 'Composite filling (1 surface)',  visitNumber: 2, visitLabel: 'Visit 2 — restorative', notes: 'Early decay caught on bitewing.' },
  { toothNumber: 30, surfaces: ['occlusal', 'buccal'],  condition: 'failing amalgam', cdtCodes: ['D2392'], priority: 'moderate', procedureName: 'Replace amalgam with composite', visitNumber: 2, visitLabel: 'Visit 2 — restorative', notes: 'Marginal leakage around 15-year-old filling.' },
  { toothNumber: 8,  surfaces: [],                      condition: 'watch',         cdtCodes: ['D0120'], priority: 'watch',    procedureName: 'Monitor at recall',              visitNumber: 3, visitLabel: 'Visit 3 — hygiene & recall', notes: 'Slight enamel wear; no treatment needed yet.' },
  { toothNumber: 24, surfaces: [],                      condition: 'healthy',       cdtCodes: [],        priority: 'healthy',  procedureName: '',                               visitNumber: 3, visitLabel: 'Visit 3 — hygiene & recall', notes: '' },
];

const APPOINTMENTS = [
  {
    visitNumber: 1, visitLabel: 'Visit 1 — urgent care', priority: 'urgent',
    procedures: FINDINGS.filter((f) => f.visitNumber === 1),
    estimatedDurationMins: 90, durationLabel: '~90 minutes',
  },
  {
    visitNumber: 2, visitLabel: 'Visit 2 — restorative', priority: 'moderate',
    procedures: FINDINGS.filter((f) => f.visitNumber === 2),
    estimatedDurationMins: 60, durationLabel: '~60 minutes',
  },
  {
    visitNumber: 3, visitLabel: 'Visit 3 — hygiene & recall', priority: 'watch',
    procedures: FINDINGS.filter((f) => f.visitNumber === 3),
    estimatedDurationMins: 45, durationLabel: '~45 minutes',
  },
];

const AI_SUMMARY =
  'Your dentist found two items that should be treated soon: a deep cavity on an ' +
  'upper right molar and a cracked lower left molar that needs a crown — both are ' +
  'scheduled first. Two smaller fillings can wait for a second visit. One front ' +
  'tooth is just being watched and needs no treatment. Three visits total; the ' +
  'urgent visit is the one not to postpone.';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('connected');

  // Replace any previous demo data wholesale — idempotent by construction.
  await Patient.deleteOne({ email: PATIENT_EMAIL });
  await Clinic.deleteOne({ email: CLINIC_EMAIL });

  const clinic = new Clinic({
    email: CLINIC_EMAIL,
    password: 'DemoClinic2026!',
    name: 'DentaVision Demo Clinic',
    phone: '(555) 010-2026',
    address: { street: '100 Demo Way', city: 'Issaquah', state: 'WA', zip: '98029' },
    website: 'https://denta-vision.vercel.app',
    registrationCode: 'DEMO2026',
  });
  await clinic.save();
  console.log(`clinic seeded: ${CLINIC_EMAIL} (code ${clinic.registrationCode})`);

  const patient = new Patient({
    email: PATIENT_EMAIL,
    password: 'DemoPatient2026!',
    firstName: 'Demo',
    lastName: 'Patient',
    dateOfBirth: new Date('1990-06-15'),
    phone: '(555) 010-1990',
    clinicId: clinic._id,
    clinicRegistrationCode: clinic.registrationCode,
    treatmentPlans: [{
      scanDate: new Date(),
      rawText: '[seeded demo plan — no real patient data]',
      findings: FINDINGS,
      appointments: APPOINTMENTS,
      aiSummary: AI_SUMMARY,
      status: 'complete',
      acceptedVisits: [],
    }],
  });
  await patient.save();
  console.log(`patient seeded: ${PATIENT_EMAIL} (1 complete treatment plan, 3 visits)`);

  await mongoose.disconnect();
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
