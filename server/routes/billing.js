const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate, requireClinic } = require('../middleware/auth');
const Clinic = require('../models/Clinic');

const router = express.Router();

const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER,
    price: 79,
    patients: 50,
    features: ['Up to 50 patients/month', 'AI plan scanning', 'Patient education content', 'Email support']
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_PRICE_GROWTH,
    price: 199,
    patients: 'Unlimited',
    features: ['Unlimited patients', 'Analytics dashboard', 'Treatment acceptance tracking', 'Custom clinic branding', 'Priority support']
  }
};

// ── Get available plans ───────────────────────────────────
router.get('/plans', (req, res) => res.json({ plans: PLANS }));

// ── Create checkout session ───────────────────────────────
// POST /api/billing/checkout
router.post('/checkout', authenticate, requireClinic, async (req, res) => {
  try {
    const { plan } = req.body;
    const planData = PLANS[plan];
    if (!planData) return res.status(400).json({ error: 'Invalid plan' });

    const clinic = req.clinic;

    // Create or retrieve Stripe customer
    let customerId = clinic.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinic.email,
        name: clinic.name,
        metadata: { clinicId: clinic._id.toString() }
      });
      customerId = customer.id;
      await Clinic.findByIdAndUpdate(clinic._id, {
        'subscription.stripeCustomerId': customerId
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: planData.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/clinic/billing?success=true&plan=${plan}`,
      cancel_url: `${process.env.CLIENT_URL}/clinic/billing?canceled=true`,
      metadata: { clinicId: clinic._id.toString(), plan }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Create billing portal session (manage subscription) ──
// POST /api/billing/portal
router.post('/portal', authenticate, requireClinic, async (req, res) => {
  try {
    const customerId = req.clinic.subscription.stripeCustomerId;
    if (!customerId) return res.status(400).json({ error: 'No billing account found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/clinic/billing`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stripe webhook (raw body required) ───────────────────
// POST /api/billing/webhook
router.post('/webhook', async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const clinicId = session.metadata?.clinicId;
      const plan = session.metadata?.plan;
      if (clinicId && plan) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await Clinic.findByIdAndUpdate(clinicId, {
          'subscription.plan': plan,
          'subscription.status': 'active',
          'subscription.stripeSubscriptionId': session.subscription,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
        });
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const clinic = await Clinic.findOne({ 'subscription.stripeSubscriptionId': session.subscription });
      if (clinic) {
        await Clinic.findByIdAndUpdate(clinic._id, {
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000)
        });
      }
      break;
    }
    case 'invoice.payment_failed': {
      const clinic = await Clinic.findOne({ 'subscription.stripeSubscriptionId': session.subscription });
      if (clinic) {
        await Clinic.findByIdAndUpdate(clinic._id, { 'subscription.status': 'past_due' });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const clinic = await Clinic.findOne({ 'subscription.stripeSubscriptionId': session.id });
      if (clinic) {
        await Clinic.findByIdAndUpdate(clinic._id, {
          'subscription.status': 'canceled',
          'subscription.plan': 'trial'
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

// ── Get current subscription status ──────────────────────
router.get('/status', authenticate, requireClinic, async (req, res) => {
  res.json({
    subscription: req.clinic.subscription,
    isActive: req.clinic.isSubscriptionActive(),
    plans: PLANS
  });
});

module.exports = router;
