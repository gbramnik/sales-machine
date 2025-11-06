import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { AIQualificationService, QualificationContext, PromptingStrategy } from './ai-qualification.service';
import type { ProspectEnrichmentRow } from '@sales-machine/shared/types';

type TestMessage = Database['public']['Tables']['humanness_test_messages']['Row'];
type TestMessageInsert = Database['public']['Tables']['humanness_test_messages']['Insert'];

export interface ProspectContext {
  prospect_id: string;
  enrichment_data?: ProspectEnrichmentRow;
  channel: 'linkedin' | 'email';
}

export interface MessageSet {
  test_id: string;
  messages: Array<{
    id: string;
    message_text: string;
    message_type: 'ai_generated' | 'human_written';
    ai_prompting_strategy: string | null;
    channel: 'linkedin' | 'email';
    subject: string | null;
    message_order: number;
  }>;
}

// PromptingStrategy is imported from ai-qualification.service

export class HumannessTestMessageService {
  private aiQualificationService: AIQualificationService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.aiQualificationService = new AIQualificationService();
  }

  /**
   * Generate AI messages with 5 different prompting strategies
   */
  async generateAIMessagesWithStrategies(
    testId: string,
    prospectContext: ProspectContext,
    userId: string
  ): Promise<TestMessage[]> {
    // Get prospect and enrichment data
    const { data: prospect } = await this.supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectContext.prospect_id)
      .single();

    if (!prospect) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Prospect not found',
        404
      );
    }

    const enrichment = prospectContext.enrichment_data || (await this.supabase
      .from('prospect_enrichment')
      .select('*')
      .eq('prospect_id', prospectContext.prospect_id)
      .single()).data;

    // Build base context
    const baseContext: QualificationContext = {
      prospect: {
        name: prospect.full_name || '',
        company: prospect.company_name || null,
        job_title: prospect.job_title || null,
        email: prospect.email || undefined,
        linkedin_url: prospect.linkedin_url || undefined,
      },
      enrichment: enrichment ? {
        talking_points: (enrichment.talking_points as string[]) || [],
        pain_points: (enrichment.pain_points as string[]) || [],
        company_insights: enrichment.company_insights || null,
        recent_activity: enrichment.recent_activity || null,
      } : undefined,
      thread_history: [],
      reply_text: 'I am interested in learning more about your solution.',
      channel: prospectContext.channel,
      sentiment: 'positive',
    };

    const strategies: PromptingStrategy[] = ['strategy_1', 'strategy_2', 'strategy_3', 'strategy_4', 'strategy_5'];
    const messages: TestMessage[] = [];

    for (const strategy of strategies) {
      try {
        // Generate message with strategy-specific prompt
        const qualificationResult = await this.qualifyWithStrategy(baseContext, strategy);

        // Store message
        const messageInsert: TestMessageInsert = {
          test_id: testId,
          message_text: qualificationResult.reasoning, // Use reasoning as the message text
          message_type: 'ai_generated',
          ai_prompting_strategy: strategy,
          channel: prospectContext.channel,
          subject: prospectContext.channel === 'email' ? 'Re: Your inquiry' : null,
          template_id: qualificationResult.proposed_response_template_id || null,
          metadata: {
            prospect_id: prospectContext.prospect_id,
            enrichment_used: enrichment ? {
              talking_points: (enrichment.talking_points as string[]) || [],
              pain_points: (enrichment.pain_points as string[]) || [],
              company_insights: enrichment.company_insights || null,
            } : null,
            qualification_result: {
              qualification_status: qualificationResult.qualification_status,
              confidence_score: qualificationResult.confidence_score,
            },
          },
        };

        const { data: message, error } = await this.supabase
          .from('humanness_test_messages')
          .insert(messageInsert)
          .select()
          .single();

        if (error) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            `Failed to store message for strategy ${strategy}`,
            500,
            error
          );
        }

        if (message) {
          messages.push(message);
        }
      } catch (error) {
        // Log error but continue with other strategies
        console.error(`Failed to generate message for strategy ${strategy}:`, error);
      }
    }

    return messages;
  }

  /**
   * Qualify prospect with a specific prompting strategy
   */
  private async qualifyWithStrategy(
    context: QualificationContext,
    strategy: PromptingStrategy
  ) {
    // Call AIQualificationService with strategy parameter
    // The service will modify the system prompt based on the strategy
    return await this.aiQualificationService.qualifyProspect(context, strategy);
  }

  /**
   * Generate human-written messages (stored via API, not generated)
   */
  async generateHumanMessages(
    testId: string,
    messages: Array<{ message_text: string; subject?: string; channel: 'linkedin' | 'email' }>,
    userId: string
  ): Promise<TestMessage[]> {
    if (messages.length !== 5) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        'Exactly 5 human messages are required',
        400
      );
    }

    const storedMessages: TestMessage[] = [];

    for (const msg of messages) {
      const messageInsert: TestMessageInsert = {
        test_id: testId,
        message_text: msg.message_text,
        message_type: 'human_written',
        ai_prompting_strategy: null,
        channel: msg.channel,
        subject: msg.channel === 'email' ? (msg.subject || null) : null,
        metadata: {},
      };

      const { data, error } = await this.supabase
        .from('humanness_test_messages')
        .insert(messageInsert)
        .select()
        .single();

      if (error) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to store human message',
          500,
          error
        );
      }

      if (data) {
        storedMessages.push(data);
      }
    }

    return storedMessages;
  }

  /**
   * Create a complete test message set (5 AI + 5 human, shuffled)
   */
  async createTestMessageSet(
    testId: string,
    prospectContext: ProspectContext,
    userId: string
  ): Promise<MessageSet> {
    // Generate AI messages
    const aiMessages = await this.generateAIMessagesWithStrategies(testId, prospectContext, userId);

    // Note: Human messages should be provided via API endpoint
    // For now, we'll just return the AI messages
    // The human messages will be added separately via generateHumanMessages()

    // Shuffle messages (when human messages are added)
    // For now, assign order to AI messages
    const messagesWithOrder = aiMessages.map((msg, idx) => ({
      ...msg,
      message_order: idx + 1,
    }));

    // Update messages with order
    for (const msg of messagesWithOrder) {
      await this.supabase
        .from('humanness_test_messages')
        .update({ message_order: msg.message_order })
        .eq('id', msg.id);
    }

    return {
      test_id: testId,
      messages: messagesWithOrder.map(msg => ({
        id: msg.id,
        message_text: msg.message_text,
        message_type: msg.message_type,
        ai_prompting_strategy: msg.ai_prompting_strategy,
        channel: msg.channel,
        subject: msg.subject,
        message_order: msg.message_order || 0,
      })),
    };
  }

  /**
   * Get shuffled messages for a panelist (without revealing message_type)
   */
  async getShuffledMessages(testId: string): Promise<Array<{
    id: string;
    message_text: string;
    subject: string | null;
    channel: 'linkedin' | 'email';
    order: number;
  }>> {
    const { data, error } = await this.supabase
      .from('humanness_test_messages')
      .select('id, message_text, subject, channel, message_order')
      .eq('test_id', testId)
      .order('message_order', { ascending: true });

    if (error) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch messages',
        500,
        error
      );
    }

    // Shuffle if order is not set
    const messages = (data || []).map(msg => ({
      id: msg.id,
      message_text: msg.message_text,
      subject: msg.subject,
      channel: msg.channel as 'linkedin' | 'email',
      order: msg.message_order || Math.random(),
    }));

    // Sort by order (or random if not set)
    messages.sort((a, b) => a.order - b.order);

    return messages;
  }
}

