require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
