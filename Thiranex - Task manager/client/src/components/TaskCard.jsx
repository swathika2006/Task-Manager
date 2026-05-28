import React from 'react';
import { Calendar, Edit, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onUpdateStatus }) => {
  const { id, title, description, status, priority, due_date } = task;

  // Determine priority color tag
  const getPriorityClasses = () => {
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

  // Determine if task is overdue compared to modern date
  const isOverdue = () => {
    if (!due_date || status === 'Completed') return false;
    const today = new Date('2026-05-21'); // Reference local time provided
    const taskDate = new Date(due_date);
    // Strip hours for pure date comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  // Status transitions
  const handleNextStatus = () => {
    if (status === 'Todo') onUpdateStatus(id, 'In Progress');
    else if (status === 'In Progress') onUpdateStatus(id, 'Completed');
  };

  const handlePrevStatus = () => {
    if (status === 'In Progress') onUpdateStatus(id, 'Todo');
    else if (status === 'Completed') onUpdateStatus(id, 'In Progress');
  };

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 group relative overflow-hidden">
      {/* Visual Accent Bar */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1 ${
          priority === 'High'
            ? 'bg-rose-500'
            : priority === 'Medium'
            ? 'bg-yellow-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* Header (Title & Actions) */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors break-words text-sm tracking-wide leading-5 flex-1">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="text-slate-400 hover:text-indigo-400 p-1 rounded hover:bg-slate-800 transition-all"
            title="Edit Task"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-all"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-400 leading-relaxed truncate-3-lines">
          {description}
        </p>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mt-2 border-t border-slate-800/40 pt-3">
        {/* Due Date Indicator */}
        {due_date ? (
          <div
            className={`flex items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-lg border ${
              isOverdue()
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-extrabold animate-pulse'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {due_date} {isOverdue() ? '(Overdue)' : ''}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-600 font-medium italic">No due date</span>
        )}

        {/* Priority Badge */}
        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${getPriorityClasses()}`}>
          {priority}
        </span>
      </div>

      {/* Task Flow Controls */}
      <div className="flex items-center justify-between border-t border-slate-800/40 pt-2.5 mt-1 text-[10px] text-slate-500 font-semibold">
        {status !== 'Todo' ? (
          <button
            onClick={handlePrevStatus}
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <span />
        )}

        {status !== 'Completed' ? (
          <button
            onClick={handleNextStatus}
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors ml-auto"
          >
            <span>{status === 'Todo' ? 'Start' : 'Complete'}</span>
            {status === 'Todo' ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 text-emerald-400 ml-auto font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Finished</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
