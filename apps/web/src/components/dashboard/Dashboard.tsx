import React, { useState } from 'react'
import { HealthScoreCard } from '../HealthScoreCard'
import { MetricCard } from './MetricCard'
import { PipelineKanban } from '../PipelineKanban'
import { AIActivityStream } from '../AIActivityStream'
import { AlertCenter } from './AlertCenter'
import { Calendar, Users, Mail } from 'lucide-react'

// Mock data
const mockHealthScore = {
  score: 92,
  trend: 'up' as const,
  trendValue: 5,
  breakdown: {
    deliverability: 38,
    responseRate: 24,
    aiPerformance: 30,
  },
}

const mockPipelineStages = [
  {
    id: 'contacted',
    label: 'Contacted',
    count: 156,
    prospects: [
      {
        id: '1',
        name: 'Sarah Chen',
        company: 'FinTech Solutions',
        confidenceScore: 92,
        isVIP: true,
        lastActivity: '2 hours ago',
      },
      {
        id: '2',
        name: 'John Smith',
        company: 'Acme Corp',
        confidenceScore: 87,
        isVIP: false,
        lastActivity: '4 hours ago',
      },
      {
        id: '3',
        name: 'Emily Davis',
        company: 'Tech Innovations',
        confidenceScore: 85,
        isVIP: false,
        lastActivity: '5 hours ago',
      },
    ],
  },
  {
    id: 'engaged',
    label: 'Engaged',
    count: 64,
    prospects: [
      {
        id: '4',
        name: 'Mary Johnson',
        company: 'TechStart Inc',
        confidenceScore: 78,
        isVIP: false,
        lastActivity: '1 hour ago',
      },
      {
        id: '5',
        name: 'Robert Brown',
        company: 'Digital Co',
        confidenceScore: 82,
        isVIP: false,
        lastActivity: '3 hours ago',
      },
    ],
  },
  {
    id: 'qualified',
    label: 'Qualified',
    count: 27,
    prospects: [
      {
        id: '6',
        name: 'Lisa Anderson',
        company: 'Growth Partners',
        confidenceScore: 91,
        isVIP: true,
        lastActivity: '30 minutes ago',
      },
    ],
  },
  {
    id: 'meeting-booked',
    label: 'Meeting Booked',
    count: 12,
    prospects: [
      {
        id: '7',
        name: 'David Wilson',
        company: 'Innovation Labs',
        confidenceScore: 95,
        isVIP: false,
        lastActivity: '30 minutes ago',
      },
    ],
  },
]

const mockActivities = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'qualified' as const,
    prospect: { name: 'Sarah Chen', company: 'FinTech Solutions' },
    confidence: 92,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: 'booked' as const,
    prospect: { name: 'John Smith', company: 'Acme Corp' },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'flagged' as const,
    prospect: { name: 'Mary Johnson', company: 'TechStart Inc' },
    confidence: 78,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: 'responded' as const,
    prospect: { name: 'David Wilson', company: 'Innovation Labs' },
  },
]

const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'Deliverability Warning',
    description: 'Bounce rate increased to 4.2% (threshold: 5%)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    action: {
      label: 'View Details',
      onClick: () => console.log('View details'),
    },
  },
  {
    id: '2',
    type: 'action' as const,
    title: 'VIP Account Needs Approval',
    description: '3 messages awaiting review for C-level prospects',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    action: {
      label: 'Review Queue',
      onClick: () => console.log('Go to review queue'),
    },
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'Domain Warm-up Complete',
    description: 'yourdomain.com is now at full sending capacity',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    action: {
      label: 'Dismiss',
      onClick: () => console.log('Dismiss'),
    },
  },
]

export const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts)

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1 text-gray-900">Dashboard</h1>
              <p className="text-body-lg text-gray-600 mt-2">
                Welcome back, John! Your AI Sales Rep booked 2 meetings this week. 🎉
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <span className="sr-only">Notifications</span>
                <span className="text-2xl">🔔</span>
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthScoreCard {...mockHealthScore} />
          
          <MetricCard
            title="Meetings This Week"
            value="12"
            trend={{ direction: 'up', value: 3, label: 'from last week' }}
            icon={<Calendar className="w-5 h-5" />}
          >
            <div className="text-sm text-gray-600">
              <p className="font-medium">Next: Tomorrow 2:00 PM</p>
              <p className="truncate">Sarah Chen - FinTech Corp</p>
            </div>
          </MetricCard>

          <MetricCard
            title="Active Prospects"
            value="247"
            icon={<Users className="w-5 h-5" />}
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Contacted:</span>
                <span className="font-semibold text-gray-900">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engaged:</span>
                <span className="font-semibold text-gray-900">64</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Qualified:</span>
                <span className="font-semibold text-gray-900">27</span>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            title="Review Queue"
            value="8"
            subtitle="messages awaiting"
            icon={<Mail className="w-5 h-5" />}
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">VIP Accounts:</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Confidence:</span>
                <span className="font-semibold text-gray-900">5</span>
              </div>
            </div>
          </MetricCard>
        </div>

        {/* Pipeline Section */}
        <PipelineKanban
          stages={mockPipelineStages}
          onProspectClick={(id) => console.log('Clicked prospect:', id)}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Activity Stream - 2 columns */}
          <div className="lg:col-span-2">
            <AIActivityStream activities={mockActivities} enableLiveUpdates={true} />
          </div>

          {/* Alert Center - 1 column */}
          <div>
            <AlertCenter alerts={alerts} onDismiss={handleDismissAlert} />
          </div>
        </div>
      </div>
    </div>
  )
}




