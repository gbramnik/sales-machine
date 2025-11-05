import React, { useState } from 'react'
import { HealthScoreCard } from './HealthScoreCard'
import { PipelineKanban } from './PipelineKanban'
import { AIActivityStream } from './AIActivityStream'
import { ConfidenceBadge } from './ConfidenceBadge'
import { VIPAccountIndicator } from './VIPAccountIndicator'
import { MessageReviewCard } from './MessageReviewCard'
import { OnboardingWizard } from './onboarding/OnboardingWizard'
import { Dashboard } from './dashboard/Dashboard'
import { ReviewQueue } from './review-queue/ReviewQueue'
import { LandingPage } from './landing/LandingPage'
import { LandingPageSimple } from './landing/LandingPageSimple'
import { SettingsPanel } from './settings/SettingsPanel'
import { MobileMenu } from './layout/MobileMenu'
import { KeyboardShortcuts } from './accessibility/KeyboardShortcuts'
import { SkipLinks } from './accessibility/SkipLink'
import { Button } from './ui/button'

// Mock data for demonstration
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
    ],
  },
  {
    id: 'engaged',
    label: 'Engaged',
    count: 64,
    prospects: [
      {
        id: '3',
        name: 'Mary Johnson',
        company: 'TechStart Inc',
        confidenceScore: 78,
        isVIP: false,
        lastActivity: '1 hour ago',
      },
    ],
  },
  {
    id: 'qualified',
    label: 'Qualified',
    count: 27,
    prospects: [],
  },
  {
    id: 'meeting-booked',
    label: 'Meeting Booked',
    count: 12,
    prospects: [
      {
        id: '4',
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
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    type: 'qualified' as const,
    prospect: {
      name: 'Sarah Chen',
      company: 'FinTech Solutions',
    },
    confidence: 92,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    type: 'booked' as const,
    prospect: {
      name: 'John Smith',
      company: 'Acme Corp',
    },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    type: 'flagged' as const,
    prospect: {
      name: 'Mary Johnson',
      company: 'TechStart Inc',
    },
    confidence: 78,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    type: 'responded' as const,
    prospect: {
      name: 'David Wilson',
      company: 'Innovation Labs',
    },
  },
]

const mockMessageReview = {
  prospect: {
    name: 'Sarah Chen',
    company: 'FinTech Solutions',
    title: 'VP of Marketing',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
  },
  message: {
    id: 'msg-1',
    content: `Hi Sarah,

I noticed your team just brought on two new SDRs—congratulations! Scaling outreach is exciting but challenging.

Many marketing leaders we work with hit a wall when trying to scale their sales development efforts. The common pain points are:

• Lead quality inconsistency
• Time-consuming prospect research
• Follow-up sequence management
• Meeting booking coordination

I'd love to share how we've helped similar companies automate their prospecting while maintaining personalization. Would you be open to a 15-minute conversation this week?

Best regards,
John`,
    confidence: 87,
    generatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  context: {
    talkingPoints: [
      'Recent hire: 2 SDRs (LinkedIn Jobs)',
      'Pain point: Lead gen scaling challenges',
      'Engaged with post about sales automation (3 days ago)',
    ],
    recentActivity: 'Posted about challenges onboarding new sales team members (Oct 2)',
    conversationHistory: undefined,
  },
  onApprove: (messageId: string) => console.log('Approved:', messageId),
  onEdit: (messageId: string, newContent: string) => console.log('Edited:', messageId, newContent),
  onReject: (messageId: string, reason?: string) => console.log('Rejected:', messageId, reason),
  isVIP: true,
}

export const DemoDashboard: React.FC = () => {
  const [view, setView] = useState<'landing' | 'home' | 'onboarding' | 'dashboard' | 'review-queue' | 'settings' | 'components'>('landing')

  if (view === 'landing') {
    return (
      <LandingPageSimple 
        onGetStarted={() => setView('onboarding')}
        onViewDashboard={() => setView('dashboard')}
      />
    )
  }

  if (view === 'onboarding') {
    return (
      <OnboardingWizard 
        onComplete={() => setView('dashboard')} 
      />
    )
  }

  if (view === 'dashboard') {
    return <Dashboard />
  }

  if (view === 'review-queue') {
    return <ReviewQueue />
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b mb-6">
          <div className="container mx-auto px-4 py-4">
            <Button variant="outline" onClick={() => setView('dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
        <SettingsPanel />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Accessibility Features */}
      <SkipLinks />
      <KeyboardShortcuts />
      
      {/* Mobile Menu */}
      <MobileMenu currentView={view} onNavigate={(v) => setView(v as any)} />

      <div className="max-w-7xl mx-auto space-y-8" id="main-content">
        {/* Header */}
        <div className="text-center space-y-4 pt-12 md:pt-0">
          <h1 className="text-4xl md:text-display text-gray-900">Sales Machine</h1>
          <p className="text-base md:text-body-lg text-gray-600 px-4">
            AI-powered B2B sales automation platform
          </p>
          <div className="hidden md:flex justify-center gap-4 flex-wrap">
            <Button onClick={() => setView('landing')}>
              🏠 Landing Page
            </Button>
            <Button onClick={() => setView('onboarding')}>
              🚀 Onboarding Wizard
            </Button>
            <Button onClick={() => setView('dashboard')}>
              📊 Dashboard
            </Button>
            <Button onClick={() => setView('review-queue')}>
              ✉️ Review Queue
            </Button>
            <Button onClick={() => setView('settings')}>
              ⚙️ Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setView(view === 'components' ? 'home' : 'components')}
            >
              🎨 Design Components
            </Button>
          </div>
        </div>

        {/* Design System Showcase */}
        {view === 'components' && (
        <div className="space-y-8">
          <h2 className="text-h2 text-gray-900">Design System Components</h2>
          
          {/* Health Score Card */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">Health Score Card</h3>
            <div className="max-w-sm">
              <HealthScoreCard {...mockHealthScore} />
            </div>
          </div>

          {/* Confidence Badges */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">Confidence Badges</h3>
            <div className="flex flex-wrap gap-4">
              <ConfidenceBadge score={95} size="sm" />
              <ConfidenceBadge score={87} size="md" />
              <ConfidenceBadge score={73} size="lg" />
              <ConfidenceBadge score={45} size="md" />
            </div>
          </div>

          {/* VIP Indicators */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">VIP Account Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <VIPAccountIndicator isVIP={true} placement="icon" />
              <VIPAccountIndicator isVIP={true} placement="badge" />
              <VIPAccountIndicator isVIP={true} placement="banner" reason="C-level executive" />
            </div>
          </div>

          {/* Pipeline Kanban */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">Pipeline Kanban</h3>
            <PipelineKanban 
              stages={mockPipelineStages}
              onProspectClick={(id) => console.log('Clicked prospect:', id)}
            />
          </div>

          {/* AI Activity Stream */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">AI Activity Stream</h3>
            <AIActivityStream 
              activities={mockActivities}
              enableLiveUpdates={true}
            />
          </div>

          {/* Message Review Card */}
          <div className="space-y-4">
            <h3 className="text-h3 text-gray-800">Message Review Card</h3>
            <MessageReviewCard {...mockMessageReview} />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

