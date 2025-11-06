import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfidenceBadge } from './ConfidenceBadge'
import { VIPAccountIndicator } from './VIPAccountIndicator'
import { CheckCircle, Edit3, XCircle, MapPin, ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageReviewCardProps {
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
  onApprove: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onReject: (messageId: string, reason?: string) => void
  isVIP?: boolean
}

export const MessageReviewCard: React.FC<MessageReviewCardProps> = ({
  prospect,
  message,
  context,
  onApprove,
  onEdit,
  onReject,
  isVIP = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onEdit(message.id, editedContent)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedContent(message.content)
    setIsEditing(false)
  }

  const handleReject = () => {
    onReject(message.id, rejectReason)
    setShowRejectDialog(false)
    setRejectReason('')
  }

  const getFlagReason = () => {
    if (isVIP) return 'VIP Account (C-level)'
    if (message.confidence < 80) return `Confidence score below threshold (${message.confidence}% < 80%)`
    return 'Manual review required'
  }

  const getFlagBackground = () => {
    if (isVIP) return 'bg-warning-50 border-warning-400'
    return 'bg-primary-50 border-primary-400'
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h2 text-gray-900 mb-2">AI Message Review Queue</h1>
        <p className="text-gray-600">8 messages awaiting review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Message Content (60%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Message Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                To: {prospect.name}
              </h3>
              {isVIP && <VIPAccountIndicator isVIP={true} placement="icon" />}
            </div>
            <p className="text-gray-600">{prospect.company}</p>
            <p className="text-sm text-gray-500">sarah.chen@fintech.com</p>
            <p className="text-gray-700 font-medium">
              Subject: Your team's recent hires
            </p>
          </div>

          {/* Message Body */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-5">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[300px] p-4 border border-primary-300 rounded-md resize-y focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Edit the message content..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Character count: {editedContent.length} / 500
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Save & Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <blockquote 
                className="text-gray-800 leading-relaxed"
                aria-label="AI-generated message"
              >
                {message.content}
              </blockquote>
            )}
          </div>

          {/* Message Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ConfidenceBadge 
                score={message.confidence} 
                size="sm" 
                showLabel={true}
              />
              <span className="text-sm text-gray-500">
                Generated: {formatRelativeTime(message.generatedAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex gap-3">
              <Button 
                onClick={() => onApprove(message.id)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowRejectDialog(true)}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Context Information (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prospect Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-700">
                  {prospect.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {prospect.name}
                </h4>
                <p className="text-gray-600">{prospect.title}</p>
                <p className="text-gray-600">{prospect.company}</p>
              </div>
            </div>
            
            {prospect.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {prospect.location}
              </div>
            )}
            
            {prospect.linkedinUrl && (
              <a
                href={prospect.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn Profile
              </a>
            )}
          </div>

          {/* Talking Points */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Talking Points:</h5>
            <ul className="space-y-1">
              {context.talkingPoints.map((point, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Recent Activity:</h5>
            <p className="text-sm text-gray-600">{context.recentActivity}</p>
          </div>

          {/* Conversation History */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Conversation History:</h5>
            <p className="text-sm text-gray-600">
              {context.conversationHistory || '(None - first contact)'}
            </p>
          </div>

          {/* Why Flagged */}
          <div className={cn(
            "p-3 rounded-md border-l-4",
            getFlagBackground()
          )}>
            <h5 className="text-sm font-semibold text-gray-700 mb-1">Why Flagged:</h5>
            <p className="text-sm text-gray-600">{getFlagReason()}</p>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Message?</h3>
            <p className="text-gray-600 mb-4">
              This message will not be sent to {prospect.name}.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Why are you rejecting this message?"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                >
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





