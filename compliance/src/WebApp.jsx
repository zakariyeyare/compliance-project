import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ComplianceOverview from './screen/ComplianceOverview'; // Brug denne
import Dashboard from './screen/Dashboard';
import GDPRDashboard from './screen/GDPRDashboard';
import Login from './screen/Login';
import Register from './screen/Register';
import Reports from './screen/Reports';
import Udskriv from './screen/Udskriv';

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
              path="/gdpr-compliance" 
              element={
                <ProtectedRoute>
                  <GDPRDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/compliance-overview" 
              element={
                <ProtectedRoute>
                  <ComplianceOverview />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/udskriv" 
              element={
                <ProtectedRoute>
                  <Udskriv />
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
