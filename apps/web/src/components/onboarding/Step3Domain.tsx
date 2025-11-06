import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Copy, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step3DomainProps {
  domain: string
  onDomainChange: (domain: string) => void
  onNext: () => void
  onBack: () => void
}

interface DNSRecord {
  type: string
  status: 'verified' | 'failed' | 'pending'
  name: string
}

export const Step3Domain: React.FC<Step3DomainProps> = ({
  domain,
  onDomainChange,
  onNext,
  onBack,
}) => {
  const [isChecking, setIsChecking] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([])

  const handleCheckDNS = async () => {
    setIsChecking(true)
    
    // Simulate DNS check
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDnsRecords([
      { type: 'SPF Record', status: 'verified', name: 'spf' },
      { type: 'DKIM Record', status: 'verified', name: 'dkim' },
      { type: 'DMARC Record', status: 'failed', name: 'dmarc' },
    ])
    
    setIsChecking(false)
    setHasChecked(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const allVerified = dnsRecords.every(record => record.status === 'verified')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 text-gray-900">
          Verify your sending domain
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          To ensure high email deliverability, we need to verify your domain is properly configured.
        </p>
      </div>

      {/* Domain Input */}
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your sending email domain
          </label>
          <Input
            type="text"
            placeholder="yourdomain.com"
            value={domain}
            onChange={(e) => onDomainChange(e.target.value)}
            className="text-lg"
          />
        </div>

        <Button
          onClick={handleCheckDNS}
          disabled={!domain || isChecking}
          className="w-full"
          size="lg"
        >
          {isChecking ? 'Checking DNS Records...' : 'Check DNS Records'}
        </Button>
      </div>

      {/* DNS Records Status */}
      {hasChecked && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              DNS Records Status
            </h3>
            
            <div className="space-y-3">
              {dnsRecords.map((record) => (
                <div
                  key={record.type}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {record.status === 'verified' ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-500" />
                    )}
                    <span className="font-medium text-gray-900">{record.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        record.status === 'verified' ? "text-success-600" : "text-error-600"
                      )}
                    >
                      {record.status === 'verified' ? 'Verified' : 'Not Found'}
                    </span>
                    {record.status === 'failed' && (
                      <button
                        onClick={() => setShowInstructions(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        Fix this
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!allVerified && (
              <Button
                variant="outline"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full"
              >
                {showInstructions ? 'Hide' : 'Show'} Setup Instructions
              </Button>
            )}
          </div>

          {/* Setup Instructions */}
          {showInstructions && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 space-y-4 animate-slide-down">
              <div className="flex items-start gap-3">
                <Copy className="w-5 h-5 text-warning-600 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Add this DMARC record to your DNS:
                  </h4>
                  
                  <div className="bg-white border border-warning-300 rounded-md p-4 space-y-2 text-sm font-mono">
                    <div><span className="text-gray-600">Type:</span> <span className="text-gray-900">TXT</span></div>
                    <div><span className="text-gray-600">Name:</span> <span className="text-gray-900">_dmarc</span></div>
                    <div><span className="text-gray-600">Value:</span> <span className="text-gray-900">v=DMARC1; p=quarantine; rua=mailto:dmarc@{domain}</span></div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </Button>

                  <p className="text-sm text-gray-600">
                    Need help? <a href="#" className="text-primary-600 hover:text-primary-700 underline">Watch Video Tutorial</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warm-Up Notice */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-gray-900">
                  Domain Warm-Up Required
                </h4>
                <p className="text-sm text-gray-600">
                  New domains need 14-21 days of warm-up before full campaign volume. Your AI Sales Rep will gradually increase sending to protect your reputation.
                </p>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium text-gray-700">Start Date:</span> Oct 5, 2025</p>
                  <p><span className="font-medium text-gray-700">Full Volume:</span> Oct 19-26, 2025</p>
                </div>
              </div>
            </div>
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
        <div className="flex gap-3">
          {hasChecked && !allVerified && (
            <Button
              onClick={onNext}
              variant="outline"
              size="lg"
            >
              Skip for Now
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!hasChecked || (!allVerified && !hasChecked)}
            size="lg"
            className="min-w-[140px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}





