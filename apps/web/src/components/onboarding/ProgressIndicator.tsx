import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Dots */}
      <div className="flex items-center gap-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <React.Fragment key={stepNumber}>
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  isCompleted && "bg-primary-600",
                  isCurrent && "w-3 h-3 border-2 border-primary-600 bg-white animate-pulse",
                  isUpcoming && "border-2 border-gray-300 bg-white"
                )}
                aria-label={`Step ${stepNumber}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
              />
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "w-8 h-0.5 transition-colors duration-300",
                    stepNumber < currentStep ? "bg-primary-600" : "bg-gray-300"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Label */}
      <p className="text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}





