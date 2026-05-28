const { Task } = require('../models');

/* ─────────────────────────────────────────
   GET /api/tasks  — all tasks for the user
───────────────────────────────────────── */
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('getTasks Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve tasks.' });
  }
};

/* ─────────────────────────────────────────
   POST /api/tasks  — create a task
───────────────────────────────────────── */
const createTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  if (!title || title.trim() === '')
    return res.status(400).json({ message: 'Task title is required.' });

  const allowedStatuses   = ['Todo', 'In Progress', 'Completed'];
  const allowedPriorities = ['Low', 'Medium', 'High'];

  const taskStatus   = status   || 'Todo';
  const taskPriority = priority || 'Medium';

  if (!allowedStatuses.includes(taskStatus))
    return res.status(400).json({ message: 'Invalid status. Must be Todo, In Progress, or Completed.' });

  if (!allowedPriorities.includes(taskPriority))
    return res.status(400).json({ message: 'Invalid priority. Must be Low, Medium, or High.' });

  try {
    const newTask = await Task.create({
      user_id:     req.user.id,
      title:       title.trim(),
      description: description ? description.trim() : null,
      status:      taskStatus,
      priority:    taskPriority,
      due_date:    due_date || null,
    });

    return res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error('createTask Error:', error);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

/* ─────────────────────────────────────────
   PUT /api/tasks/:id  — update a task
───────────────────────────────────────── */
const updateTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  try {
    // Ensure task belongs to the authenticated user
    const existingTask = await Task.findOne({ _id: req.params.id, user_id: req.user.id });

    if (!existingTask)
      return res.status(404).json({ message: 'Task not found or unauthorized' });

    // Merge with existing values (allow partial updates)
    const updatedTitle       = title       !== undefined ? title.trim()                              : existingTask.title;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : existingTask.description;
    const updatedStatus      = status      !== undefined ? status                                    : existingTask.status;
    const updatedPriority    = priority    !== undefined ? priority                                  : existingTask.priority;
    const updatedDueDate     = due_date    !== undefined ? due_date                                  : existingTask.due_date;

    if (!updatedTitle)
      return res.status(400).json({ message: 'Task title cannot be empty.' });

    const allowedStatuses   = ['Todo', 'In Progress', 'Completed'];
    const allowedPriorities = ['Low', 'Medium', 'High'];

    if (!allowedStatuses.includes(updatedStatus))
      return res.status(400).json({ message: 'Invalid task status.' });

    if (!allowedPriorities.includes(updatedPriority))
      return res.status(400).json({ message: 'Invalid task priority.' });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title:       updatedTitle,
        description: updatedDescription,
        status:      updatedStatus,
        priority:    updatedPriority,
        due_date:    updatedDueDate,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('updateTask Error:', error);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

/* ─────────────────────────────────────────
   DELETE /api/tasks/:id  — delete a task
───────────────────────────────────────── */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });

    if (!task)
      return res.status(404).json({ message: 'Task not found or unauthorized' });

    return res.status(200).json({ message: 'Task deleted successfully', taskId: req.params.id });
  } catch (error) {
    console.error('deleteTask Error:', error);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
