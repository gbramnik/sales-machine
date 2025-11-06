import React from 'react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  size = 'md',
  showIcon = true,
  showLabel = false,
}) => {
  const getColorClasses = (score: number) => {
    if (score >= 80) {
      return {
        background: 'bg-success-50',
        text: 'text-success-600',
        border: 'border-success-200',
      }
    } else if (score >= 60) {
      return {
        background: 'bg-warning-50',
        text: 'text-warning-600',
        border: 'border-warning-200',
      }
    } else {
      return {
        background: 'bg-error-50',
        text: 'text-error-600',
        border: 'border-error-200',
      }
    }
  }

  const getIcon = (score: number) => {
    if (score >= 80) {
      return <CheckCircle className="w-4 h-4" />
    } else if (score >= 60) {
      return <AlertTriangle className="w-4 h-4" />
    } else {
      return <XCircle className="w-4 h-4" />
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
        }
      case 'lg':
        return {
          container: 'px-3 py-1.5 text-base',
          icon: 'w-5 h-5',
        }
      default: // md
        return {
          container: 'px-2.5 py-1 text-sm',
          icon: 'w-4 h-4',
        }
    }
  }

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return 'high confidence'
    if (score >= 60) return 'medium confidence'
    return 'low confidence'
  }

  const colors = getColorClasses(score)
  const sizes = getSizeClasses(size)
  const confidenceLevel = getConfidenceLevel(score)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        colors.background,
        colors.text,
        colors.border,
        sizes.container
      )}
      aria-label={`Confidence score ${score}%, ${confidenceLevel}`}
    >
      {showIcon && (
        <span className={sizes.icon}>
          {getIcon(score)}
        </span>
      )}
      {showLabel ? `Confidence: ${score}%` : `${score}%`}
    </span>
  )
}





