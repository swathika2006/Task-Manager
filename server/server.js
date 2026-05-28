const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ─────────────────────────────────────────
   CORS — open to all origins in production
   (safe because auth is handled via JWT)
───────────────────────────────────────── */
app.use(cors());               // allow all origins — JWT protects all sensitive routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────
   Routes
───────────────────────────────────────── */

// Root — friendly message so the URL looks healthy in browser
app.get('/', (req, res) =>
  res.status(200).json({ status: 'ok', message: 'Thiranex API is live 🚀 — use /api/* routes' })
);

app.get('/api/health', (req, res) =>
  res.status(200).json({ status: 'ok', message: 'Task Manager API is running smoothly' })
);

app.use('/api/auth',  authRoutes);
app.use('/api/tasks', taskRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

/* ─────────────────────────────────────────
   Boot — connect MongoDB, then listen
───────────────────────────────────────── */
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('=============================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log('=============================================');
  });
};

start();
