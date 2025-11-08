import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);
const useOnboardingStatusMock = vi.mocked(useOnboardingStatus);

const baseOnboardingStatus = {
  completed: false,
  pendingStep: undefined,
  checklist: [],
  isLoading: false,
  error: undefined,
  lastFetchedAt: Date.now(),
  refresh: vi.fn(() => Promise.resolve(null)),
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      requireAuth: vi.fn(),
    });

    useOnboardingStatusMock.mockReturnValue(baseOnboardingStatus);
  });

  it('renders loading state while authentication is resolving', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      session: null,
      requireAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to onboarding when the flow is incomplete', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1' },
      session: {},
      requireAuth: vi.fn(),
    });

    useOnboardingStatusMock.mockReturnValue({
      ...baseOnboardingStatus,
      completed: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/onboarding" element={<div>Onboarding Wizard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Onboarding Wizard')).toBeInTheDocument();
  });

  it('allows onboarding route when incomplete and redirects to dashboard once complete', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1' },
      session: {},
      requireAuth: vi.fn(),
    });

    useOnboardingStatusMock.mockReturnValue({
      ...baseOnboardingStatus,
      completed: true,
    });

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/onboarding" element={<div>Onboarding Wizard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows retry UI when onboarding status fails to load', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1' },
      session: {},
      requireAuth: vi.fn(),
    });

    useOnboardingStatusMock.mockReturnValue({
      ...baseOnboardingStatus,
      error: 'Failed to load status',
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/We couldn't confirm your setup/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});


