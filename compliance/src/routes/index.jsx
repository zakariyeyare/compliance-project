// alle routes: login / kontrolmål / approval
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/ui/layout/AppLayout.jsx';
import ProtectedRoute from '../components/ui/protectedRoute.jsx';
import ApprovalPage from '../screen/ApprovalPage.jsx';
import KontrolmalPage from '../screen/KontrolmalPage.jsx';
import LoginPage from '../screen/LoginPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/kontrolmal" element={<KontrolmalPage />} />
        <Route path="/approval" element={<ApprovalPage />} />
      </Route>

      {/* Defaults */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
