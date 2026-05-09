const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ── CDT code lookup ─────────────────────────────────────── */
const CDT_PROCEDURES = {
  'D0120': { name: 'Periodic oral evaluation',        priority: 'healthy',  category: 'exam',        estMins: 15  },
  'D0140': { name: 'Limited oral evaluation',         priority: 'watch',    category: 'exam',        estMins: 20  },
  'D0210': { name: 'Full mouth X-rays',               priority: 'healthy',  category: 'xray',        estMins: 20  },
  'D0220': { name: 'Periapical X-ray',                priority: 'healthy',  category: 'xray',        estMins: 10  },
  'D0274': { name: 'Bitewing X-rays (4)',             priority: 'healthy',  category: 'xray',        estMins: 15  },
  'D1110': { name: 'Adult teeth cleaning',            priority: 'healthy',  category: 'preventive',  estMins: 60  },
  'D1120': { name: 'Child teeth cleaning',            priority: 'healthy',  category: 'preventive',  estMins: 45  },
  'D1206': { name: 'Fluoride varnish',                priority: 'healthy',  category: 'preventive',  estMins: 10  },
  'D1351': { name: 'Dental sealant',                  priority: 'watch',    category: 'preventive',  estMins: 20  },
  'D2140': { name: 'Amalgam filling (1 surface)',     priority: 'moderate', category: 'restorative', estMins: 30  },
  'D2150': { name: 'Amalgam filling (2 surfaces)',    priority: 'moderate', category: 'restorative', estMins: 45  },
  'D2160': { name: 'Amalgam filling (3 surfaces)',    priority: 'urgent',   category: 'restorative', estMins: 60  },
  'D2330': { name: 'Composite filling (1 surf, front)', priority: 'moderate', category: 'restorative', estMins: 30 },
  'D2331': { name: 'Composite filling (2 surf, front)', priority: 'moderate', category: 'restorative', estMins: 45 },
  'D2391': { name: 'Composite filling (1 surf, back)', priority: 'moderate', category: 'restorative', estMins: 30 },
  'D2392': { name: 'Composite filling (2 surf, back)', priority: 'moderate', category: 'restorative', estMins: 45 },
  'D2393': { name: 'Composite filling (3 surf, back)', priority: 'urgent',   category: 'restorative', estMins: 60 },
  'D2740': { name: 'Porcelain crown',                 priority: 'urgent',   category: 'restorative', estMins: 90  },
  'D2750': { name: 'Crown — porcelain fused to metal',priority: 'urgent',   category: 'restorative', estMins: 90  },
  'D2950': { name: 'Core buildup',                    priority: 'urgent',   category: 'restorative', estMins: 30  },
  'D3110': { name: 'Pulp cap (indirect)',              priority: 'moderate', category: 'endodontic',  estMins: 30  },
  'D3310': { name: 'Root canal — front tooth',        priority: 'urgent',   category: 'endodontic',  estMins: 75  },
  'D3320': { name: 'Root canal — premolar',           priority: 'urgent',   category: 'endodontic',  estMins: 90  },
  'D3330': { name: 'Root canal — molar',              priority: 'urgent',   category: 'endodontic',  estMins: 120 },
  'D4341': { name: 'Scaling & root planing (quadrant)',priority: 'urgent',  category: 'periodontal', estMins: 60  },
  'D4342': { name: 'Scaling & root planing (1-3 teeth)',priority: 'moderate',category: 'periodontal',estMins: 45  },
  'D4910': { name: 'Periodontal maintenance',         priority: 'watch',    category: 'periodontal', estMins: 60  },
  'D5110': { name: 'Full upper denture',              priority: 'urgent',   category: 'prosthetic',  estMins: 60  },
  'D5120': { name: 'Full lower denture',              priority: 'urgent',   category: 'prosthetic',  estMins: 60  },
  'D5213': { name: 'Partial denture — upper',         priority: 'moderate', category: 'prosthetic',  estMins: 60  },
  'D6010': { name: 'Implant placement',               priority: 'urgent',   category: 'implant',     estMins: 90  },
  'D6065': { name: 'Implant crown',                   priority: 'urgent',   category: 'implant',     estMins: 60  },
  'D7140': { name: 'Simple tooth extraction',         priority: 'urgent',   category: 'oral_surgery',estMins: 30  },
  'D7210': { name: 'Surgical tooth extraction',       priority: 'urgent',   category: 'oral_surgery',estMins: 60  },
  'D7240': { name: 'Wisdom tooth removal (impacted)', priority: 'urgent',   category: 'oral_surgery',estMins: 60  },
};

