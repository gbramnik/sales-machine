import React, { useMemo } from 'react'
import { Calendar, Mail, Users } from 'lucide-react'
import { HealthScoreCard } from '../HealthScoreCard'
import { MetricCard } from './MetricCard'
import { PipelineKanban } from '../PipelineKanban'
import { AIActivityStream } from '../AIActivityStream'
import { AlertCenter } from './AlertCenter'
import { OnboardingChecklist } from './OnboardingChecklist'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { usePipeline } from '@/hooks/usePipeline'
import { useActivityStream } from '@/hooks/useActivityStream'
import { useAlerts } from '@/hooks/useAlerts'

export const Dashboard: React.FC = () => {
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { stages: pipelineStages, isLoading: pipelineLoading } = usePipeline()
  const { activities, isLoading: activitiesLoading } = useActivityStream(true)
  const { alerts, dismissAlert, isLoading: alertsLoading } = useAlerts()

  const totalProspects = stats?.totalProspects ?? 0
  const pendingReviews = stats?.pendingReviews ?? 0
  const activeCampaigns = stats?.activeCampaigns ?? 0

  const alertItems = useMemo(
    () =>
      alerts.map((alert) => ({
        id: alert.id,
        type:
          alert.type === 'deliverability'
            ? 'warning'
            : alert.type === 'vip_review'
            ? 'action'
            : alert.type === 'meeting_booked'
            ? 'success'
            : 'info',
        title: alert.title,
        description: alert.message,
        timestamp: alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp),
        action: alert.actionUrl
          ? {
              label: 'View Details',
              onClick: () => window.location.assign(alert.actionUrl!),
            }
          : undefined,
      })),
    [alerts]
  )

  const hasPipelineStages = pipelineStages.length > 0

  return (
    <div className="space-y-8">
      <OnboardingChecklist />

      <section className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Monitor campaign health, review AI activity, and keep your pipeline moving.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <div className="col-span-1 h-60 animate-pulse rounded-lg border border-gray-200 bg-white" />
        ) : stats?.healthScore ? (
          <HealthScoreCard {...stats.healthScore} />
        ) : (
          <div className="col-span-1 flex h-60 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-400">
            No health data yet
          </div>
        )}

        <MetricCard
          title="Pending Reviews"
          value={pendingReviews}
          subtitle="Messages awaiting approval"
          icon={<Mail className="h-5 w-5" />}
        />

        <MetricCard
          title="Active Campaigns"
          value={activeCampaigns}
          subtitle="Campaigns currently running"
          icon={<Calendar className="h-5 w-5" />}
        />

        <MetricCard
          title="Total Prospects"
          value={totalProspects}
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Contacted:</span>
              <span className="font-semibold text-gray-900">
                {stats?.pipeline?.contacted ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engaged:</span>
              <span className="font-semibold text-gray-900">
                {stats?.pipeline?.engaged ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualified:</span>
              <span className="font-semibold text-gray-900">
                {stats?.pipeline?.qualified ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meeting booked:</span>
              <span className="font-semibold text-gray-900">
                {stats?.pipeline?.meetingBooked ?? 0}
              </span>
            </div>
          </div>
        </MetricCard>
      </section>

      <section>
        {pipelineLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-gray-600">
            Loading pipeline...
          </div>
        ) : hasPipelineStages ? (
          <PipelineKanban stages={pipelineStages} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-sm text-gray-500">
            Pipeline data will appear here once prospects start progressing.
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activitiesLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-gray-600">
              Loading activity stream...
            </div>
          ) : (
            <AIActivityStream activities={activities} enableLiveUpdates={true} />
          )}
        </div>
        <div>
          {alertsLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-gray-600">
              Loading alerts...
            </div>
          ) : (
            <AlertCenter alerts={alertItems} onDismiss={dismissAlert} />
          )}
        </div>
      </section>
    </div>
  )
}





