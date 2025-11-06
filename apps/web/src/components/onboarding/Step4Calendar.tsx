import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step4CalendarProps {
  connectedCalendar: string | null
  onConnectCalendar: (provider: string) => void
  onNext: () => void
  onBack: () => void
}

const calendarProviders = [
  { id: 'google', name: 'Google Calendar', icon: '📅' },
  { id: 'outlook', name: 'Outlook Calendar', icon: '📅' },
]

export const Step4Calendar: React.FC<Step4CalendarProps> = ({
  connectedCalendar,
  onConnectCalendar,
  onNext,
  onBack,
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [availability, setAvailability] = useState({
    days: 'Mon-Fri',
    hours: '9:00 AM - 5:00 PM EST',
    duration: '30',
    buffer: '15',
  })

  const handleConnect = (provider: string) => {
    // Simulate OAuth flow
    onConnectCalendar(provider)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">
          Connect your calendar
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          Your AI Sales Rep will book meetings directly on your calendar when prospects are qualified.
        </p>
      </div>

      {!connectedCalendar ? (
        /* Calendar Provider Selection */
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id)}
                className={cn(
                  "h-32 rounded-lg border-2 border-gray-200 bg-white p-6",
                  "flex flex-col items-center justify-center gap-3",
                  "hover:shadow-md hover:border-primary-300 transition-all duration-200"
                )}
              >
                <span className="text-4xl">{provider.icon}</span>
                <span className="text-base font-medium text-gray-900">
                  {provider.name}
                </span>
                <Button size="sm" className="mt-2">
                  Connect
                </Button>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-success-50 border border-success-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Calendar Connected
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-900">
                john@acmecorp.com ({connectedCalendar === 'google' ? 'Google Calendar' : 'Outlook Calendar'})
              </p>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Available meeting slots:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{availability.days}, {availability.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{availability.duration}-minute default duration</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full"
            >
              Edit Availability Settings
            </Button>

            {showSettings && (
              <div className="space-y-4 pt-4 border-t border-gray-200 animate-slide-down">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={availability.days}
                    onChange={(e) => setAvailability({...availability, days: e.target.value})}
                  >
                    <option>Mon-Fri</option>
                    <option>Mon-Sat</option>
                    <option>Mon-Sun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Hours
                  </label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={availability.hours}
                    onChange={(e) => setAvailability({...availability, hours: e.target.value})}
                  >
                    <option>9:00 AM - 5:00 PM EST</option>
                    <option>8:00 AM - 6:00 PM EST</option>
                    <option>10:00 AM - 4:00 PM EST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Duration
                  </label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={availability.duration}
                    onChange={(e) => setAvailability({...availability, duration: e.target.value})}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Time Between Meetings
                  </label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={availability.buffer}
                    onChange={(e) => setAvailability({...availability, buffer: e.target.value})}
                  >
                    <option value="0">No buffer</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!connectedCalendar}
          size="lg"
          className="min-w-[140px]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}