/* ── Estimate visit duration from procedures ─────────────── */
function estimateVisitMins(procedures) {
  return procedures.reduce((sum, p) => {
    const cdt = p.cdtCodes?.[0];
    return sum + (cdt && CDT_PROCEDURES[cdt] ? CDT_PROCEDURES[cdt].estMins : 45);
  }, 0);
}

/* ── Format minutes as "~45 min" or "~1.5 hrs" ──────────── */
function formatDuration(mins) {
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `~${h} hr${h > 1 ? 's' : ''}`;
  return `~${h}.${Math.round(m / 6)} hrs`;
}

/**
 * Parse a treatment plan image or text using Claude Vision.
 *
 * Key upgrade: AI now detects APPOINTMENT GROUPS from the layout of the plan.
 * Returns:
 *   findings[]      — flat list per tooth (for the tooth chart)
 *   appointments[]  — one entry per blank-line group in the original plan
 */
/**
 * Pre-parse raw text into blank-line-separated groups BEFORE sending to AI.
 * This makes appointment grouping 100% deterministic for text input —
 * blank line = new appointment, no inference needed.
 *
 * Returns array of group strings, e.g.:
 *   ["Resin composite #9 IL\nCrown #8", "Resin composite #30 O\nResin composite #31 O"]
 */
function splitIntoAppointmentGroups(text) {
  // Normalise line endings, split on one or more blank lines
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n\s*\n+/)           // one or more blank lines = group boundary
    .map(g => g.trim())
    .filter(g => g.length > 0); // drop empty groups
}

