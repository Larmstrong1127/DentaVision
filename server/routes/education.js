const express = require('express');
const { authenticate } = require('../middleware/auth');
const { explainProcedure, answerDentalQuestion } = require('../services/aiService');
const Patient = require('../models/Patient');

const router = express.Router();

// ── Explain a specific procedure ──────────────────────────
// POST /api/education/explain
router.post('/explain', authenticate, async (req, res) => {
  try {
    const { procedureName, toothNumber, context } = req.body;
    if (!procedureName) return res.status(400).json({ error: 'procedureName required' });

    const explanation = await explainProcedure(procedureName, toothNumber, context);

    // Track education engagement
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

// ── Answer a free-form dental question ───────────────────
// POST /api/education/ask
router.post('/ask', authenticate, async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    const answer = await answerDentalQuestion(question, context);

    // Track question count
    if (req.user.role === 'patient') {
      await Patient.findByIdAndUpdate(req.user.id, {
        $inc: { 'engagement.questionsAsked': 1 }
      });
    }

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Curated education topics (no AI call needed) ─────────
// GET /api/education/topics
router.get('/topics', (req, res) => {
  res.json({
    topics: [
      {
        id: 'root-canal',
        title: 'Root canal treatment',
        icon: '🦷',
        summary: 'A common procedure to save an infected tooth',
        question: 'What is a root canal, why is it needed, and what should I expect during and after the procedure?'
      },
      {
        id: 'cavity-filling',
        title: 'Cavity fillings',
        icon: '🔩',
        summary: 'How decay is removed and teeth are restored',
        question: 'Explain what a cavity filling is, the difference between composite and amalgam, and what the procedure feels like'
      },
      {
        id: 'crown',
        title: 'Dental crowns',
        icon: '👑',
        summary: 'When and why a tooth needs a full cap',
        question: 'What is a dental crown, when is it needed vs a filling, and what are the steps involved?'
      },
      {
        id: 'gum-disease',
        title: 'Gum disease',
        icon: '🩸',
        summary: 'Understanding gingivitis and periodontitis',
        question: 'What is the difference between gingivitis and periodontitis, how does gum disease progress, and how is it treated?'
      },
      {
        id: 'extraction',
        title: 'Tooth extraction',
        icon: '🪝',
        summary: 'When a tooth needs to be removed',
        question: 'Explain tooth extraction — when it is necessary, what happens during the procedure, and what the recovery is like'
      },
      {
        id: 'implant',
        title: 'Dental implants',
        icon: '⚙️',
        summary: 'A permanent replacement for missing teeth',
        question: 'What is a dental implant, how does the process work from start to finish, and what are the pros and cons versus dentures?'
      },
      {
        id: 'deep-cleaning',
        title: 'Deep cleaning (SRP)',
        icon: '✨',
        summary: 'Scaling and root planing explained',
        question: 'What is scaling and root planing, why is it different from a regular cleaning, and what should I expect?'
      },
      {
        id: 'prevention',
        title: 'Preventing cavities',
        icon: '🛡️',
        summary: 'Best practices for dental health at home',
        question: 'What are the most effective ways to prevent cavities and gum disease at home, including brushing technique and diet?'
      }
    ]
  });
});

module.exports = router;
