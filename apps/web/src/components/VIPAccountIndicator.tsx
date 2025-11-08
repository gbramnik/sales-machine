import React from 'react'
import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VIPAccountIndicatorProps {
  isVIP: boolean
  placement?: 'badge' | 'icon' | 'banner'
  reason?: string
}

export const VIPAccountIndicator: React.FC<VIPAccountIndicatorProps> = ({
  isVIP,
  placement = 'icon',
  reason = 'VIP account',
}) => {
  if (!isVIP) return null

  const getTooltipText = () => {
    return reason ? `VIP account - ${reason}` : 'VIP account'
  }

  switch (placement) {
    case 'badge':
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-vip-800 bg-vip-50 border border-vip-200 rounded-full"
          title={getTooltipText()}
          role="status"
          aria-label={getTooltipText()}
        >
          <Crown className="w-3 h-3" />
          VIP
        </span>
      )

    case 'banner':
      return (
        <div
          className="w-full bg-vip-50 border-l-4 border-vip-500 p-3"
          role="status"
          aria-label="VIP account - All messages require approval"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-vip-600" />
            <span className="text-sm font-medium text-vip-800">
              VIP Account - All messages require approval
            </span>
          </div>
        </div>
      )

    case 'icon':
    default:
      return (
        <Crown
          className="w-5 h-5 text-vip-500"
          title={getTooltipText()}
          aria-label={getTooltipText()}
        />
      )
  }
}








