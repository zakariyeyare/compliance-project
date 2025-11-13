import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './screen/Dashboard';
import GDPRDashboard from './screen/GDPRDashboard';
import Login from './screen/Login';
import Register from './screen/Register';
import ComplianceOverview from './screen/ComplianceOverview';
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
            <Route path="/udskriv" element={<Udskriv />} />
            
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
              path="/compliance-overview" 
              element={
                <ProtectedRoute>
                  <ComplianceOverview />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/gdpr-compliance" 
              element={
                <ProtectedRoute>
                  <GDPRDashboard orgId={null} />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/udskriv" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/udskriv" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default WebApp;
