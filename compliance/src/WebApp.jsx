import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './screen/Login';
import Register from './screen/Register';
import Dashboard from './screen/Dashboard';
<<<<<<< HEAD
import ComplianceOverview from './screen/ComplianceOverview';
=======
import ComplianceOversigt from './screen/ComplianceOversigt';
>>>>>>> 8846c5ccaf1fe7aa101a047e95407e84e280290c
import 'bootstrap/dist/css/bootstrap.min.css';


function WebApp() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
<<<<<<< HEAD
              path="/compliance-overview" 
              element={
                <ProtectedRoute>
                  <ComplianceOverview />
=======
              path="/compliance-oversigt" 
              element={
                <ProtectedRoute>
                  <ComplianceOversigt />
>>>>>>> 8846c5ccaf1fe7aa101a047e95407e84e280290c
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default WebApp;
