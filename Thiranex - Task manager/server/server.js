const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./models');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with default settings (all origins, or configure specifically if needed)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database schema
try {
  initDB();
} catch (error) {
  console.error('Failed to initialize database schema:', error);
  process.exit(1);
}

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Task Manager API is running smoothly' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Server successfully booted on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=============================================`);
});
