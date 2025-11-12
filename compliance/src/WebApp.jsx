import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './screen/Dashboard';
import GDPRDashboard from './screen/GDPRDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './screen/Login';
import Register from './screen/Register';
import ComplianceOverview from './screen/ComplianceOverview';


function WebApp() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Quick debug route to verify routing/rendering */}
            <Route path="/gdpr-test" element={<div style={{padding:40,textAlign:'center'}}><h2>GDPR test route — React renders OK</h2><p>Remove this when debugging is done.</p></div>} />
            
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
                  <ErrorBoundary>
                    <GDPRDashboard orgId={null} />
                  </ErrorBoundary>
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
