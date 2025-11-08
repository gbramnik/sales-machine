import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { useAuthStore } from '@/stores/auth.store';

vi.mock('@/hooks/usePendingReviewCount', () => ({
  usePendingReviewCount: vi.fn(() => ({
    count: 3,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'alice@example.com' } as any,
      session: {} as any,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn(),
      setSession: vi.fn(),
      setUser: vi.fn(),
    });
  });

  const renderWithRouter = (initialEntry = '/dashboard') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            <Route path="/review-queue" element={<div>Review Queue Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it('highlights the active navigation link based on the current route', () => {
    renderWithRouter('/review-queue');

    const activeLink = screen.getByRole('link', { name: /Review Queue/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');

    const inactiveLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('renders pending review badge when items are awaiting approval', () => {
    renderWithRouter('/dashboard');

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('focuses the first nav item when the mobile menu opens', () => {
    renderWithRouter('/dashboard');

    const toggleButton = screen.getByRole('button', { name: /Open navigation/i });
    fireEvent.click(toggleButton);

    const closeButtons = screen.getAllByRole('button', { name: /Close navigation/i });
    expect(closeButtons.length).toBeGreaterThan(0);

    expect(document.activeElement).toHaveAccessibleName('Dashboard');
  });
});


