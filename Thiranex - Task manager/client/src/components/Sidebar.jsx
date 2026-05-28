import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Plus, Menu, X } from 'lucide-react';

const Sidebar = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  onOpenCreateModal,
  onResetFilters,
  totalTasksCount,
  filteredTasksCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Burger Trigger - Absolute positioned header-like widget on mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/20 active:scale-[0.9] transition-transform z-50 border border-indigo-400/20"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 glass-panel border-r border-slate-800 p-6 flex flex-col gap-6 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-73px)] lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Quick Actions */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Actions
          </h3>
          <button
            onClick={() => {
              onOpenCreateModal();
              setIsOpen(false); // Close on mobile
            }}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-4 text-sm font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Dynamic Filters Section */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Search Bar */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Search
            </h3>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by title/desc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-9 py-2 text-xs"
              />
            </div>
          </div>

          {/* Priority Filters */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority Filter
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'High', 'Medium', 'Low'].map((prio) => (
                <button
                  key={prio}
                  onClick={() => setPriorityFilter(prio)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    priorityFilter === prio
                      ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Filter
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'Todo', 'In Progress', 'Completed'].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setStatusFilter(stat)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    statusFilter === stat
                      ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Counter Info & Reset Filter Option */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Showing:</span>
            <span className="font-bold text-slate-200">
              {filteredTasksCount} of {totalTasksCount} tasks
            </span>
          </div>

          {(searchQuery || priorityFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={onResetFilters}
              className="flex items-center justify-center gap-1.5 w-full text-slate-400 hover:text-indigo-400 py-2 text-xs font-bold transition-all border border-dashed border-slate-800 hover:border-indigo-500/20 rounded-lg bg-slate-900/10 hover:bg-indigo-500/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </aside>
      
      {/* Overlay Backdrop for Mobile menu */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
