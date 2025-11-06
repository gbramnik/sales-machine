import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Crown, CheckCircle, XCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'warning' | 'action' | 'success' | 'error'
  title: string
  description: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
}

interface AlertCenterProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
}

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning-600" />
    case 'action':
      return <Crown className="w-5 h-5 text-primary-600" />
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success-600" />
    case 'error':
      return <XCircle className="w-5 h-5 text-error-600" />
  }
}

const getAlertStyles = (type: Alert['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-warning-50 border-warning-200'
    case 'action':
      return 'bg-primary-50 border-primary-200'
    case 'success':
      return 'bg-success-50 border-success-200'
    case 'error':
      return 'bg-error-50 border-error-200'
  }
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (alerts.length === 0) return null

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <span className="font-semibold text-gray-900">
            Alerts ({alerts.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Alerts List */}
      {isExpanded && (
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-6 relative animate-fade-in',
                getAlertStyles(alert.type)
              )}
            >
              <button
                onClick={() => onDismiss(alert.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 pr-8">
                {getAlertIcon(alert.type)}
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  
                  <div className="flex items-center justify-between">
                    {alert.action && (
                      <Button
                        onClick={alert.action.onClick}
                        size="sm"
                        variant={alert.type === 'action' ? 'default' : 'outline'}
                      >
                        {alert.action.label}
                      </Button>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}





