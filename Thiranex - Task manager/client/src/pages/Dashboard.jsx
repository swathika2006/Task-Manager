import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskList from '../components/TaskList';
import { Plus, ClipboardList, CheckCircle2, Circle, Clock, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View states
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' or 'list'
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Task Modal states (Create/Edit)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // If null, creating. Else, editing.
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Todo');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  // Fetch tasks on mount
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Could not retrieve tasks. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Reset all search/filter states
  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setStatusFilter('All');
  };

  // Open task modal for creation
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormStatus('Todo');
    setFormPriority('Medium');
    setFormDueDate('');
    setModalError('');
    setIsTaskModalOpen(true);
  };

  // Open task modal for editing
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.due_date || '');
    setModalError('');
    setIsTaskModalOpen(true);
  };

  // Form submit handler (Save task)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formTitle.trim()) {
      setModalError('Task title is required.');
      return;
    }

    setSavingTask(true);
    const payload = {
      title: formTitle,
      description: formDesc,
      status: formStatus,
      priority: formPriority,
      due_date: formDueDate || null,
    };

    try {
      if (editingTask) {
        // Edit Task
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data.task : t)));
      } else {
        // Create Task
        const res = await api.post('/tasks', payload);
        setTasks([res.data.task, ...tasks]);
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to save task:', err);
      setModalError(err.response?.data?.message || 'Error occurred while saving task.');
    } finally {
      setSavingTask(false);
    }
  };

  // Quick Status update shortcut
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      const res = await api.put(`/tasks/${taskId}`, {
        ...taskToUpdate,
        status: newStatus,
      });

      setTasks(tasks.map((t) => (t.id === taskId ? res.data.task : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Open delete warning modal
  const handleOpenDeleteModal = (id) => {
    setTaskToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Execute delete operation
  const handleConfirmDelete = async () => {
    if (!taskToDeleteId) return;

    try {
      await api.delete(`/tasks/${taskToDeleteId}`);
      setTasks(tasks.filter((t) => t.id !== taskToDeleteId));
      setIsDeleteModalOpen(false);
      setTaskToDeleteId(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter tasks based on Search, Priority, and Status
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // 1. Search Query
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Priority Filter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      // 3. Status Filter
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Categorize for Kanban columns
  const todoTasks = filteredTasks.filter((t) => t.status === 'Todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  return (
    <div className="min-h-screen bg-darkBg flex flex-col">
      {/* Header bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <div className="flex flex-1 relative">
        {/* Collapsible search/filters Sidebar */}
        <Sidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenCreateModal={handleOpenCreateModal}
          onResetFilters={handleResetFilters}
          totalTasksCount={tasks.length}
          filteredTasksCount={filteredTasks.length}
        />

        {/* Dashboard Workspace */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* Main Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={fetchTasks} className="ml-auto text-xs underline font-bold hover:text-rose-300">
                Retry
              </button>
            </div>
          )}

          {/* Stats Summary Bar */}
          {!loading && tasks.length > 0 && (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', count: tasks.length, color: 'text-slate-300', bg: 'bg-slate-800/40 border-slate-700/40' },
                { label: 'Todo', count: tasks.filter(t => t.status === 'Todo').length, color: 'text-slate-400', bg: 'bg-slate-800/30 border-slate-800/50' },
                { label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/15' },
                { label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
              ].map(stat => (
                <div key={stat.label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${stat.bg}`}>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <span className={`text-xl font-extrabold ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skeleton Loaders */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel rounded-2xl p-5 min-h-[400px] flex flex-col gap-4">
                  <div className="h-6 bg-slate-800 rounded-lg w-1/3 mb-2" />
                  <div className="h-28 bg-slate-800/40 rounded-xl w-full" />
                  <div className="h-28 bg-slate-800/40 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            /* Premium Empty State slate */
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6 shadow-xl active-glow">
                <ClipboardList className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Your taskboard is pristine</h2>
              <p className="text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
                Organize your sprints, track task updates, and complete milestones cleanly. Initialize your board now!
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-6 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-indigo-500/20 text-white rounded-xl py-3 px-6 text-sm font-semibold shadow-lg transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Task</span>
              </button>
            </div>
          ) : (
            /* Active task content (Kanban columns vs List Table) */
            <>
              {activeView === 'kanban' ? (
                /* Kanban Layout */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Todo Column */}
                  <div className="flex flex-col gap-4 bg-slate-950/20 border border-slate-900 rounded-2xl p-4 min-h-[500px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4.5 h-4.5 text-slate-400" />
                        <span className="font-extrabold text-sm tracking-wide text-slate-200">To Do</span>
                      </div>
                      <span className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">
                        {todoTasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {todoTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                          onUpdateStatus={handleUpdateTaskStatus}
                        />
                      ))}
                      {todoTasks.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-800/60 rounded-xl text-slate-500 text-xs italic">
                          No tasks in queue
                        </div>
                      )}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="flex flex-col gap-4 bg-slate-950/20 border border-slate-900 rounded-2xl p-4 min-h-[500px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-sky-400" />
                        <span className="font-extrabold text-sm tracking-wide text-slate-200">In Progress</span>
                      </div>
                      <span className="bg-slate-900 border border-slate-800 text-sky-400 text-xs px-2 py-0.5 rounded-full font-bold">
                        {inProgressTasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {inProgressTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                          onUpdateStatus={handleUpdateTaskStatus}
                        />
                      ))}
                      {inProgressTasks.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-800/60 rounded-xl text-slate-500 text-xs italic">
                          No active items in progress
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="flex flex-col gap-4 bg-slate-950/20 border border-slate-900 rounded-2xl p-4 min-h-[500px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                        <span className="font-extrabold text-sm tracking-wide text-slate-200">Completed</span>
                      </div>
                      <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
                        {completedTasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                          onUpdateStatus={handleUpdateTaskStatus}
                        />
                      ))}
                      {completedTasks.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-800/60 rounded-xl text-slate-500 text-xs italic">
                          No finished tasks yet
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                /* List Table Layout */
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                  onUpdateStatus={handleUpdateTaskStatus}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* CREATE & EDIT TASK MODAL OVERLAY */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-800 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {editingTask ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTask} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Local Validation Error Banner */}
              {modalError && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3.5 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="Review server routes, build mocks, etc."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="glass-input w-full text-sm"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide deep descriptions on task deliverables..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="glass-input w-full text-sm resize-none"
                />
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="glass-input w-full text-sm cursor-pointer select-arrow-custom"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="glass-input w-full text-sm cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

              </div>

              {/* Due Date selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="glass-input w-full text-sm"
                />
              </div>

              {/* Save Controls */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-850 mt-6">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-indigo-500/20 text-white rounded-lg text-sm font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {savingTask ? 'Saving changes...' : 'Save Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-800 text-center flex flex-col gap-4">
            
            {/* Warning indicator */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
              <Trash2 className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Delete Task</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you absolutely sure you want to delete this task? This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTaskToDeleteId(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
