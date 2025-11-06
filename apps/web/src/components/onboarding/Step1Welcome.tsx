import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Target, Rocket, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step1WelcomeProps {
  selectedGoal: string | null
  onSelectGoal: (goal: string) => void
  onNext: () => void
  onSaveGoal: (goal: '5-10' | '10-20' | '20-30') => Promise<void>
  isLoading?: boolean
}

const goalOptions = [
  {
    id: '5-10',
    apiValue: '5-10' as const,
    icon: Target,
    title: '5-10 Meetings',
    subtitle: 'Starter',
    description: 'Perfect for solo entrepreneurs',
  },
  {
    id: '10-20',
    apiValue: '10-20' as const,
    icon: Rocket,
    title: '10-20 Meetings',
    subtitle: 'Growth',
    description: 'Small team support',
  },
  {
    id: '20-30',
    apiValue: '20-30' as const,
    icon: Zap,
    title: '20-30 Meetings',
    subtitle: 'Scale',
    description: 'Aggressive growth',
  },
]

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({
  selectedGoal,
  onSelectGoal,
  onNext,
  onSaveGoal,
  isLoading = false,
}) => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectGoal = async (goalId: string) => {
    const goalOption = goalOptions.find(g => g.id === goalId)
    if (!goalOption) return

    onSelectGoal(goalId)
    
    try {
      setIsSaving(true)
      await onSaveGoal(goalOption.apiValue)
    } catch (error) {
      console.error('Failed to save goal:', error)
      // Optionally show error toast
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (!selectedGoal) return
    
    try {
      setIsSaving(true)
      const goalOption = goalOptions.find(g => g.id === selectedGoal)
      if (goalOption) {
        await onSaveGoal(goalOption.apiValue)
      }
      onNext()
    } catch (error) {
      console.error('Failed to save goal:', error)
      // Optionally show error toast
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">
          Let's get your AI Sales Rep configured!
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          This will take about 10 minutes. We'll help you set up everything needed to start booking qualified meetings.
        </p>
      </div>

      {/* Question */}
      <div className="space-y-6">
        <h2 className="text-h3 text-gray-900 text-center">
          How many qualified meetings per month do you want to book?
        </h2>

        {/* Goal Cards */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          role="radiogroup"
          aria-label="Meeting goal selection"
        >
          {goalOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedGoal === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleSelectGoal(option.id)}
                disabled={isSaving || isLoading}
                className={cn(
                  "w-full h-[180px] rounded-lg border-2 bg-white p-6 transition-all duration-200",
                  "flex flex-col items-center justify-center gap-3",
                  "hover:shadow-md hover:border-primary-300",
                  isSelected 
                    ? "border-primary-600 bg-primary-50 shadow-md" 
                    : "border-gray-200"
                )}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectGoal(option.id)
                  }
                }}
              >
                <Icon className={cn(
                  "w-10 h-10",
                  isSelected ? "text-primary-600" : "text-gray-400"
                )} />
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {option.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-700">
                    {option.subtitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedGoal || isSaving || isLoading}
          size="lg"
          className="min-w-[140px]"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}





