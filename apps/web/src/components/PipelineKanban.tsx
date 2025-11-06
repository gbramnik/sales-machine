import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ProspectCard } from './ProspectCard'
import { cn } from '@/lib/utils'

interface ProspectCard {
  id: string
  name: string
  company: string
  avatar?: string
  confidenceScore?: number
  isVIP?: boolean
  lastActivity: string
}

interface PipelineStage {
  id: string
  label: string
  prospects: ProspectCard[]
  count: number
}

interface PipelineKanbanProps {
  stages: PipelineStage[]
  onProspectMove?: (prospectId: string, newStage: string) => void
  onProspectClick?: (prospectId: string) => void
  isDragEnabled?: boolean
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  stages,
  onProspectMove,
  onProspectClick,
  isDragEnabled = false,
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 text-gray-900">Meeting Pipeline</h2>
        <div className="flex items-center gap-3">
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            Filter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Export
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-gray-50 rounded-lg p-4 min-h-[600px] max-h-[600px] overflow-y-auto"
            role="list"
            aria-label={`${stage.label} stage with ${stage.count} prospects`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-700">
                {stage.label}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {stage.count}
              </Badge>
            </div>

            {/* Prospects List */}
            <div className="space-y-3">
              {stage.prospects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  {...prospect}
                  onClick={onProspectClick}
                />
              ))}
              
              {/* Load More Button */}
              {stage.prospects.length > 0 && (
                <button className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                  Load More
                </button>
              )}
            </div>

            {/* Empty State */}
            {stage.prospects.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-sm">No prospects</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}






