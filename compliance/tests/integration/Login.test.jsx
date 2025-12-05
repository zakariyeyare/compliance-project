import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import Login from '../../src/screen/Login';
import AuthContext from '../../src/components/AuthContextBase';

const mockNavigate = vi.fn();
const mockSignIn = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderLogin = (contextOverrides = {}) => {
  const value = {
    user: null,
    loading: false,
    signIn: mockSignIn,
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    createUserOrganization: vi.fn(),
    ...contextOverrides
  };

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Login screen integration', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSignIn.mockReset();
  });

  it('submits credentials and navigates to the dashboard on success', async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null });
    renderLogin();

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/Indtast din email/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Indtast din adgangskode/i), 'SuperSecret123');
    await user.click(screen.getByRole('button', { name: /Log ind/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'SuperSecret123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error message when Supabase rejects the credentials', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    renderLogin();

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/Indtast din email/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Indtast din adgangskode/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Log ind/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
