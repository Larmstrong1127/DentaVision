require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const app = require('./app');

// ── Database ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🦷 DentaVision server running on port ${PORT}`));
