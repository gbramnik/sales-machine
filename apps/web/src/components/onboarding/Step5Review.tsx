import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Target, Users, Mail, Calendar, CheckCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step5ReviewProps {
  data: {
    goal: string
    industry: string
    domain: string
    calendar: string
  }
  onActivate: () => void
  onBack: () => void
  onEdit: (step: number) => void
}

const goalLabels: Record<string, string> = {
  starter: '5-10 qualified meetings/month',
  growth: '10-20 qualified meetings/month',
  scale: '20-30 qualified meetings/month',
}

const industryLabels: Record<string, string> = {
  saas: 'SaaS & Cloud Software',
  marketing: 'Marketing Agencies',
  consulting: 'Consulting & Professional Services',
  // Add more as needed
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  data,
  onActivate,
  onBack,
  onEdit,
}) => {
  const [isActivating, setIsActivating] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)
    
    // Simulate activation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onActivate()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">
          You're all set! 🎉
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          Review your configuration below. Your AI Sales Rep is ready to start prospecting as soon as you activate.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your AI Sales Rep Configuration
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Goal */}
            <div className="flex items-start gap-4">
              <Target className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Goal</h4>
                <p className="text-gray-700">{goalLabels[data.goal] || data.goal}</p>
              </div>
              <button
                onClick={() => onEdit(1)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>

            {/* Target Audience */}
            <div className="flex items-start gap-4 pt-6 border-t border-gray-200">
              <Users className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Target Audience</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Industry:</span> <span className="text-gray-900">{industryLabels[data.industry] || data.industry}</span></p>
                  <p><span className="text-gray-600">Job Titles:</span> <span className="text-gray-900">VP Marketing, CMO, Marketing Director</span></p>
                  <p><span className="text-gray-600">Company Size:</span> <span className="text-gray-900">50-500 employees</span></p>
                  <p><span className="text-gray-600">Locations:</span> <span className="text-gray-900">France, Belgium, Switzerland</span></p>
                </div>
              </div>
              <button
                onClick={() => onEdit(2)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>

            {/* Email Domain */}
            <div className="flex items-start gap-4 pt-6 border-t border-gray-200">
              <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Email Domain</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900">{data.domain}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-success-600">Verified</span>
                    <span className="text-gray-500">(Warm-up: 14 days remaining)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onEdit(3)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>

            {/* Calendar */}
            <div className="flex items-start gap-4 pt-6 border-t border-gray-200">
              <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Calendar</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900">john@acmecorp.com ({data.calendar === 'google' ? 'Google' : 'Outlook'})</p>
                  <p className="text-gray-700">Availability: Mon-Fri 9AM-5PM</p>
                </div>
              </div>
              <button
                onClick={() => onEdit(4)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Your AI Sales Rep will:
            </h3>
          </div>
          
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">1.</span>
              <span>Find 50-100 prospects matching your ICP daily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">2.</span>
              <span>Research and personalize outreach for each prospect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">3.</span>
              <span>Send emails (max 20/day during warm-up)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">4.</span>
              <span>Respond to replies and qualify leads 24/7</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">5.</span>
              <span>Book meetings automatically when prospects qualify</span>
            </li>
          </ol>

          <div className="pt-4 border-t border-primary-200 space-y-2">
            <p className="text-sm font-medium text-gray-900">You'll be notified for:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• VIP accounts requiring approval</li>
              <li>• Low-confidence messages needing review</li>
              <li>• Meetings booked</li>
              <li>• Deliverability alerts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Activation Section */}
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            onClick={handleActivate}
            disabled={!agreedToTerms || isActivating}
            size="lg"
            className="w-full h-14 text-lg"
          >
            {isActivating ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Activating...
              </span>
            ) : (
              'Activate My AI Sales Rep'
            )}
          </Button>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
        >
          Back
        </Button>
      </div>
    </div>
  )
}





