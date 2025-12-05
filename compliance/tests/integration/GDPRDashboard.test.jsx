import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import AuthContext from '../../src/components/AuthContextBase';
import GDPRDashboard from '../../src/screen/GDPRDashboard';

const { mockNavigate, mockedService } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockedService: {
    getGDPRFullStructure: vi.fn(),
    getWorkingPolicies: vi.fn(),
    upsertWorkingPolicy: vi.fn()
  }
}));
const mockStructure = {
  title: 'GDPR',
  code: 'GDPR',
  controls: [
    {
      id: 'control-1',
      code: 'AC-1',
      definition: 'Define control objective.',
      subcontrols: [
        {
          id: 'sub-1',
          code: 'AC-1.1',
          activities: [
            { id: 'act-1', description: 'Collect requirements.' }
          ]
        }
      ]
    }
  ]
};

vi.mock('../../src/components/gdbrSupabase', () => ({
  __esModule: true,
  default: mockedService
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderDashboard = () => {
  const authValue = {
    user: { email: 'analyst@example.com', user_metadata: { full_name: 'Analyst' } },
    loading: false,
    signOut: vi.fn()
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/gdpr-compliance']}>
        <GDPRDashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('GDPRDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockedService.getGDPRFullStructure.mockResolvedValue(mockStructure);
    mockedService.getWorkingPolicies.mockResolvedValue([]);
  });

  it('saves a typed policy locally and swaps the button label to Update', async () => {
    renderDashboard();

    const textarea = await screen.findByPlaceholderText(/Write policy \/ evidence/i);
    const user = userEvent.setup();
    await user.type(textarea, 'Policy sample text');

    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('gdpr_saved_policies'));
      expect(saved['sub-1']).toContain('Policy sample text');
    });

    await screen.findByRole('button', { name: /Update/i }, { timeout: 2000 });

  });

  it('navigates to the compliance overview when the CTA is used', async () => {
    renderDashboard();

    const ctas = await screen.findAllByRole('button', { name: /Continue to Overview/i });
    const user = userEvent.setup();
    await user.click(ctas[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/compliance-overview');
  });
});
