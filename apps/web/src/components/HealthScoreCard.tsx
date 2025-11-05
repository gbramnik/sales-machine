import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthScoreCardProps {
  score: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  breakdown?: {
    deliverability: number
    responseRate: number
    aiPerformance: number
  }
}

const CircularProgress: React.FC<{ score: number; size?: number }> = ({ 
  score, 
  size = 120 
}) => {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 90) return '#10B981' // success-500
    if (score >= 70) return '#F59E0B' // warning-500
    return '#EF4444' // error-500
  }

  const getStatus = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    return 'Needs Attention'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`Campaign health score: ${score}%, ${getStatus(score)}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 font-mono">
          {score}
        </span>
        <span className="text-xs text-gray-500 font-medium">
          {getStatus(score)}
        </span>
      </div>
    </div>
  )
}

const BreakdownChart: React.FC<{ breakdown: HealthScoreCardProps['breakdown'] }> = ({ 
  breakdown 
}) => {
  if (!breakdown) return null

  const items = [
    { label: 'Deliverability', value: breakdown.deliverability, max: 40 },
    { label: 'Response Rate', value: breakdown.responseRate, max: 30 },
    { label: 'AI Performance', value: breakdown.aiPerformance, max: 30 },
  ]

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const percentage = (item.value / item.max) * 100
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}:</span>
              <span className="font-medium text-gray-900">
                {item.value}/{item.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  score,
  trend,
  trendValue,
  breakdown,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-error-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-600'
      case 'down':
        return 'text-error-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className="h-60 hover:shadow-md transition-shadow">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Campaign Health</h3>
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
              {getTrendIcon()}
              <span>{trend === 'up' ? '+' : ''}{trendValue}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <CircularProgress score={score} />
        </div>

        {breakdown && (
          <div className="mt-4">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              aria-expanded={showBreakdown}
              aria-controls="breakdown-content"
            >
              <span>{showBreakdown ? 'Hide' : 'View'} Breakdown</span>
              <svg
                className={cn(
                  "w-4 h-4 transition-transform",
                  showBreakdown && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showBreakdown && (
              <div
                id="breakdown-content"
                className="mt-3 animate-slide-down"
              >
                <BreakdownChart breakdown={breakdown} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}




