import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ComplianceOverview from '../../src/screen/ComplianceOverview';
import AuthContext from '../../src/components/AuthContextBase';

const { mockGetUser, mockedService } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockedService: {
    getGDPRFullStructure: vi.fn()
  }
}));
const mockStructure = {
  title: 'GDPR',
  code: 'GDPR',
  controls: [
    {
      id: 'control-1',
      code: 'AC-1',
      definition: 'Access control policies must be documented.',
      subcontrols: [
        {
          id: 'sub-1',
          code: 'AC-1.1',
          activities: [
            { id: 'act-1', description: 'Define access control roles.' }
          ]
        }
      ]
    }
  ]
};

vi.mock('../../src/SupabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      getUser: () => mockGetUser()
    }
  }
}));

vi.mock('../../src/components/gdbrSupabase', () => ({
  __esModule: true,
  default: mockedService
}));

const renderScreen = () => {
  const authValue = {
    user: { email: 'analyst@example.com', user_metadata: { full_name: 'Analyst' } },
    loading: false,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn()
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/compliance-overview']}>
        <ComplianceOverview />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ComplianceOverview', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedService.getGDPRFullStructure.mockResolvedValue(mockStructure);
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: 'auditor@example.com',
          user_metadata: { full_name: 'QA Auditor' }
        }
      }
    });
  });

  it('renders saved policy statistics and completed list', async () => {
    localStorage.setItem('gdpr_saved_policies', JSON.stringify({
      'sub-1': 'Documented policy text'
    }));

    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/Completed Policies \(1\)/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Create New Report/i })).toBeEnabled();
    expect(screen.getByText(/Documented policy text/i)).toBeInTheDocument();
    expect(mockedService.getGDPRFullStructure).toHaveBeenCalled();
  });

  it('creates a draft report and stores it in localStorage', async () => {
    localStorage.setItem('gdpr_saved_policies', JSON.stringify({
      'sub-1': 'Policy to include in report'
    }));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderScreen();

    await waitFor(() => expect(screen.getByRole('button', { name: /Create New Report/i })).toBeEnabled());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Create New Report/i }));

    const modalTitleInput = await screen.findByPlaceholderText(/Enter report title/i);
    await user.clear(modalTitleInput);
    await user.type(modalTitleInput, 'Quarterly GDPR Summary');

    await user.click(screen.getByRole('button', { name: /Create Report/i }));

    await waitFor(() => {
      const savedReports = JSON.parse(localStorage.getItem('gdpr_reports'));
      expect(savedReports).toHaveLength(1);
      expect(savedReports[0].title).toBe('Quarterly GDPR Summary');
      expect(savedReports[0].status).toBe('Draft');
      expect(savedReports[0].requestedBy).toBe('auditor@example.com');
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Quarterly GDPR Summary'));
    alertSpy.mockRestore();
  });
});
