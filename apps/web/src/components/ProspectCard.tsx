import React from 'react'
import { ConfidenceBadge } from './ConfidenceBadge'
import { VIPAccountIndicator } from './VIPAccountIndicator'
import { formatRelativeTime, getInitials, generateAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProspectCardProps {
  id: string
  name: string
  company: string
  avatar?: string
  confidenceScore?: number
  isVIP?: boolean
  lastActivity: string
  onClick?: (prospectId: string) => void
}

export const ProspectCard: React.FC<ProspectCardProps> = ({
  id,
  name,
  company,
  avatar,
  confidenceScore,
  isVIP,
  lastActivity,
  onClick,
}) => {
  const initials = getInitials(name)
  const avatarColor = generateAvatarColor(name)

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-md p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-300",
        "min-h-[100px] flex flex-col"
      )}
      onClick={() => onClick?.(id)}
      role="listitem"
      aria-label={`${name} from ${company}, confidence ${confidenceScore || 'unknown'}%, ${isVIP ? 'VIP account' : 'regular account'}, last activity ${lastActivity}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(id)
        }
      }}
    >
      {/* Header with avatar and VIP indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                avatarColor
              )}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {name}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {company}
            </p>
          </div>
        </div>
        
        {isVIP && (
          <VIPAccountIndicator isVIP={true} placement="icon" />
        )}
      </div>

      {/* Footer with confidence and timestamp */}
      <div className="flex items-center justify-between mt-auto">
        {confidenceScore !== undefined && (
          <ConfidenceBadge 
            score={confidenceScore} 
            size="sm" 
            showLabel={false}
          />
        )}
        <span className="text-xs text-gray-500">
          {lastActivity}
        </span>
      </div>
    </div>
  )
}





