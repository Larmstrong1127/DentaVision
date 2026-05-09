# DentaVision

An AI-powered patient education and treatment planning platform for dental practices. Clinics upload treatment plan images; Claude AI parses them into prioritized, visit-by-visit schedules that patients can view, confirm, and learn about through an AI chat assistant.

**Developer:** Landon Armstrong
**GitHub:** [Larmstrong1127](https://github.com/Larmstrong1127)
**Email:** Landon.Armstrong@stmartin.edu

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express.js |
| Database | MongoDB, MongoDB Atlas, Mongoose |
| AI | Claude AI (Anthropic API) |
| Auth | JWT Authentication |
| API Style | REST API |

---

## Features

### Clinic Portal
- Upload treatment plan images directly from the dashboard
- View patient charts and scan results
- Monitor treatment confirmation status per patient

### AI Parsing Engine
- Claude AI reads uploaded treatment plan images
- Outputs structured, visit-by-visit treatment schedules
- Prioritizes visits based on clinical urgency

### Patient Portal
- Interactive SVG tooth chart with 3 anatomical views (buccal, lingual, occlusal)
- Review and confirm treatment visit schedules
- AI-powered education chat assistant to ask questions about their treatment

### Authentication
- JWT-based auth with separate roles for clinics and patients
- Secure session handling for both portals

---

## Project Structure

```
dentavision-v3/
├── client/         # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
└── server/         # Express.js backend
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    └── index.js
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)
- Anthropic API key

### 1. Clone the Repository

```bash
git clone https://github.com/Larmstrong1127/dentavision-v3.git
cd dentavision-v3
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

> **Required:** `ANTHROPIC_API_KEY` and `MONGODB_URI` must be set for the application to function.

### 4. Run the Application

Open two terminals:

```bash
# Terminal 1 — Start the backend server
cd server
npm run dev

# Terminal 2 — Start the React frontend
cd client
npm run dev
```

The client will run on `http://localhost:5173` and the server on `http://localhost:5000` by default.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key for AI parsing and chat |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | Server port (defaults to 5000) |

---

## User Flows

### Clinic Flow
1. Register a clinic account
2. Share your clinic code with patients
3. Patients register and link to your clinic via code
4. Upload a photo of a patient's treatment plan
5. Claude AI parses it and generates the patient's visual schedule
6. Monitor patient acceptance rates from the dashboard

### Patient Flow
1. Register with your clinic's code
2. View your interactive tooth chart
3. Review your prioritized treatment visit schedule
4. Confirm planned procedures
5. Ask dental questions through the AI education chat

---

## License

This project is for educational and portfolio purposes.
