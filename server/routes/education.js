const express = require('express');
const { authenticate } = require('../middleware/auth');
const { explainProcedure, answerDentalQuestion } = require('../services/aiService');
const Patient = require('../models/Patient');

const router = express.Router();

// ── Explain a specific procedure ──────────────────────────
router.post('/explain', authenticate, async (req, res) => {
  try {
    const { procedureName, toothNumber, context } = req.body;
    if (!procedureName) return res.status(400).json({ error: 'procedureName required' });

    const explanation = await explainProcedure(procedureName, toothNumber, context);

    if (req.user.role === 'patient') {
      await Patient.findByIdAndUpdate(req.user.id, {
        $addToSet: { 'engagement.educationTopicsViewed': procedureName }
      });
    }

    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Answer a free-form dental question (Haiku AI) ────────
const DAILY_QUESTION_LIMIT = 10;

router.post('/ask', authenticate, async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    // ── Daily rate limiting for patients ──────────────────
    if (req.user.role === 'patient') {
      const patient = await Patient.findById(req.user.id).select('engagement');
      if (patient) {
        const today = new Date().toDateString();
        const lastDate = patient.engagement?.questionsDate
          ? new Date(patient.engagement.questionsDate).toDateString()
          : null;
        const dailyCount = (lastDate === today) ? (patient.engagement.dailyQuestions || 0) : 0;

        if (dailyCount >= DAILY_QUESTION_LIMIT) {
          return res.status(429).json({
            error: 'daily_limit_reached',
            message: `You've reached today's limit of ${DAILY_QUESTION_LIMIT} questions. Come back tomorrow — Toothy will be here! 😊`
          });
        }

        // Update counter atomically
        const resetDaily = lastDate !== today;
        await Patient.findByIdAndUpdate(req.user.id, {
          $inc: {
            'engagement.questionsAsked': 1,
            'engagement.dailyQuestions': resetDaily ? 0 : 1
          },
          $set: {
            ...(resetDaily ? { 'engagement.dailyQuestions': 1 } : {}),
            'engagement.questionsDate': new Date()
          }
        });
      }
    }

    const answer = await answerDentalQuestion(question, context);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Curated topics — pre-written answers, zero AI cost ───
router.get('/topics', (req, res) => {
  res.json({
    topics: [
      {
        id: 'root-canal',
        title: 'Root canal treatment',
        icon: '🦷',
        answer: `A root canal removes infected tissue from inside your tooth to save it — instead of pulling it out.\n\nYour dentist numbs the area completely, removes the infected pulp, cleans and seals the canal, then usually places a crown on top.\n\nMost people say it feels no worse than a regular filling. It actually relieves the throbbing pain caused by the infection. Recovery is mild — over-the-counter pain relievers for a day or two is usually all you need.`
      },
      {
        id: 'cavity-filling',
        title: 'Cavity fillings',
        icon: '🔩',
        answer: `A filling restores a tooth damaged by decay. Your dentist removes the decayed area, then fills it with composite (tooth-colored) or amalgam (silver) material.\n\nComposite is most common today — it blends right in with your natural tooth color. The procedure takes 30–60 minutes and your mouth will be numb throughout.\n\nMild sensitivity to hot and cold afterward is normal and usually fades within a week or two.`
      },
      {
        id: 'crown',
        title: 'Dental crowns',
        icon: '👑',
        answer: `A crown is a custom cap that fits over your entire tooth. It's used when a tooth is too damaged for a filling alone — after a root canal, a large crack, or severe decay.\n\nYour dentist shapes the tooth, takes a mold, and places a temporary crown while your permanent one is made in a lab (usually 1–2 weeks). The permanent crown is then cemented in place.\n\nMost crowns last 10–15 years with regular brushing and checkups.`
      },
      {
        id: 'gum-disease',
        title: 'Gum disease',
        icon: '🩸',
        answer: `Gum disease starts as gingivitis — red, puffy gums that bleed when you brush. At this stage it's fully reversible with better brushing, flossing, and a professional cleaning.\n\nIf untreated, it can progress to periodontitis, where gums pull away from teeth and bone is gradually lost. This stage requires a deep cleaning and more frequent checkups.\n\nEarly treatment makes a big difference — don't wait if your gums bleed regularly.`
      },
      {
        id: 'extraction',
        title: 'Tooth extraction',
        icon: '✂️',
        answer: `A tooth is extracted when it's too damaged to save — from decay, fracture, infection, or overcrowding.\n\nYour dentist numbs the area fully before removal. You'll feel pressure but no pain. Afterward, bite on gauze for 30–45 minutes to form a clot.\n\nAvoid straws, smoking, and hard foods for 24–48 hours — this protects the clot and prevents a painful condition called dry socket. The socket heals fully within 1–2 weeks.`
      },
      {
        id: 'implant',
        title: 'Dental implants',
        icon: '⚙️',
        answer: `An implant is a small titanium post placed into your jawbone, acting as an artificial tooth root. A custom crown is attached on top — it looks and feels like a natural tooth.\n\nThe process takes several months: the post is placed, your bone fuses around it, then the crown is attached. It's the most durable tooth replacement available.\n\nWith proper care, implants can last a lifetime — making them more cost-effective than bridges or dentures long-term.`
      },
      {
        id: 'deep-cleaning',
        title: 'Deep cleaning (SRP)',
        icon: '✨',
        answer: `Scaling and root planing (SRP) goes deeper than a regular cleaning. It's done when gum disease has caused pockets to form between your teeth and gums.\n\nScaling removes plaque and tartar below the gumline. Root planing smooths root surfaces so gums can reattach and bacteria have less place to hide.\n\nYour mouth will be numb during the procedure. Gums may be tender for a few days after. Follow-up appointments track how well your gums are healing.`
      },
      {
        id: 'prevention',
        title: 'Preventing cavities',
        icon: '🛡️',
        answer: `The basics work best:\n\n• Brush twice a day for 2 minutes with fluoride toothpaste\n• Floss once a day — it reaches where brushing can't\n• Limit sugary and acidic drinks (soda, juice, sports drinks)\n• Drink fluoridated water when possible\n• See your dentist every 6 months for cleanings\n\nDental sealants can also protect back teeth from decay. Consistency matters more than any fancy product.`
      }
    ]
  });
});

module.exports = router;
