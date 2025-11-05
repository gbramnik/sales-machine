import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ProgressIndicator } from './ProgressIndicator'
import { Step1Welcome } from './Step1Welcome'
import { Step2Industry } from './Step2Industry'
import { Step3Domain } from './Step3Domain'
import { Step4Calendar } from './Step4Calendar'
import { Step5Review } from './Step5Review'

interface OnboardingData {
  goal: string | null
  industry: string | null
  domain: string
  calendar: string | null
}

interface OnboardingWizardProps {
  onComplete: () => void
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    industry: null,
    domain: '',
    calendar: null,
  })

  const totalSteps = 5

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
                />
              )}

              {currentStep === 2 && (
                <Step2Industry
                  selectedIndustry={data.industry}
                  onSelectIndustry={(industry) => setData({ ...data, industry })}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <Step3Domain
                  domain={data.domain}
                  onDomainChange={(domain) => setData({ ...data, domain })}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 4 && (
                <Step4Calendar
                  connectedCalendar={data.calendar}
                  onConnectCalendar={(calendar) => setData({ ...data, calendar })}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 5 && (
                <Step5Review
                  data={{
                    goal: data.goal || '',
                    industry: data.industry || '',
                    domain: data.domain,
                    calendar: data.calendar || '',
                  }}
                  onActivate={handleActivate}
                  onBack={handleBack}
                  onEdit={handleEdit}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}



