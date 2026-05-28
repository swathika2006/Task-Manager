import React from 'react';
import { Calendar, Edit, Trash2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const TaskList = ({ tasks, onEdit, onDelete, onUpdateStatus }) => {
  
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'Low':
      default:
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-indigo-500/15 border-indigo-500/20 text-indigo-300';
      case 'In Progress':
        return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
      case 'Todo':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  // Determine if task is overdue compared to modern date
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return false;
    const today = new Date('2026-05-21'); // Reference local time provided
    const taskDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  // Status transitions cycle
  const handleCycleStatus = (id, currentStatus) => {
    if (currentStatus === 'Todo') onUpdateStatus(id, 'In Progress');
    else if (currentStatus === 'In Progress') onUpdateStatus(id, 'Completed');
    else if (currentStatus === 'Completed') onUpdateStatus(id, 'Todo');
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl">
        <AlertCircle className="w-8 h-8 text-slate-500 mb-3" />
        <p className="text-slate-400 font-medium text-sm">No tasks matched your current search/filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800/80 glass-panel shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 text-xs uppercase font-extrabold tracking-wider">
              <th className="py-4 px-5">Task Details</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5">Priority</th>
              <th className="py-4 px-5">Due Date</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-800/20 transition-colors group">
                {/* Title and Description */}
                <td className="py-4 px-5 max-w-sm sm:max-w-md">
                  <div>
                    <h5 className="font-bold text-slate-100 group-hover:text-white transition-colors text-sm break-words">
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-xs sm:max-w-md">
                        {task.description}
                      </p>
                    )}
                  </div>
                </td>
                
                {/* Status Badge */}
                <td className="py-4 px-5 whitespace-nowrap">
                  <button
                    onClick={() => handleCycleStatus(task.id, task.status)}
                    className={`inline-flex items-center gap-1 text-xs font-bold tracking-wide py-1 px-3 rounded-lg border cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all ${getStatusBadge(
                      task.status
                    )}`}
                    title="Click to cycle status"
                  >
                    <span>{task.status}</span>
                    {task.status !== 'Completed' && (
                      <RefreshCw className="w-2.5 h-2.5 text-slate-400 animate-spin-hover" />
                    )}
                  </button>
                </td>

                {/* Priority Badge */}
                <td className="py-4 px-5 whitespace-nowrap">
                  <span className={`inline-flex text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                    task.priority
                  )}`}>
                    {task.priority}
                  </span>
                </td>

                {/* Due Date Indicator */}
                <td className="py-4 px-5 whitespace-nowrap">
                  {task.due_date ? (
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg border ${
                        isOverdue(task.due_date, task.status)
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-extrabold animate-pulse'
                          : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {task.due_date} {isOverdue(task.due_date, task.status) ? '(Overdue)' : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">No date</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {task.status !== 'Completed' && (
                      <button
                        onClick={() => onUpdateStatus(task.id, 'Completed')}
                        className="text-slate-400 hover:text-emerald-400 p-2 rounded hover:bg-slate-800 transition-all"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(task)}
                      className="text-slate-400 hover:text-indigo-400 p-2 rounded hover:bg-slate-800 transition-all"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-slate-400 hover:text-rose-400 p-2 rounded hover:bg-slate-800 transition-all"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
