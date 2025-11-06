import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MessageReviewCard } from '../MessageReviewCard'
import { EnrichmentContextPanel } from './EnrichmentContextPanel'
import { CheckCircle, Crown, Filter, ChevronLeft, ChevronRight, Search, X, CheckSquare, Square } from 'lucide-react'
import { useReviewQueue, type ReviewQueueItem } from '@/hooks/useReviewQueue'
import { useReviewActions } from '@/hooks/useReviewActions'

interface Message {
  id: string
  prospect: {
    id: string
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
  channel: 'linkedin' | 'email'
}

// Transform API review item to Message format
const transformReviewToMessage = (review: ReviewQueueItem): Message => {
  return {
    id: review.id,
    prospect: {
      id: review.prospect.id,
      name: review.prospect.full_name,
      company: review.prospect.company_name || '',
      title: review.prospect.job_title || '',
      linkedinUrl: undefined,
    },
    message: {
      id: review.id,
      content: review.proposed_message,
      confidence: review.ai_confidence_score,
      generatedAt: new Date(review.created_at),
    },
    context: {
      talkingPoints: [],
      recentActivity: '',
      conversationHistory: undefined,
    },
    isVIP: review.prospect.is_vip || false,
    flagReason: review.prospect.is_vip ? 'vip' : 'low-confidence',
    channel: review.channel,
  };
};

export const ReviewQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vip' | 'low-confidence'>('low-confidence')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Map tab to filter
  const filter = activeTab === 'vip' ? 'vip' : 'low_confidence';
  const { reviews, isLoading, error, vipCount, lowConfidenceCount, refetch } = useReviewQueue(filter);
  const { approveMessage, editMessage, rejectMessage, bulkApprove, bulkReject, isLoading: actionsLoading } = useReviewActions();

  // Transform reviews to messages format
  const messages = useMemo(() => reviews.map(transformReviewToMessage), [reviews]);

