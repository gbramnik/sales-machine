import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface EnrichmentData {
  talking_points?: string[] | null;
  recent_activity?: string | null;
  company_insights?: string | null;
  company_data?: any;
}

interface EnrichmentContextPanelProps {
  prospectId: string;
  aiMessage: string;
  defaultExpanded?: boolean;
}

export const EnrichmentContextPanel: React.FC<EnrichmentContextPanelProps> = ({
  prospectId,
  aiMessage,
  defaultExpanded = true,
}) => {
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEnrichment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch prospect with enrichment data
        const response = await apiClient.getProspect(prospectId);
        if (response.success && response.data) {
          const enrichmentData = (response.data as any).enrichment;
          setEnrichment(enrichmentData || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch enrichment data'));
        console.error('Error fetching enrichment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (prospectId) {
      fetchEnrichment();
    }
  }, [prospectId]);

  // Check if AI message references enrichment data
  const checkValidation = () => {
    if (!enrichment || !aiMessage) return { isValid: false, hasWarnings: false, isIncomplete: false };

    const messageLower = aiMessage.toLowerCase();
    const talkingPoints = enrichment.talking_points || [];
    const hasReferences = talkingPoints.some((point) =>
      messageLower.includes(point.toLowerCase().substring(0, 20))
    );

    const hasWarnings = false; // Could check for unverified claims
    const isIncomplete = !enrichment.talking_points || enrichment.talking_points.length === 0;

    return {
      isValid: hasReferences,
      hasWarnings,
      isIncomplete,
    };
  };

  const validation = checkValidation();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !enrichment) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">Enrichment data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Enrichment Context</span>
          {validation.isValid && (
            <CheckCircle className="w-4 h-4 text-success-500" title="Message references enrichment data" />
          )}
          {validation.hasWarnings && (
            <AlertTriangle className="w-4 h-4 text-warning-500" title="Unverified claims detected" />
          )}
          {validation.isIncomplete && (
            <Info className="w-4 h-4 text-gray-400" title="Enrichment data incomplete" />
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          {/* Talking Points */}
          {enrichment.talking_points && enrichment.talking_points.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-700">Talking Points:</h5>
              <ul className="space-y-1">
                {enrichment.talking_points.map((point, index) => {
                  const isReferenced = aiMessage.toLowerCase().includes(point.toLowerCase().substring(0, 20));
                  return (
                    <li
                      key={index}
                      className={cn(
                        'text-sm flex items-start gap-2',
                        isReferenced ? 'text-success-700 font-medium' : 'text-gray-600'
                      )}
                    >
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{point}</span>
                      {isReferenced && (
                        <CheckCircle className="w-3 h-3 text-success-500 mt-1 flex-shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Recent Activity */}
          {enrichment.recent_activity && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-700">Recent Activity:</h5>
              <p className="text-sm text-gray-600">{enrichment.recent_activity}</p>
            </div>
          )}

          {/* Company Insights */}
          {enrichment.company_insights && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-700">Company Insights:</h5>
              <p className="text-sm text-gray-600">{enrichment.company_insights}</p>
            </div>
          )}

          {/* Empty State */}
          {!enrichment.talking_points?.length && !enrichment.recent_activity && !enrichment.company_insights && (
            <p className="text-sm text-gray-500">No enrichment data available</p>
          )}
        </div>
      )}
    </div>
  );
};



