import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutGrid, List, Plus } from 'lucide-react';

const Navbar = ({ activeView, setActiveView, onOpenCreateModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-lg">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-500/10">
          T
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Thiranex
        </span>
        <span className="hidden sm:inline bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold uppercase tracking-wider">
          Workspace
        </span>
      </div>

      {/* Control Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Create Task button - Desktop */}
        <button
          onClick={onOpenCreateModal}
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-indigo-500/15 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        {/* Toggle buttons between Kanban / List View */}
        <div className="flex items-center bg-slate-900/60 rounded-xl p-1 border border-slate-800/80">
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeView === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Kanban</span>
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeView === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List Table View"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">List</span>
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/20 shadow-inner font-semibold uppercase">
              {user.username.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-3">{user.username}</p>
              <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[120px]">{user.email}</p>
            </div>
            
            {/* Logout Trigger */}
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/5 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
