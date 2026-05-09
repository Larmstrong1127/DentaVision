# DentaVision

An **AI-powered dental treatment planning platform** that bridges the gap between clinic workflows and patient understanding. Clinics upload treatment plan images; Claude AI parses them into prioritized, visit-by-visit schedules that patients can view and learn about through an interactive AI chat assistant.

> **Role:** Full-Stack Developer
> **Year:** 2025
> **Stack:** React, Node.js, Express.js, MongoDB, Claude AI (Anthropic), JWT Auth

## Overview

DentaVision was built from a real workflow problem - the disconnect between how dental clinics create treatment plans and how patients actually understand and engage with them. The platform automates the translation of raw treatment documents into clear, structured visit schedules with visual tooth charts.

## Features

### Clinic Portal
- Upload treatment plan images or PDFs for AI parsing
- AI extracts CDT codes, tooth numbers, and procedure details
- Auto-generated visit schedule with priority ranking (urgent / moderate / routine)
- Patient management dashboard with treatment history

### Patient Portal
- View personalized treatment plan with visit-by-visit breakdown
- Interactive SVG tooth chart (3 anatomical views: occlusal arch, facial, side profile)
- Real-time treatment status visualization per tooth
- AI chat assistant for natural-language questions about procedures and aftercare

### Auth System
- JWT-based authentication with separate clinic and patient roles
- Secure clinic code system for patient registration
- Session persistence with token support

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Claude AI (Anthropic API) |
| Auth | JWT (jsonwebtoken) |
| File Handling | Multer (image/PDF upload) |

## Architecture

```
dentavision/
+-- client/                   # React SPA
|   +-- src/
|       +-- pages/
|       |   +-- clinic/       # Dashboard, ScanPage, PatientDetail
|       |   +-- patient/      # Home, Treatment, Chat
|       +-- components/
|       |   +-- chart/        # ToothChart, ToothDetail (SVG)
|       |   +-- shared/       # NavBar, ProtectedRoute
|       +-- utils/            # Axios API client, auth helpers
+-- server/                   # Express API
    +-- routes/               # scan, clinic, patient, auth endpoints
    +-- models/               # Mongoose schemas (Clinic, Patient, TreatmentPlan)
    +-- middleware/            # JWT auth middleware
    +-- services/             # Claude AI integration, image processing
```

## How to Run

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Larmstrong1127/DentaVision.git
cd DentaVision

# Install root dependencies
npm install

# Server setup
cd server
cp .env.example .env
# Fill in: MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY
npm install

# Client setup
cd ../client
npm install
```

### Run

```bash
# From root - starts both client and server
npm run dev

# Or individually:
cd server && npm start      # API on port 4000
cd client && npm start      # React on port 3000
```

## AI Integration

Treatment plan parsing uses **Claude vision** - clinic staff upload an image or PDF of a printed treatment plan, and Claude extracts:

- CDT procedure codes and descriptions
- Tooth numbers and surfaces affected
- Recommended visit groupings and sequencing
- Priority classification (urgent, moderate, routine)
- Plain-language patient summary

The patient chat assistant uses **Claude conversational API** with treatment plan context injected into the system prompt, enabling accurate, personalized answers about the patient's specific procedures.

---

**Developer:** Landon Armstrong | [GitHub](https://github.com/Larmstrong1127) | [LinkedIn](https://linkedin.com/in/landon-armstrong)
