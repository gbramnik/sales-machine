import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    direction: 'up' | 'down'
    value: number | string
    label?: string
  }
  icon?: React.ReactNode
  children?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  children,
}) => {
  return (
    <Card className="h-60 hover:shadow-md transition-shadow">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <div className="text-5xl font-bold text-gray-900">{value}</div>
            
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm",
                  trend.direction === 'up' ? 'text-success-600' : 'text-error-600'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {trend.direction === 'up' ? '+' : ''}
                  {trend.value} {trend.label}
                </span>
              </div>
            )}

            {subtitle && (
              <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Additional Content */}
        {children && <div className="mt-4 pt-4 border-t border-gray-200">{children}</div>}
      </CardContent>
    </Card>
  )
}







