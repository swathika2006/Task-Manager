const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ─────────────────────────────────────────
   CORS — allow Vercel frontend + localhost
───────────────────────────────────────── */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────
   Routes
───────────────────────────────────────── */
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
  await connectDB();                 // wait for Atlas connection before accepting traffic
  app.listen(PORT, () => {
    console.log('=============================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log('=============================================');
  });
};

start();
