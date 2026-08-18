import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EstimatorWizard from './components/estimator/EstimatorWizard';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Surface */}
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <EstimatorWizard />
          </div>
        } />
        
        {/* Admin Surface */}
        <Route path="/admin/login" element={<Login />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;