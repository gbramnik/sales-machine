import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OnboardingChecklistItem, OnboardingStep } from '@sales-machine/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface ChecklistDisplayItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  step?: OnboardingStep;
  href?: string;
  actionLabel?: string;
}

const STEP_NUMBER_MAP: Record<OnboardingStep, number> = {
  goal_selection: 1,
  industry: 2,
  icp: 3,
  domain: 4,
  calendar: 5,
  complete: 5,
};

const STEP_ORDER: OnboardingStep[] = ['goal_selection', 'industry', 'icp', 'domain', 'calendar', 'complete'];

const DEFAULT_CHECKLIST: Array<Omit<ChecklistDisplayItem, 'completed'>> = [
  {
    id: 'goal_selection',
    title: 'Confirm your meeting goal',
    description: 'Set the monthly meeting target so the AI Sales Rep tunes pacing.',
    step: 'goal_selection',
    actionLabel: 'Update goal',
  },
  {
    id: 'industry',
    title: 'Choose your core industries',
    description: 'Prioritise the segments your outbound motions must focus on first.',
    step: 'industry',
    actionLabel: 'Select industries',
  },
  {
    id: 'icp',
    title: 'Define your ICP',
    description: 'Lock in industries, titles, and regions for automated prospecting.',
    step: 'icp',
    actionLabel: 'Review ICP',
  },
  {
    id: 'domain',
    title: 'Verify sending domain',
    description: 'Prove domain ownership and finish warm-up to unlock campaigns.',
    step: 'domain',
    actionLabel: 'Verify domain',
  },
  {
    id: 'calendar',
    title: 'Connect your calendar',
    description: 'Sync availability so Sales Machine can book meetings automatically.',
    step: 'calendar',
    actionLabel: 'Connect calendar',
  },
  {
    id: 'launch',
    title: 'Launch zero-config wizard',
    description: 'Activate the AI Sales Rep and unlock dashboards & analytics.',
    step: 'complete',
    actionLabel: 'Launch now',
  },
];

const normalizeChecklist = (
  rawItems: OnboardingChecklistItem[],
  pendingStep?: OnboardingStep,
  completedFlag?: boolean
): ChecklistDisplayItem[] => {
  if (!rawItems.length) {
    const orderedDefaults = STEP_ORDER.map((step) => DEFAULT_CHECKLIST.find((item) => item.step === step)).filter(
      (item): item is Omit<ChecklistDisplayItem, 'completed'> => Boolean(item)
    );

    const pendingIndex = pendingStep
      ? orderedDefaults.findIndex((item) => item.step === pendingStep)
      : orderedDefaults.length;

    return orderedDefaults.map((item, index) => ({
      ...item,
      completed: completedFlag ? true : index < pendingIndex,
    }));
  }

  return rawItems.map((item) => {
    const title =
      item.title ||
      (typeof (item as Record<string, unknown>).label === 'string'
        ? ((item as Record<string, string>).label)
        : item.id.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()));

    return {
      id: item.id,
      title,
      description: item.description,
      completed: Boolean(item.completed),
      step: item.action?.step,
      href: item.action?.href,
      actionLabel: item.action?.label,
    };
  });
};

export const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
  const {
    completed,
    pendingStep,
    checklist,
    isLoading,
    error,
    refresh,
  } = useOnboardingStatus();

  const items = useMemo(
    () => normalizeChecklist(checklist ?? [], pendingStep, completed ?? undefined),
    [checklist, pendingStep, completed]
  );

  if (completed) {
    return null;
  }

  if (error) {
    return (
      <Card className="border border-amber-200 bg-amber-50/70">
        <CardContent className="flex flex-col gap-3 py-6">
          <div>
            <h2 className="text-lg font-semibold text-amber-900">We can’t fetch your checklist right now</h2>
            <p className="text-sm text-amber-800">
              Please retry. You’ll need to reconnect to complete onboarding and unlock the dashboard.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              refresh(true).catch(() => {
                /* handled in store */
              });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry status check
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalItems = items.length || 1;
  const completedCount = items.filter((item) => item.completed).length;
  const progressValue = Math.round((completedCount / totalItems) * 100);

  const handleAction = (item: ChecklistDisplayItem) => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    const step = item.step;
    if (step) {
      const stepNumber = STEP_NUMBER_MAP[step] ?? 1;
      navigate('/onboarding', { state: { step: stepNumber } });
      return;
    }

    navigate('/onboarding');
  };

  return (
    <Card className="border border-primary-200 bg-primary-50/60">
      <CardContent className="space-y-5 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">
              Finish onboarding to unlock your Sales Machine workspace
            </h2>
            <p className="text-sm text-primary-800">
              Complete each step to gain access to the dashboard, analytics, and automation controls.
            </p>
          </div>
          <div className="min-w-[160px] rounded-md border border-primary-200 bg-white px-4 py-2 text-center">
            <p className="text-xs font-medium text-primary-600">Progress</p>
            <p className="text-lg font-semibold text-primary-900">{progressValue}%</p>
          </div>
        </div>

        <Progress value={progressValue} />

        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = item.completed ? CheckCircle2 : Circle;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border border-dashed border-primary-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between',
                  item.completed && 'border-solid border-primary-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn('mt-1 h-5 w-5', item.completed ? 'text-primary-600' : 'text-primary-300')}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{item.title}</p>
                    {item.description && <p className="mt-1 text-sm text-primary-700">{item.description}</p>}
                  </div>
                </div>
                {!item.completed && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="self-start sm:self-center"
                    onClick={() => handleAction(item)}
                    disabled={isLoading}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {item.actionLabel ?? 'Continue'}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};


