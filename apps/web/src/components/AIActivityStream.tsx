import React, { useState, useEffect } from 'react'
import { CheckCircle, Mail, Calendar, AlertTriangle } from 'lucide-react'
import { ConfidenceBadge } from './ConfidenceBadge'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  timestamp: Date
  type: 'qualified' | 'responded' | 'booked' | 'flagged'
  prospect: {
    name: string
    company: string
  }
  confidence?: number
  message?: string
}

interface AIActivityStreamProps {
  activities: ActivityItem[]
  maxHeight?: string
  enableLiveUpdates?: boolean
}

const ActivityIcon: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
  const iconProps = { className: "w-4 h-4" }
  
  switch (type) {
    case 'qualified':
      return <CheckCircle {...iconProps} className="w-4 h-4 text-success-500" />
    case 'responded':
      return <Mail {...iconProps} className="w-4 h-4 text-primary-500" />
    case 'booked':
      return <Calendar {...iconProps} className="w-4 h-4 text-success-500" />
    case 'flagged':
      return <AlertTriangle {...iconProps} className="w-4 h-4 text-warning-500" />
    default:
      return <CheckCircle {...iconProps} />
  }
}

const ActivityItem: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const getActivityText = () => {
    switch (activity.type) {
      case 'qualified':
        return `AI qualified ${activity.prospect.name}`
      case 'responded':
        return `Responded to ${activity.prospect.name}`
      case 'booked':
        return `Meeting booked with ${activity.prospect.name}`
      case 'flagged':
        return `Low confidence message flagged`
      default:
        return 'Activity'
    }
  }

  const getSecondaryText = () => {
    switch (activity.type) {
      case 'booked':
        return `${activity.prospect.company} - Tomorrow 3:00 PM`
      case 'responded':
        return `${activity.prospect.company} - Asked qualification question`
      case 'flagged':
        return `${activity.prospect.name} - Review needed`
      default:
        return activity.prospect.company
    }
  }

  const getDotColor = () => {
    switch (activity.type) {
      case 'qualified':
      case 'booked':
        return 'bg-success-500'
      case 'responded':
        return 'bg-primary-500'
      case 'flagged':
        return 'bg-warning-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="relative pl-6 pb-6">
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1 w-2 h-2 rounded-full",
        getDotColor()
      )} />
      
      {/* Timeline line */}
      <div className="absolute left-1 top-3 w-0.5 h-full bg-gray-200" />
      
      {/* Content */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ActivityIcon type={activity.type} />
          <span className="text-sm text-gray-500">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {getActivityText()}
          </p>
          <p className="text-sm text-gray-500">
            {getSecondaryText()}
          </p>
          
          {activity.confidence && (
            <div className="flex items-center gap-2">
              <ConfidenceBadge 
                score={activity.confidence} 
                size="sm" 
                showLabel={false}
              />
            </div>
          )}
          
          {activity.type === 'flagged' && (
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Review
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const AIActivityStream: React.FC<AIActivityStreamProps> = ({
  activities,
  maxHeight = "400px",
  enableLiveUpdates = false,
}) => {
  const [isLive, setIsLive] = useState(enableLiveUpdates)
  const [newActivityCount, setNewActivityCount] = useState(0)

  // Simulate live updates
  useEffect(() => {
    if (!enableLiveUpdates) return

    const interval = setInterval(() => {
      setNewActivityCount(prev => prev + 1)
    }, 30000) // New activity every 30 seconds

    return () => clearInterval(interval)
  }, [enableLiveUpdates])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h3 text-gray-900">AI Activity Stream</h2>
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 text-sm text-success-600">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
          <button className="text-sm text-gray-600 hover:text-gray-900">
            View All
          </button>
        </div>
      </div>

      {/* Stream Container */}
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto"
        style={{ maxHeight }}
        role="feed"
        aria-busy={enableLiveUpdates}
        aria-label="AI activity stream"
      >
        {newActivityCount > 0 && (
          <div className="mb-4 p-2 bg-primary-50 border border-primary-200 rounded-md">
            <button 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              onClick={() => setNewActivityCount(0)}
            >
              {newActivityCount} new activit{newActivityCount === 1 ? 'y' : 'ies'}
            </button>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm">No recent activity</span>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "animate-fade-in",
                  index === 0 && "animate-slide-down"
                )}
              >
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





