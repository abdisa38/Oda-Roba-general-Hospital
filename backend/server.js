require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
// Supports CLIENT_URL set on Render, all Vercel domains (*.vercel.app), and localhost for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (like server health checks, curl, mobile clients)
    if (!origin) return callback(null, true);

    const clientUrl = (process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
    const frontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');

    const staticAllowed = [
      clientUrl,
      frontendUrl,
      'http://localhost:5173',
      'http://localhost:8443',
      'http://localhost:3000',
    ].filter(Boolean);

    // Exact match
    if (staticAllowed.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployment URLs (*.vercel.app) and local development
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Default fallback: allow origin
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    hospital: 'Oda Roba General Hospital Management System (ORHIMS)',
    version: '2.0.0-PROD',
    status: 'Operational',
    db: 'MongoDB Atlas Connected',
    apiDocumentation: '/api/health'
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 ORHIMS Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
