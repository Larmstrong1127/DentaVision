# Synthetic sample treatment plans

These files exist so DentaVision can be demonstrated **without any real patient
data**. Every name, date of birth, chart number, and procedure below is invented.
None of it describes a real person or a real course of treatment.

DentaVision is a demo product. There is no signed Business Associate Agreement
(BAA) process, so a HIPAA covered entity must not send it Protected Health
Information (PHI). Use these samples instead.

## How to use them in the demo

**Option A — structured entry (fastest).**
Clinic portal → *Scan Plan* → *📋 Enter procedures* → type the CDT code, tooth
number, surfaces, and notes from any plan below.

**Option B — upload path.**
Print or export one of these `.txt` files to PDF (or screenshot it as a PNG),
then drop the file into the *📷 Upload image / PDF* box. This exercises the
Claude vision parsing path end to end on synthetic input.

## Files

| File | Fictional patient | Shape of the plan |
|---|---|---|
| `plan-01-avery-nightingale.txt` | Avery Nightingale | Routine — two small restorations plus a watch area |
| `plan-02-bramwell-oakhurst.txt` | Bramwell Oakhurst | Urgent — endo + crown, then a quadrant of restorative |
| `plan-03-marisol-quintaine.txt` | Marisol Quintaine | Periodontal — SRP all four quadrants, then re-eval |

## Rules for adding more samples

1. Names must be obviously fictional. No name that could plausibly be a real
   patient of a real practice.
2. Dates of birth and chart numbers must be invented, never copied from a
   record.
3. Procedures must be plausible but not transcribed from an actual plan.
4. Never commit a real treatment plan image, PDF, or export to this repo — not
   even a redacted one.
