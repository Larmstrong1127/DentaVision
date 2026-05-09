const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Tooth findings schema — one per tooth (for the interactive chart)
const toothFindingSchema = new mongoose.Schema({
  toothNumber: { type: Number, required: true, min: 1, max: 32 },
  surfaces: [{ type: String, enum: ['mesial', 'occlusal', 'distal', 'buccal', 'lingual', 'facial', 'incisal'] }],
  condition: String,       // e.g. "caries", "missing", "crown needed"
  cdtCodes: [String],      // e.g. ["D2391", "D0140"]
  priority: { type: String, enum: ['urgent', 'moderate', 'watch', 'healthy'], default: 'healthy' },
  notes: String,
  procedureName: String,   // human-readable: "Composite filling"
  visitNumber: Number,
  visitLabel: String,
}, { _id: false });

// Single procedure within an appointment
const appointmentProcedureSchema = new mongoose.Schema({
  toothNumber: Number,
  surfaces: [String],
  condition: String,
  cdtCodes: [String],
  priority: { type: String, enum: ['urgent', 'moderate', 'watch', 'healthy'], default: 'healthy' },
  procedureName: String,
  notes: String,
  visitNumber: Number,
  visitLabel: String,
}, { _id: false });

// Appointment group — one dental visit worth of procedures
const appointmentSchema = new mongoose.Schema({
  visitNumber: Number,
  visitLabel: String,
  priority: { type: String, enum: ['urgent', 'moderate', 'watch', 'healthy'], default: 'healthy' },
  procedures: [appointmentProcedureSchema],
  estimatedDurationMins: Number,
  durationLabel: String,
  accepted: { type: Boolean, default: false },
}, { _id: false });

// Full treatment plan from one scan
const treatmentPlanSchema = new mongoose.Schema({
  scanDate: { type: Date, default: Date.now },
  rawText: String,
  imageUrl: String,
  findings: [toothFindingSchema],       // flat list for tooth chart
  appointments: [appointmentSchema],    // grouped by visit for treatment ordering
  aiSummary: String,
  status: { type: String, enum: ['pending', 'complete', 'error'], default: 'pending' },
  acceptedVisits: [Number],             // visit numbers patient has confirmed
}, { timestamps: true });

const patientSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  // Profile
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: Date,
  phone: String,

  // Clinic link
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  clinicRegistrationCode: String,

  // Treatment history
  treatmentPlans: [treatmentPlanSchema],

  // Engagement tracking
  engagement: {
    lastLogin: Date,
    totalLogins: { type: Number, default: 0 },
    educationTopicsViewed: [String],
    questionsAsked: { type: Number, default: 0 },
    planViewCount: { type: Number, default: 0 }
  },

  role: { type: String, default: 'patient' }
}, { timestamps: true });

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

patientSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

patientSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Patient', patientSchema);
