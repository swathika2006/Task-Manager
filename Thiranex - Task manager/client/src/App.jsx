import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Application Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Root Navigation Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Wildcard 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-darkBg text-slate-100 flex-col gap-4">
                <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">404</h1>
                <p className="text-slate-400 font-medium">Workspace page not found</p>
                <a 
                  href="/dashboard" 
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
                >
                  Return to Dashboard
                </a>
              </div>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
