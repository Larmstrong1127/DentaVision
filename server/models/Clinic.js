const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const clinicSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  // Profile
  name: { type: String, required: true, trim: true },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  website: String,
  logoUrl: String,

  // Registration code patients use to link to this clinic
  registrationCode: {
    type: String,
    default: () => nanoid(8).toUpperCase(),
    unique: true
  },

  // Stats (denormalized for fast dashboard queries)
  stats: {
    totalPatients: { type: Number, default: 0 },
    totalScans: { type: Number, default: 0 },
    acceptedTreatments: { type: Number, default: 0 },
  },

  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'clinic' },

  // Provider info
  npi: { type: String, trim: true },
  providerCount: { type: Number, default: 1 },

  // Approval workflow
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isAdmin: { type: Boolean, default: false },
  adminNotes: { type: String },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['trial', 'starter', 'growth'], default: 'trial' },
    status: { type: String, enum: ['trial', 'active', 'past_due', 'canceled'], default: 'trial' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
  },
}, { timestamps: true });

// Hash password before save
clinicSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

clinicSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

clinicSchema.methods.isSubscriptionActive = function() {
  if (this.subscription.status === 'active') return true;
  if (this.subscription.status === 'trial' && this.subscription.trialEndsAt > new Date()) return true;
  return false;
};

// Remove password from JSON output
clinicSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Clinic', clinicSchema);