async function parseTreatmentPlan(imageBase64, mimeType = 'image/jpeg', rawText = null) {
  if (!imageBase64 && !rawText) {
    throw new Error('Either imageBase64 or rawText must be provided');
  }

  /* ── For text input: pre-split by blank lines, then tell AI the groups ── */
  let groupedText = null;
  if (rawText) {
    const groups = splitIntoAppointmentGroups(rawText);
    // Annotate each group with its visit number so the AI cannot reorder them
    groupedText = groups
      .map((g, i) => `=== APPOINTMENT ${i + 1} ===\n${g}`)
      .join('\n\n');
  }

  /* ── Prompt ── */
  const baseRules = `APPOINTMENT GROUPING RULE (ABSOLUTE — do not override):
- For text input the appointments are PRE-LABELLED with === APPOINTMENT N === markers.
  Every procedure under a marker belongs to THAT appointment. Do NOT merge or split groups.
- For image/scanned input: a blank line between procedures = a new appointment.
  Procedures with no blank line between them = same appointment.
- This rule is ABSOLUTE. Never use clinical logic to override it.

Return ONLY valid JSON — no markdown, no extra text:
{
  "patientName": "string or null",
  "appointments": [
    {
      "visitNumber": 1,
      "visitLabel": "Short plain-English label for the patient, e.g. 'Front teeth — filling & crown'",
      "priority": "urgent | moderate | watch | healthy",
      "procedures": [
        {
          "toothNumber": 9,
          "surfaces": ["incisal","lingual"],
          "condition": "caries",
          "cdtCodes": ["D2331"],
          "priority": "moderate",
          "procedureName": "Composite filling — 2 surfaces",
          "notes": "Brief patient-friendly note, or empty string"
        }
      ],
      "estimatedDurationMins": 45
    }
  ],
  "summary": "2-3 sentence plain English summary of the full treatment plan for the patient"
}

PARSING RULES:
- toothNumber: 1-32 Universal system. Convert FDI/ISO if needed.
- Surface abbreviations → full words: I=incisal, L=lingual, B=buccal, M=mesial, D=distal, O=occlusal, F=facial
- priority: "urgent" (pain/infection risk), "moderate" (needs treatment soon), "watch" (monitor), "healthy"
- visitLabel: short phrase describing this appointment for a patient — not clinical shorthand
- estimatedDurationMins: realistic chair time for all listed procedures
- visitPriority = most urgent procedure in that appointment
- surfaces must be full words in an array: ["mesial","occlusal"] not "MO"
- Extract ALL procedures including exams, X-rays, cleanings
- Do NOT include any cost, insurance, or financial information`;

  const messages = [];
  if (imageBase64) {
    const imagePrompt = `You are a dental treatment plan parser.\n\n${baseRules}\n\nParse the treatment plan in this image. A blank line between procedures = a new appointment.`;
    messages.push({
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
        { type: 'text', text: imagePrompt }
      ]
    });
  } else {
    const textPrompt = `You are a dental treatment plan parser.\n\n${baseRules}\n\nTreatment plan (appointments already labelled — do NOT change the grouping):\n\n${groupedText}`;
    messages.push({ role: 'user', content: textPrompt });
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages
  });

  const text = response.content[0].text.trim();
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('AI returned invalid JSON. Please try again or enter the plan manually.');
  }

  /* ── Enrich with CDT data + compute durations ── */
  parsed.appointments = (parsed.appointments || []).map((appt, i) => {
    appt.visitNumber = appt.visitNumber || i + 1;

    appt.procedures = (appt.procedures || []).map(p => {
      const cdt = p.cdtCodes?.[0];
      if (cdt && CDT_PROCEDURES[cdt]) {
        p.procedureName = p.procedureName || CDT_PROCEDURES[cdt].name;
        p.priority = p.priority || CDT_PROCEDURES[cdt].priority;
      }
      return p;
    });

    /* Auto-compute duration if AI didn't provide one */
    if (!appt.estimatedDurationMins) {
      appt.estimatedDurationMins = estimateVisitMins(appt.procedures);
    }
    appt.durationLabel = formatDuration(appt.estimatedDurationMins);

    /* Derive visit priority from its most urgent procedure */
    const priorities = appt.procedures.map(p => p.priority);
    appt.priority = priorities.includes('urgent') ? 'urgent'
      : priorities.includes('moderate') ? 'moderate'
      : priorities.includes('watch') ? 'watch' : 'healthy';

    return appt;
  });

  /* ── Build flat findings array for tooth chart ── */
  const findingsMap = {};
  parsed.appointments.forEach(appt => {
    appt.procedures.forEach(p => {
      if (!p.toothNumber) return;
      const existing = findingsMap[p.toothNumber];
      // If same tooth appears in multiple visits, keep the most urgent
      if (!existing || priorityRank(p.priority) > priorityRank(existing.priority)) {
        findingsMap[p.toothNumber] = {
          ...p,
          visitNumber: appt.visitNumber,
          visitLabel: appt.visitLabel
        };
      }
    });
  });
  parsed.findings = Object.values(findingsMap);

  return parsed;
}

function priorityRank(p) {
  return { urgent: 3, moderate: 2, watch: 1, healthy: 0 }[p] ?? 0;
}

/**
 * Generate a plain-language explanation of a specific procedure
 */
async function explainProcedure(procedureName, toothNumber, patientContext = '') {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a friendly dental educator. Explain "${procedureName}" for tooth #${toothNumber} to a patient in plain, reassuring language.

${patientContext ? `Patient context: ${patientContext}` : ''}

Cover:
1. What the procedure is (1-2 sentences, simple language)
2. Why it's needed (what happens if untreated)
3. What to expect during the procedure (steps, sensations)
4. Recovery / aftercare
5. One reassuring closing note

Keep total response under 200 words. Be warm and calm. Never use jargon without explaining it.`
    }]
  });
  return response.content[0].text;
}

/**
 * Answer a free-form dental question from a patient
 */
async function answerDentalQuestion(question, patientContext = '') {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 500,
    system: `You are DentaVision's friendly dental educator AI. You help patients understand their dental health in plain language.

Rules:
- Be warm, calm, and reassuring
- Use simple language — no jargon without explanation
- Never diagnose or contradict what a dentist has recommended
- Keep answers concise (under 150 words)
- If a question is beyond scope, say "Your dentist is the best person to answer that specifically"
- Always encourage following through with recommended treatment`,
    messages: [{
      role: 'user',
      content: patientContext ? `Patient context: ${patientContext}\n\nQuestion: ${question}` : question
    }]
  });
  return response.content[0].text;
}

module.exports = {
  parseTreatmentPlan,
  explainProcedure,
  answerDentalQuestion,
  CDT_PROCEDURES,
  formatDuration
};
