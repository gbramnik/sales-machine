import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step2IndustryProps {
  selectedIndustry: string | null
  onSelectIndustry: (industry: string) => void
  onNext: () => void
  onBack: () => void
}

const industries = [
  { id: 'saas', name: 'SaaS & Cloud Software', emoji: '💻' },
  { id: 'marketing', name: 'Marketing Agencies', emoji: '📊' },
  { id: 'consulting', name: 'Consulting & Professional Services', emoji: '💼' },
  { id: 'ecommerce', name: 'E-Commerce & Retail', emoji: '🛒' },
  { id: 'finance', name: 'Financial Services', emoji: '💰' },
  { id: 'healthcare', name: 'Healthcare & Medical', emoji: '🏥' },
  { id: 'realestate', name: 'Real Estate', emoji: '🏠' },
  { id: 'manufacturing', name: 'Manufacturing', emoji: '🏭' },
  { id: 'education', name: 'Education & EdTech', emoji: '🎓' },
  { id: 'hospitality', name: 'Hospitality & Tourism', emoji: '🏨' },
  { id: 'construction', name: 'Construction & Engineering', emoji: '🏗️' },
  { id: 'legal', name: 'Legal Services', emoji: '⚖️' },
  { id: 'logistics', name: 'Logistics & Transportation', emoji: '🚚' },
  { id: 'nonprofit', name: 'Non-Profit', emoji: '🤝' },
  { id: 'media', name: 'Media & Entertainment', emoji: '🎬' },
  { id: 'technology', name: 'Technology Services', emoji: '⚙️' },
  { id: 'design', name: 'Design & Creative', emoji: '🎨' },
  { id: 'hr', name: 'HR & Recruiting', emoji: '👥' },
  { id: 'insurance', name: 'Insurance', emoji: '🛡️' },
  { id: 'other', name: 'Other', emoji: '📋' },
]

export const Step2Industry: React.FC<Step2IndustryProps> = ({
  selectedIndustry,
  onSelectIndustry,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getICPRecommendations = () => {
    const recommendations: Record<string, any> = {
      saas: {
        jobTitles: 'VP of Marketing, CMO, Marketing Director',
        companySize: '50-500 employees',
        locations: 'France, Belgium, Switzerland',
      },
      marketing: {
        jobTitles: 'Founder, CEO, VP of Sales',
        companySize: '10-100 employees',
        locations: 'France, Belgium, Switzerland',
      },
    }

    return recommendations[selectedIndustry || ''] || {
      jobTitles: 'C-level, VP level',
      companySize: '50-200 employees',
      locations: 'France, Belgium, Switzerland',
    }
  }

  const recommendations = getICPRecommendations()

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredIndustries.map((industry) => {
          const isSelected = selectedIndustry === industry.id

          return (
            <button
              key={industry.id}
              onClick={() => onSelectIndustry(industry.id)}
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
              <span className="text-2xl">{industry.emoji}</span>
              <span className="text-xs font-medium text-gray-900 text-center leading-tight">
                {industry.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* ICP Preview Panel */}
      {selectedIndustry && (
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

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-primary-200 animate-slide-down">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Titles
                </label>
                <Input placeholder="VP of Marketing, CMO, Marketing Director" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>1-10 employees</option>
                  <option>10-50 employees</option>
                  <option selected>50-200 employees</option>
                  <option>200-1000 employees</option>
                  <option>1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations
                </label>
                <Input placeholder="France, Belgium, Switzerland" />
              </div>
            </div>
          )}
        </div>
      )}

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
          onClick={onNext}
          disabled={!selectedIndustry}
          size="lg"
          className="min-w-[140px]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}





