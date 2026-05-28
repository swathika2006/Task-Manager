const db = require('../config/db');

// Get all tasks for the logged-in user
const getTasks = (req, res) => {
  const userId = req.user.id;

  try {
    const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
    const tasks = stmt.all(userId);
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve tasks.' });
  }
};

// Create a new task
const createTask = (req, res) => {
  const userId = req.user.id;
  const { title, description, status, priority, due_date } = req.body;

  // Basic Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  // Set default values if not provided
  const taskStatus = status || 'Todo';
  const taskPriority = priority || 'Medium';
  const taskDueDate = due_date || null;

  // Validate allowed values
  const allowedStatuses = ['Todo', 'In Progress', 'Completed'];
  const allowedPriorities = ['Low', 'Medium', 'High'];

  if (!allowedStatuses.includes(taskStatus)) {
    return res.status(400).json({ message: 'Invalid task status. Must be Todo, In Progress, or Completed.' });
  }

  if (!allowedPriorities.includes(taskPriority)) {
    return res.status(400).json({ message: 'Invalid task priority. Must be Low, Medium, or High.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      title.trim(),
      description ? description.trim() : null,
      taskStatus,
      taskPriority,
      taskDueDate
    );

    const newTaskId = result.lastInsertRowid;
    
    // Retrieve the newly created task to return it
    const fetchStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const newTask = fetchStmt.get(newTaskId);

    return res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('createTask Error:', error);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

// Update an existing task
const updateTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, status, priority, due_date } = req.body;

  try {
    // Check if task exists and belongs to the user
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
    const existingTask = checkStmt.get(taskId, userId);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Merge or validate updates
    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : existingTask.description;
    const updatedStatus = status !== undefined ? status : existingTask.status;
    const updatedPriority = priority !== undefined ? priority : existingTask.priority;
    const updatedDueDate = due_date !== undefined ? due_date : existingTask.due_date;

    if (!updatedTitle) {
      return res.status(400).json({ message: 'Task title cannot be empty.' });
    }

    // Validate enum values if updated
    const allowedStatuses = ['Todo', 'In Progress', 'Completed'];
    const allowedPriorities = ['Low', 'Medium', 'High'];

    if (!allowedStatuses.includes(updatedStatus)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }

    if (!allowedPriorities.includes(updatedPriority)) {
      return res.status(400).json({ message: 'Invalid task priority.' });
    }

    const updateStmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      updatedTitle,
      updatedDescription,
      updatedStatus,
      updatedPriority,
      updatedDueDate,
      taskId,
      userId
    );

    // Retrieve updated task
    const fetchStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const updatedTask = fetchStmt.get(taskId);

    return res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('updateTask Error:', error);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

// Delete a task
const deleteTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    // Check if task exists and belongs to the user
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
    const existingTask = checkStmt.get(taskId, userId);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    deleteStmt.run(taskId, userId);

    return res.status(200).json({
      message: 'Task deleted successfully',
      taskId: parseInt(taskId)
    });

  } catch (error) {
    console.error('deleteTask Error:', error);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
