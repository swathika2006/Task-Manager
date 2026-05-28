const mongoose = require('mongoose');

/* ─────────────────────────────────────────
   User Schema
───────────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password_hash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }   // adds createdAt & updatedAt automatically
);

/* ─────────────────────────────────────────
   Task Schema
───────────────────────────────────────── */
const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    due_date: {
      type: String,    // keep as string (YYYY-MM-DD) to match frontend date inputs
      default: null,
    },
  },
  { timestamps: true }   // adds createdAt & updatedAt automatically
);

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = { User, Task };
