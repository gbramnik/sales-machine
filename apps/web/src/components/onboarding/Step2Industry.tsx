import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingIndustries } from '@/hooks/useOnboardingIndustries'
import { useOnboardingICP } from '@/hooks/useOnboardingICP'
import type { ICPConfig } from '@sales-machine/shared'

interface Step2IndustryProps {
  selectedIndustry: string | null
  onSelectIndustry: (industry: string) => void
  onNext: () => void
  onBack: () => void
  onSaveIndustry: (industry: string) => Promise<any>
  onSaveICP?: (icpConfig: ICPConfig) => Promise<void>
  isLoading?: boolean
}

export const Step2Industry: React.FC<Step2IndustryProps> = ({
  selectedIndustry,
  onSelectIndustry,
  onNext,
  onBack,
  onSaveIndustry,
  onSaveICP,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [icpConfig, setIcpConfig] = useState<ICPConfig | null>(null)
  const [editedICP, setEditedICP] = useState<ICPConfig | null>(null)

  const { industries, isLoading: industriesLoading } = useOnboardingIndustries()
  const { suggestions, isLoading: suggestionsLoading } = useOnboardingICP(selectedIndustry || undefined)

  useEffect(() => {
    if (suggestions) {
      setIcpConfig(suggestions)
      setEditedICP(suggestions)
    }
  }, [suggestions])

  const filteredIndustries = industries.filter((industry) =>
    industry.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectIndustry = async (industry: string) => {
    onSelectIndustry(industry)
    
    try {
      setIsSaving(true)
      const icpSuggestions = await onSaveIndustry(industry)
      if (icpSuggestions) {
        setIcpConfig(icpSuggestions)
        setEditedICP(icpSuggestions)
      }
    } catch (error) {
      console.error('Failed to save industry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (!selectedIndustry) return
    
    try {
      setIsSaving(true)
      // Save ICP config if edited
      if (onSaveICP && editedICP) {
        await onSaveICP(editedICP)
      }
      onNext()
    } catch (error) {
      console.error('Failed to save ICP config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const recommendations = editedICP ? {
    jobTitles: editedICP.job_titles?.join(', ') || 'Not specified',
    companySize: editedICP.company_sizes?.join(', ') || 'Not specified',
    locations: editedICP.locations?.join(', ') || 'Not specified',
  } : {
    jobTitles: 'Loading...',
    companySize: 'Loading...',
    locations: 'Loading...',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">
          Who are you trying to reach?
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about your ideal customer so we can configure the right targeting and messaging.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Industry Grid */}
      {industriesLoading ? (
        <div className="text-center text-gray-500 py-8">Loading industries...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredIndustries.map((industry) => {
            const isSelected = selectedIndustry === industry

            return (
              <button
                key={industry}
                onClick={() => handleSelectIndustry(industry)}
                disabled={isSaving || isLoading}
                className={cn(
                "relative h-24 rounded-lg border-2 bg-white p-3 transition-all duration-200",
                "flex flex-col items-center justify-center gap-2",
                "hover:shadow-md hover:scale-105",
                isSelected 
                  ? "border-primary-600 bg-primary-50 shadow-md" 
                  : "border-gray-200"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xs font-medium text-gray-900 text-center leading-tight">
                {industry}
              </span>
            </button>
          )
        })}
      </div>
      )}

      {/* ICP Preview Panel */}
      {selectedIndustry && (suggestionsLoading ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center text-gray-500">
          Loading ICP suggestions...
        </div>
      ) : editedICP ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900">
            Based on your selection, we recommend targeting:
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Job Titles:</span> {recommendations.jobTitles}</p>
            <p><span className="font-medium text-gray-700">Company Size:</span> {recommendations.companySize}</p>
            <p><span className="font-medium text-gray-700">Location:</span> {recommendations.locations}</p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Edit Recommendations'}
          </button>

          {showAdvanced && editedICP && (
            <div className="space-y-4 pt-4 border-t border-primary-200 animate-slide-down">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Titles (comma-separated)
                </label>
                <Input 
                  placeholder="VP of Marketing, CMO, Marketing Director" 
                  value={editedICP.job_titles?.join(', ') || ''}
                  onChange={(e) => setEditedICP({
                    ...editedICP,
                    job_titles: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select 
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editedICP.company_sizes?.[0] || ''}
                  onChange={(e) => setEditedICP({
                    ...editedICP,
                    company_sizes: e.target.value ? [e.target.value] : [],
                  })}
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations (comma-separated)
                </label>
                <Input 
                  placeholder="France, Belgium, Switzerland" 
                  value={editedICP.locations?.join(', ') || ''}
                  onChange={(e) => setEditedICP({
                    ...editedICP,
                    locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                />
              </div>
            </div>
          )}
        </div>
      ) : null)}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedIndustry || isSaving || isLoading}
          size="lg"
          className="min-w-[140px]"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}





