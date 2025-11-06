import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MessageReviewCard } from '../MessageReviewCard'
import { CheckCircle, Crown, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  prospect: {
    name: string
    company: string
    title: string
    location?: string
    linkedinUrl?: string
  }
  message: {
    id: string
    content: string
    confidence: number
    generatedAt: Date
  }
  context: {
    talkingPoints: string[]
    recentActivity: string
    conversationHistory?: string
  }
  isVIP: boolean
  flagReason: 'vip' | 'low-confidence'
}

const mockMessages: Message[] = [
  {
    id: '1',
    prospect: {
      name: 'Sarah Chen',
      company: 'FinTech Solutions',
      title: 'VP of Marketing',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
    },
    message: {
      id: 'msg-1',
      content: `Hi Sarah,

I noticed your team just brought on two new SDRs—congratulations! Scaling outreach is exciting but challenging.

Many marketing leaders we work with hit a wall when trying to scale their sales development efforts. The common pain points are:

• Lead quality inconsistency
• Time-consuming prospect research
• Follow-up sequence management
• Meeting booking coordination

I'd love to share how we've helped similar companies automate their prospecting while maintaining personalization. Would you be open to a 15-minute conversation this week?

Best regards,
John`,
      confidence: 87,
      generatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    context: {
      talkingPoints: [
        'Recent hire: 2 SDRs (LinkedIn Jobs)',
        'Pain point: Lead gen scaling challenges',
        'Engaged with post about sales automation (3 days ago)',
      ],
      recentActivity: 'Posted about challenges onboarding new sales team members (Oct 2)',
    },
    isVIP: true,
    flagReason: 'vip',
  },
  {
    id: '2',
    prospect: {
      name: 'Michael Rodriguez',
      company: 'TechStart Inc',
      title: 'CEO',
      location: 'New York, NY',
      linkedinUrl: 'https://linkedin.com/in/mrodriguez',
    },
    message: {
      id: 'msg-2',
      content: `Hi Michael,

Saw your recent funding announcement—exciting times! Growing from 10 to 50 people in Q1 is impressive.

As you scale, one challenge many CEOs face is keeping the sales pipeline full while building out the team. We've helped companies at your stage maintain momentum during rapid growth.

Would love to share some insights on how to scale outreach without sacrificing quality. Open to a quick call?

Cheers,
John`,
      confidence: 91,
      generatedAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    context: {
      talkingPoints: [
        'Recent Series A funding ($5M)',
        'Hiring: 40 new positions (LinkedIn)',
        'Pain point: Scaling sales operations',
      ],
      recentActivity: 'Announced Series A funding and hiring plans (5 days ago)',
    },
    isVIP: true,
    flagReason: 'vip',
  },
  {
    id: '3',
    prospect: {
      name: 'Emily Watson',
      company: 'Growth Partners',
      title: 'Head of Sales',
      location: 'Boston, MA',
    },
    message: {
      id: 'msg-3',
      content: `Hi Emily,

I noticed you're hiring for 3 SDR positions. That's great news for Growth Partners!

One pattern I see with growing sales teams is the challenge of maintaining consistent outreach quality as you scale. Many heads of sales tell me they spend too much time reviewing emails and managing sequences.

Would you be interested in exploring how automation can help your new SDRs ramp faster?

Best,
John`,
      confidence: 73,
      generatedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    context: {
      talkingPoints: [
        'Hiring: 3 SDR positions (LinkedIn)',
        'Company growth: 25% YoY',
        'Recent post about sales team challenges',
      ],
      recentActivity: 'Posted about SDR onboarding challenges (1 week ago)',
    },
    isVIP: false,
    flagReason: 'low-confidence',
  },
]

export const ReviewQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vip' | 'low-confidence'>('vip')
  const [messages, setMessages] = useState(mockMessages)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filter messages by tab
  const filteredMessages = messages.filter((msg) => msg.flagReason === activeTab)
  const currentMessage = filteredMessages[currentIndex]

  // Get counts for badges
  const vipCount = messages.filter((msg) => msg.flagReason === 'vip').length
  const lowConfidenceCount = messages.filter((msg) => msg.flagReason === 'low-confidence').length

  const handleApprove = (messageId: string) => {
    console.log('Approved:', messageId)
    removeMessage(messageId)
    showNextMessage()
  }

  const handleEdit = (messageId: string, newContent: string) => {
    console.log('Edited:', messageId, newContent)
    removeMessage(messageId)
    showNextMessage()
  }

  const handleReject = (messageId: string, reason?: string) => {
    console.log('Rejected:', messageId, reason)
    removeMessage(messageId)
    showNextMessage()
  }

  const removeMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.message.id !== messageId))
  }

  const showNextMessage = () => {
    // Move to next message or stay at current if it's the last
    if (currentIndex >= filteredMessages.length - 1) {
      setCurrentIndex(Math.max(0, filteredMessages.length - 2))
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredMessages.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          e.preventDefault()
          handleNext()
          break
        case 'k':
        case 'arrowup':
          e.preventDefault()
          handlePrevious()
          break
        case 'tab':
          e.preventDefault()
          setActiveTab(activeTab === 'vip' ? 'low-confidence' : 'vip')
          setCurrentIndex(0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [activeTab, currentIndex, filteredMessages.length])

  // Reset index when switching tabs
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1 text-gray-900">AI Message Review Queue</h1>
              <p className="text-body text-gray-600 mt-2">
                {messages.length} messages awaiting review
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <div className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">?</kbd> for shortcuts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vip' | 'low-confidence')}>
          <TabsList className="mb-6">
            <TabsTrigger value="vip" badge={vipCount}>
              <Crown className="w-4 h-4 mr-2" />
              VIP Accounts
            </TabsTrigger>
            <TabsTrigger value="low-confidence" badge={lowConfidenceCount}>
              Low Confidence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vip">
            {vipCount === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No VIP messages awaiting review
                </h3>
                <p className="text-gray-600">
                  All high-value account messages have been approved or are pending send.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Navigation */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Message {currentIndex + 1} of {filteredMessages.length}
                    </span>
                    <Button
                      onClick={handleNext}
                      disabled={currentIndex >= filteredMessages.length - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Use <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">J</kbd> / <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">K</kbd> to navigate
                  </div>
                </div>

                {/* Message Review */}
                {currentMessage && (
                  <MessageReviewCard
                    key={currentMessage.id}
                    prospect={currentMessage.prospect}
                    message={currentMessage.message}
                    context={currentMessage.context}
                    onApprove={handleApprove}
                    onEdit={handleEdit}
                    onReject={handleReject}
                    isVIP={currentMessage.isVIP}
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="low-confidence">
            {lowConfidenceCount === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-success-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All messages meet confidence threshold
                </h3>
                <p className="text-gray-600">
                  Your AI Sales Rep is performing well! No manual reviews needed.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Navigation */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Message {currentIndex + 1} of {filteredMessages.length}
                    </span>
                    <Button
                      onClick={handleNext}
                      disabled={currentIndex >= filteredMessages.length - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Use <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">J</kbd> / <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">K</kbd> to navigate
                  </div>
                </div>

                {/* Message Review */}
                {currentMessage && (
                  <MessageReviewCard
                    key={currentMessage.id}
                    prospect={currentMessage.prospect}
                    message={currentMessage.message}
                    context={currentMessage.context}
                    onApprove={handleApprove}
                    onEdit={handleEdit}
                    onReject={handleReject}
                    isVIP={currentMessage.isVIP}
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}





