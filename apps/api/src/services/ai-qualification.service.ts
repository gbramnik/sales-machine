import { ApiError, ErrorCode } from '../types';

/**
 * AI Qualification Service
 * 
 * Handles Claude API calls for prospect qualification using BANT framework.
 * Returns structured qualification results with confidence scores.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const getClaudeApiKey = () => process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const getClaudeModel = () => process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

// Types
export interface QualificationContext {
  prospect: {
    name: string;
    company: string | null;
    job_title: string | null;
    email?: string;
    linkedin_url?: string;
  };
  enrichment?: {
    talking_points: string[];
    pain_points: string[];
    company_insights: string | null;
    recent_activity?: string | null;
  };
  thread_history: Array<{
    direction: 'inbound' | 'outbound';
    channel: 'email' | 'linkedin';
    message_text: string;
    generated_by_ai: boolean;
    ai_confidence_score?: number | null;
    sentiment?: string | null;
    created_at: string;
  }>;
  reply_text: string;
  channel: 'email' | 'linkedin';
  sentiment: 'positive' | 'neutral' | 'negative';
}

export type PromptingStrategy = 'strategy_1' | 'strategy_2' | 'strategy_3' | 'strategy_4' | 'strategy_5' | null;

export interface QualificationResult {
  qualification_status: 'qualified' | 'not_qualified' | 'needs_more_info';
  proposed_response_template_id: string;
  proposed_channel: 'linkedin' | 'email';
  confidence_score: number; // 0-100
  confidence_reasoning?: string; // Optional for backward compatibility
  reasoning: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AIQualificationService {
  /**
   * Qualify a prospect based on their reply using Claude API
   * 
   * @param context - Prospect context including reply, enrichment, and thread history
   * @param strategy - Optional prompting strategy for humanness testing
   * @returns Qualification result with status, template ID, channel, confidence, and reasoning
   */
  async qualifyProspect(
    context: QualificationContext,
    strategy: PromptingStrategy = null
  ): Promise<QualificationResult> {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      throw new ApiError(
        ErrorCode.INVALID_CONFIG,
        'Claude API key not configured',
        500
      );
    }

    try {
      // Build system prompt with optional strategy modification
      let systemPrompt = `You are a B2B sales assistant specializing in lead qualification using BANT framework (Budget, Authority, Need, Timeline) and multi-channel communication (LinkedIn and Email). Your goal is to qualify leads and maintain professional, personalized conversations across channels.

CRITICAL RESTRICTIONS - You must NEVER mention or imply:
1. **Pricing or costs:** Never mention specific prices, discounts, 'best price', 'lowest cost', 'cheapest', 'special offer', or any pricing information. If asked about pricing, redirect to a conversation: "I'd be happy to discuss this in more detail. Would you be open to a brief conversation?"
2. **Guarantees or promises:** Never use words like 'guarantee', 'guaranteed', 'promise', 'assure', 'certain', 'definitely', or make absolute claims about outcomes.
3. **Competitor comparisons:** Never mention competitors by name, compare products/services, or make negative statements about competitors. Avoid phrases like 'better than', 'worse than', 'vs', 'versus', 'compared to'.
4. **Unverified claims:** Never make claims about the prospect's business (funding rounds, product launches, expansions, growth) unless this information is explicitly provided in the enrichment data. Always verify facts against the provided context data before mentioning them. If you're unsure, don't mention it.

You must return a confidence_score (0-100 integer) for your response. Confidence should be calculated based on three factors:
(1) Context completeness (0-40 points): Do you have enough information about the prospect? Check: enrichment data exists (+10), talking_points available (+10), company_data available (+10), conversation history exists (+10).
(2) Fact verifiability (0-40 points): Can all claims in your response be verified from enrichment data? All claims verifiable (+40), some verifiable (+20), none verifiable (+0).
(3) Tone appropriateness (0-20 points): Is the tone appropriate for the channel (LinkedIn vs Email) and prospect persona? Perfect match (+20), partial match (+10), no match (+0).
Total confidence_score = sum of all three factors (0-100).`;

      // Add strategy-specific instructions
      if (strategy) {
        const strategyInstructions: Record<NonNullable<PromptingStrategy>, string> = {
          strategy_1: '', // Baseline - no modification
          strategy_2: "\n\n**WRITING STYLE:** Write as if you're a colleague having a casual conversation. Use contractions (I'm, we'll, don't), natural pauses, and a friendly tone. Be conversational, not formal.",
          strategy_3: "\n\n**WRITING STYLE:** Write professionally but with warmth. Use 'I' statements instead of 'we' or 'our company'. Show genuine interest, avoid corporate jargon. Be personal and authentic.",
          strategy_4: "\n\n**WRITING STYLE:** Keep your response message under 3 sentences. Be direct, no fluff. Get to the point quickly. Be concise and clear.",
          strategy_5: "\n\n**WRITING STYLE:** Start your response with a genuine question about their business. Show curiosity, not a sales pitch. Ask about their challenges or goals.",
        };
        systemPrompt += strategyInstructions[strategy];
      }

      systemPrompt += `\n\nReturn ONLY valid JSON with no additional text or markdown formatting. The JSON must match this exact structure:
{
  "qualification_status": "qualified" | "not_qualified" | "needs_more_info",
  "proposed_response_template_id": "uuid-string",
  "proposed_channel": "linkedin" | "email",
  "confidence_score": 0-100,
  "confidence_reasoning": "string explaining confidence calculation for each factor",
  "reasoning": "string explaining your decision"
}`;

      // Build user prompt with context
      const userPrompt = this.buildUserPrompt(context);

      // Call Claude API
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: getClaudeModel(),
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new ApiError(
          ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
          `Claude API error: ${errorData?.error?.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json() as ClaudeResponse;

      // Parse Claude response
      const responseText = data.content[0]?.text || '';
      const qualificationResult = this.parseQualificationResponse(responseText, context);

      return qualificationResult;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        `Failed to qualify prospect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        error
      );
    }
  }

  /**
   * Build user prompt with prospect context
   */
  private buildUserPrompt(context: QualificationContext): string {
    const { prospect, enrichment, thread_history, reply_text, channel, sentiment } = context;

    let prompt = `Based on this prospect reply from ${channel} and context below, determine:
1. Is this a qualified lead (BANT framework: Budget, Authority, Need, Timeline)?
2. What should the response be? (Select from available templates)
3. Which channel should we respond on (LinkedIn or Email)?

**Prospect Information:**
- Name: ${prospect.name}
- Company: ${prospect.company || 'N/A'}
- Job Title: ${prospect.job_title || 'N/A'}
- Channel: ${channel}
- Sentiment: ${sentiment}

`;

    // Add enrichment data if available
    if (enrichment) {
      prompt += `**Enrichment Data:**\n`;
      if (enrichment.talking_points?.length > 0) {
        prompt += `- Talking Points: ${enrichment.talking_points.join(', ')}\n`;
      }
      if (enrichment.pain_points?.length > 0) {
        prompt += `- Pain Points: ${enrichment.pain_points.join(', ')}\n`;
      }
      if (enrichment.company_insights) {
        prompt += `- Company Insights: ${enrichment.company_insights}\n`;
      }
      prompt += `\n`;
    }

    // Add thread history
    if (thread_history.length > 0) {
      prompt += `**Conversation History (last ${thread_history.length} messages):**\n`;
      thread_history.forEach((msg, idx) => {
        prompt += `${idx + 1}. [${msg.direction}] [${msg.channel}] ${msg.generated_by_ai ? '(AI)' : '(Prospect)'}: ${msg.message_text.substring(0, 200)}...\n`;
      });
      prompt += `\n`;
    }

    // Add reply text
    prompt += `**Prospect Reply (${channel}):**\n${reply_text}\n\n`;

    // Add channel context
    prompt += `**Channel Context:**\nThis reply came from ${channel}. Respond on the same channel unless there's a reason to switch.\n\n`;

    // Add template selection guidance
    prompt += `**Available Templates:**\nYou need to select a template ID from the available templates. The template should match the channel (${channel}) and use case (follow_up_engaged, re_engagement, or custom).\n\n`;

    // Add blacklist reminder
    prompt += `**IMPORTANT REMINDER:** Do not mention pricing, guarantees, competitors, or make unverified claims about the prospect's business. All claims must be verifiable from the enrichment data provided above. If you're unsure about any fact, don't mention it.\n\n`;

    // Add confidence evaluation instruction
    prompt += `**Confidence Evaluation:**\nAfter generating your response, evaluate your confidence_score (0-100) using the three-factor method described in the system prompt. Provide confidence_reasoning explaining your score calculation for each factor (context completeness, fact verifiability, tone appropriateness).\n\n`;

    prompt += `Return JSON ONLY with no additional text:`;

    return prompt;
  }

  /**
   * Parse Claude API response and extract qualification result
   */
  private parseQualificationResponse(
    responseText: string,
    context: QualificationContext
  ): QualificationResult {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      // Try to extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText) as Partial<QualificationResult>;

      // Validate required fields
      if (!parsed.qualification_status || !['qualified', 'not_qualified', 'needs_more_info'].includes(parsed.qualification_status)) {
        throw new Error('Invalid qualification_status');
      }

      if (!parsed.proposed_channel || !['linkedin', 'email'].includes(parsed.proposed_channel)) {
        // Default to same channel as reply
        parsed.proposed_channel = context.channel;
      }

      // Extract confidence_reasoning
      const confidenceReasoning = parsed.confidence_reasoning || parsed.reasoning || 'No confidence reasoning provided';

      // Validate or calculate confidence_score
      let confidenceScore: number;
      if (typeof parsed.confidence_score === 'number' && parsed.confidence_score >= 0 && parsed.confidence_score <= 100) {
        confidenceScore = Math.round(parsed.confidence_score);
      } else {
        // Fallback: Calculate confidence score using Task 1 logic
        confidenceScore = this.calculateFallbackConfidence(context);
      }

      if (!parsed.proposed_response_template_id) {
        // Generate a placeholder UUID - this should be replaced by actual template selection
        parsed.proposed_response_template_id = '00000000-0000-0000-0000-000000000000';
      }

      if (!parsed.reasoning) {
        parsed.reasoning = 'No reasoning provided';
      }

      return {
        qualification_status: parsed.qualification_status as 'qualified' | 'not_qualified' | 'needs_more_info',
        proposed_response_template_id: parsed.proposed_response_template_id,
        proposed_channel: parsed.proposed_channel as 'linkedin' | 'email',
        confidence_score: confidenceScore,
        confidence_reasoning: confidenceReasoning,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        `Failed to parse Claude API response: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        400,
        { responseText, error }
      );
    }
  }

  /**
   * Calculate sentiment from reply text (simple keyword matching for Micro-MVP)
   */
  static calculateSentiment(replyText: string): 'positive' | 'neutral' | 'negative' {
    const text = replyText.toLowerCase();

    const positiveKeywords = ['interested', 'yes', 'sounds good', "let's talk", 'sure', 'okay', 'great', 'perfect', 'excellent', 'definitely', 'absolutely'];
    const negativeKeywords = ['not interested', 'no thanks', 'stop', 'unsubscribe', 'remove', 'delete', 'no', "don't", "can't", 'unable', 'busy'];

    const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
    const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));

    if (hasPositive && !hasNegative) {
      return 'positive';
    }
    if (hasNegative) {
      return 'negative';
    }
    return 'neutral';
  }
}

// Export singleton instance
export const aiQualificationService = new AIQualificationService();

