import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AuthContext from '../../src/components/AuthContextBase';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import Login from '../../src/screen/Login';

const DashboardStub = () => <div>Dashboard Stub</div>;

const renderWithRouter = (contextOverrides = {}, initialPath = '/dashboard') => {
  const contextValue = {
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    createUserOrganization: vi.fn(),
    ...contextOverrides
  };

  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardStub />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Protected routing flow', () => {
  it('redirects a guest to the login screen', () => {
    renderWithRouter({ user: null });

    expect(screen.getByRole('heading', { name: /Log ind/i })).toBeInTheDocument();
  });

  it('allows an authenticated user to reach the dashboard', () => {
    renderWithRouter({ user: { id: 'user-123', email: 'user@example.com' } });

    expect(screen.getByText(/Dashboard Stub/)).toBeInTheDocument();
  });
});
