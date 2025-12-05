import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AuthContext from '../../../src/components/AuthContextBase';
import ProtectedRoute from '../../../src/components/ProtectedRoute';

const renderWithAuth = (value, ui) => {
  return render(
    <AuthContext.Provider value={value}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('renders a loading indicator while auth state is resolving', () => {
    renderWithAuth(
      { user: null, loading: true },
      <ProtectedRoute>
        <div>Privat side</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/Indlæser/)).toBeInTheDocument();
  });

  it('navigates to the login page when no user is present', () => {
    renderWithAuth(
      { user: null, loading: false },
      (
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )
    );

    expect(screen.getByText(/Login Page/)).toBeInTheDocument();
  });

  it('renders the protected content when a user exists', () => {
    renderWithAuth(
      { user: { id: 'user-1' }, loading: false },
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/Dashboard Content/)).toBeInTheDocument();
  });
});
