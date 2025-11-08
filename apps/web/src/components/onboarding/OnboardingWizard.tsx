import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ProgressIndicator } from './ProgressIndicator'
import { Step1Welcome } from './Step1Welcome'
import { Step2Industry } from './Step2Industry'
import { Step3Domain } from './Step3Domain'
import { Step4Calendar } from './Step4Calendar'
import { Step5Review } from './Step5Review'
import { useOnboarding } from '@/hooks/useOnboarding'
import type { ICPConfig } from '@sales-machine/shared'

interface OnboardingData {
  goal: string | null
  industry: string | null
  domain: string
  calendar: string | null
  icpConfig?: ICPConfig
}

interface OnboardingWizardProps {
  onComplete: () => void
  initialStep?: number
}

// Map backend step to frontend step number
const stepMap: Record<string, number> = {
  goal_selection: 1,
  industry: 2,
  icp: 3,
  domain: 4,
  calendar: 5,
  complete: 6,
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, initialStep }) => {
  const { session, isLoading, saveGoal, saveIndustry, saveICP, verifyDomain, connectCalendar, completeOnboarding, refetch } = useOnboarding()
  const totalSteps = 5
  const startingStep =
    typeof initialStep === 'number' && initialStep >= 1 && initialStep <= totalSteps ? initialStep : 1
  const [currentStep, setCurrentStep] = useState(startingStep)
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    industry: null,
    domain: '',
    calendar: null,
  })

  // Initialize from session
  useEffect(() => {
    if (session) {
      // Map backend current_step to frontend step
      const backendStep = session.current_step
      const frontendStep = stepMap[backendStep] || 1
      const targetStep =
        typeof initialStep === 'number'
          ? Math.max(1, Math.min(initialStep, frontendStep, totalSteps))
          : Math.min(frontendStep, totalSteps)
      setCurrentStep(targetStep)

      // Load data from session
      setData({
        goal: session.goal_meetings_per_month || null,
        industry: session.industry || null,
        domain: '', // Domain is not stored in session, user enters it
        calendar: session.calendar_provider || null,
        icpConfig: session.icp_config || undefined,
      })
    }
  }, [session, initialStep, totalSteps])

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const calendarConnected = urlParams.get('calendar_connected')
    const error = urlParams.get('error')

    if (calendarConnected === 'true') {
      // Calendar connected successfully, refresh session
      refetch()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error) {
      console.error('Calendar connection error:', error)
      // Optionally show error toast
    }
  }, [refetch])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEdit = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleActivate = () => {
    // Show success toast
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  const handleSaveGoal = async (goal: '5-10' | '10-20' | '20-30') => {
    await saveGoal(goal)
    setData({ ...data, goal })
  }

  const handleSaveIndustry = async (industry: string) => {
    const icpSuggestions = await saveIndustry(industry)
    setData({ ...data, industry, icpConfig: icpSuggestions })
    return icpSuggestions
  }

  const handleSaveICP = async (icpConfig: ICPConfig) => {
    await saveICP(icpConfig)
    setData({ ...data, icpConfig })
  }

  const handleVerifyDomain = async (domain: string) => {
    const result = await verifyDomain(domain)
    setData({ ...data, domain })
    return result
  }

  const handleConnectCalendar = async (provider: 'google' | 'outlook') => {
    await connectCalendar(provider)
    // OAuth will redirect, so we don't update state here
  }

  const handleCompleteOnboarding = async () => {
    const result = await completeOnboarding()
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

            {/* Step Content */}
            <div className="mt-8">
              {currentStep === 1 && (
                <Step1Welcome
                  selectedGoal={data.goal}
                  onSelectGoal={(goal) => setData({ ...data, goal })}
                  onNext={handleNext}
                  onSaveGoal={handleSaveGoal}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 2 && (
                <Step2Industry
                  selectedIndustry={data.industry}
                  onSelectIndustry={(industry) => setData({ ...data, industry })}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSaveIndustry={handleSaveIndustry}
                  onSaveICP={handleSaveICP}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 3 && (
                <Step3Domain
                  domain={data.domain}
                  onDomainChange={(domain) => setData({ ...data, domain })}
                  onNext={handleNext}
                  onBack={handleBack}
                  onVerifyDomain={handleVerifyDomain}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 4 && (
                <Step4Calendar
                  connectedCalendar={data.calendar}
                  onConnectCalendar={(calendar) => setData({ ...data, calendar })}
                  onNext={handleNext}
                  onBack={handleBack}
                  onConnectCalendarOAuth={handleConnectCalendar}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 5 && (
                <Step5Review
                  data={{
                    goal: data.goal || '',
                    industry: data.industry || '',
                    domain: data.domain,
                    calendar: data.calendar || '',
                    icpConfig: data.icpConfig,
                  }}
                  onActivate={handleActivate}
                  onBack={handleBack}
                  onEdit={handleEdit}
                  onCompleteOnboarding={handleCompleteOnboarding}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}





