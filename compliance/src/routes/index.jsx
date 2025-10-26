// alle routes: login / setup / kontrolmål / approval / print
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/ui/layout/AppLayout.jsx';
import PublicLayout from '../components/ui/layout/PublicLayout.jsx';
import ProtectedRoute from '../components/ui/protectedRoute.jsx';
import ApprovalPage from '../screen/ApprovalPage.jsx';
import CompanySetup from '../screen/Companysetup.jsx';
import KontrolmalPage from '../screen/KontrolmalPage.jsx'; // ← renamed file
import LoginPage from '../screen/LoginPage.jsx';
import SignupPage from '../screen/signupPage.jsx'; // ← new import

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />   {/* ← new route  */}
      </Route>

      {/* Protected */}
      <Route element={<AppLayout />}>
        <Route
          path="/setup"
          element={<ProtectedRoute><CompanySetup /></ProtectedRoute>}
        />
        <Route
          path="/kontrolmal"
          element={<ProtectedRoute><KontrolmalPage /></ProtectedRoute>}
        />
        <Route
          path="/approval"
          element={<ProtectedRoute><ApprovalPage /></ProtectedRoute>}
        />
      </Route>

      {/* default -> login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