  // Filter messages based on search and filters
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.prospect.name.toLowerCase().includes(query) ||
          msg.prospect.company.toLowerCase().includes(query)
      );
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      filtered = filtered.filter((msg) => {
        const score = msg.message.confidence;
        switch (confidenceFilter) {
          case '<60':
            return score < 60;
          case '60-75':
            return score >= 60 && score < 75;
          case '75-80':
            return score >= 75 && score < 80;
          case '>80':
            return score > 80;
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((msg) => {
        const msgDate = msg.message.generatedAt;
        switch (dateFilter) {
          case 'today':
            return msgDate.toDateString() === now.toDateString();
          case 'last_7_days':
            return (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
          case 'last_30_days':
            return (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
          default:
            return true;
        }
      });
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter((msg) => msg.channel === channelFilter);
    }

    return filtered;
  }, [messages, searchQuery, confidenceFilter, dateFilter, channelFilter]);

  const currentMessage = filteredMessages[currentIndex];

  // Update selectedIds when messages change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [messages]);

  // Show bulk actions if any items are selected
  useEffect(() => {
    setShowBulkActions(selectedIds.size > 0);
  }, [selectedIds.size]);

  const handleApprove = async (messageId: string) => {
    try {
      await approveMessage(messageId);
      await refetch();
      showNextMessage();
    } catch (err) {
      console.error('Failed to approve message:', err);
    }
  };

  const handleEdit = async (messageId: string, newContent: string, newSubject?: string) => {
    try {
      await editMessage(messageId, newContent, newSubject);
      await refetch();
      showNextMessage();
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleReject = async (messageId: string, reason?: string) => {
    try {
      await rejectMessage(messageId, reason);
      await refetch();
      showNextMessage();
    } catch (err) {
      console.error('Failed to reject message:', err);
    }
  };

  const showNextMessage = () => {
    if (currentIndex >= filteredMessages.length - 1) {
      setCurrentIndex(Math.max(0, filteredMessages.length - 2));
    }
  }

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredMessages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, filteredMessages.length]);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    const toApprove = Array.from(selectedIds).filter((id) => {
      const msg = filteredMessages.find((m) => m.id === id);
      return msg && msg.message.confidence > 75;
    });

    if (toApprove.length === 0) {
      alert('No messages with confidence >75% selected');
      return;
    }

    if (!confirm(`Approve ${toApprove.length} messages with confidence >75%?`)) {
      return;
    }

    try {
      await bulkApprove(toApprove);
      await refetch();
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to bulk approve:', err);
    }
  };

  const handleBulkReject = async () => {
    const toReject = Array.from(selectedIds).filter((id) => {
      const msg = filteredMessages.find((m) => m.id === id);
      return msg && msg.message.confidence < 60;
    });

    if (toReject.length === 0) {
      alert('No messages with confidence <60% selected');
      return;
    }

    if (!confirm(`Reject ${toReject.length} messages with confidence <60%?`)) {
      return;
    }

    try {
      await bulkReject(toReject);
      await refetch();
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to bulk reject:', err);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          e.preventDefault();
          handleNext();
          break;
        case 'k':
        case 'arrowup':
          e.preventDefault();
          handlePrevious();
          break;
        case 'tab':
          e.preventDefault();
          setActiveTab(activeTab === 'vip' ? 'low-confidence' : 'vip');
          setCurrentIndex(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab, currentIndex, filteredMessages.length, handleNext, handlePrevious]);

  // Reset index when switching tabs or filters
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab, searchQuery, confidenceFilter, dateFilter, channelFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-h1 text-gray-900">AI Message Review Queue</h1>
              <p className="text-body text-gray-600 mt-2">
                {isLoading ? 'Loading...' : `${filteredMessages.length} messages awaiting review`}
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
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by prospect name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Confidence Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Score
                  </label>
                  <select
                    value={confidenceFilter}
                    onChange={(e) => setConfidenceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All</option>
                    <option value="<60">&lt;60%</option>
                    <option value="60-75">60-75%</option>
                    <option value="75-80">75-80%</option>
                    <option value=">80">&gt;80%</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Added
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="last_7_days">Last 7 days</option>
                    <option value="last_30_days">Last 30 days</option>
                  </select>
                </div>

                {/* Channel Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel
                  </label>
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Toolbar */}
          {showBulkActions && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    onClick={handleBulkApprove}
                    disabled={actionsLoading}
                    variant="default"
                    size="sm"
                    className="bg-success-600 hover:bg-success-700"
                  >
                    Approve Selected (&gt;75%)
                  </Button>
                  <Button
                    onClick={handleBulkReject}
                    disabled={actionsLoading}
                    variant="destructive"
                    size="sm"
                  >
                    Reject Selected (&lt;60%)
                  </Button>
                </div>
                <Button
                  onClick={() => setSelectedIds(new Set())}
                  variant="ghost"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
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
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : vipCount === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No VIP messages awaiting review
                </h3>
                <p className="text-gray-600">
                  All high-value account messages have been approved or are pending send.
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">No messages match your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bulk Selection Checkbox */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    {selectedIds.size === filteredMessages.length ? (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span>Select all ({filteredMessages.length})</span>
                  </button>
                </div>

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

                {/* Message Review with Enrichment Panel */}
                {currentMessage && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Message Card (2/3 width) */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleToggleSelect(currentMessage.id)}
                          className="flex items-center"
                        >
                          {selectedIds.has(currentMessage.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <span className="text-sm text-gray-600">Select for bulk action</span>
                      </div>
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
                    </div>

                    {/* Enrichment Context Panel (1/3 width) */}
                    <div className="lg:col-span-1">
                      <EnrichmentContextPanel
                        prospectId={currentMessage.prospect.id}
                        aiMessage={currentMessage.message.content}
                        defaultExpanded={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="low-confidence">
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : lowConfidenceCount === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-success-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All messages meet confidence threshold
                </h3>
                <p className="text-gray-600">
                  Your AI Sales Rep is performing well! No manual reviews needed.
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">No messages match your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bulk Selection Checkbox */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    {selectedIds.size === filteredMessages.length ? (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span>Select all ({filteredMessages.length})</span>
                  </button>
                </div>

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

                {/* Message Review with Enrichment Panel */}
                {currentMessage && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Message Card (2/3 width) */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleToggleSelect(currentMessage.id)}
                          className="flex items-center"
                        >
                          {selectedIds.has(currentMessage.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <span className="text-sm text-gray-600">Select for bulk action</span>
                      </div>
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
                    </div>

                    {/* Enrichment Context Panel (1/3 width) */}
                    <div className="lg:col-span-1">
                      <EnrichmentContextPanel
                        prospectId={currentMessage.prospect.id}
                        aiMessage={currentMessage.message.content}
                        defaultExpanded={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
