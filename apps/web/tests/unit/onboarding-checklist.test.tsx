import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import type { OnboardingChecklistItem } from '@sales-machine/shared';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: vi.fn(),
}));

import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

const useOnboardingStatusMock = vi.mocked(useOnboardingStatus);

const baseStatus = {
  completed: false,
  pendingStep: 'domain' as const,
  checklist: [] as OnboardingChecklistItem[],
  isLoading: false,
  error: undefined,
  lastFetchedAt: Date.now(),
  refresh: vi.fn(() => Promise.resolve(null)),
};

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    navigateMock.mockReset();
    useOnboardingStatusMock.mockReturnValue(baseStatus);
  });

  it('returns null when onboarding is complete', () => {
    useOnboardingStatusMock.mockReturnValue({
      ...baseStatus,
      completed: true,
    });

    const { container } = render(<OnboardingChecklist />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error state when status fails to load', () => {
    useOnboardingStatusMock.mockReturnValue({
      ...baseStatus,
      error: 'Failed to fetch',
    });

    render(<OnboardingChecklist />);

    expect(
      screen.getByText(/We can’t fetch your checklist right now/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry status check/i })).toBeInTheDocument();
  });

  it('displays fallback checklist items when backend does not provide data', () => {
    render(<OnboardingChecklist />);

    expect(screen.getByText(/Confirm your meeting goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose your core industries/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify sending domain/i)).toBeInTheDocument();
    expect(screen.getByText(/Launch zero-config wizard/i)).toBeInTheDocument();
  });

  it('keeps the current onboarding step marked as incomplete in fallback mode', () => {
    useOnboardingStatusMock.mockReturnValue({
      ...baseStatus,
      pendingStep: 'industry',
    });

    render(<OnboardingChecklist />);

    expect(screen.getByRole('button', { name: /Select industries/i })).toBeInTheDocument();
  });

  it('navigates to onboarding with the requested step when clicking action', () => {
    const checklist: OnboardingChecklistItem[] = [
      {
        id: 'domain',
        title: 'Verify domain',
        completed: false,
        action: {
          label: 'Verify now',
          step: 'domain',
        },
      },
    ];

    useOnboardingStatusMock.mockReturnValue({
      ...baseStatus,
      checklist,
      pendingStep: 'domain',
    });

    render(<OnboardingChecklist />);

    fireEvent.click(screen.getByRole('button', { name: /Verify now/i }));
    expect(navigateMock).toHaveBeenCalledWith('/onboarding', { state: { step: 4 } });
  });
});


