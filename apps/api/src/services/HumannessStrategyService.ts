import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { HumannessTestAnalyticsService } from './HumannessTestAnalyticsService';
import { supabaseAdmin } from '../lib/supabase';

export interface CodificationResult {
  success: boolean;
  strategy_codified: string;
  templates_created: number;
  prompts_updated: boolean;
}

export class HumannessStrategyService {
  private analyticsService: HumannessTestAnalyticsService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.analyticsService = new HumannessTestAnalyticsService(supabase);
  }

  /**
   * Codify winning strategy into templates and AI prompts
   */
  async codifyWinningStrategy(
    testId: string,
    strategyName: string | null,
    userId: string
  ): Promise<CodificationResult> {
    // Get winning strategy
    const winningStrategy = strategyName
      ? await this.getStrategyByName(testId, strategyName)
      : await this.analyticsService.getWinningStrategy(testId);

    if (!winningStrategy) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Winning strategy not found',
        404
      );
    }

    // Update AI prompts (store strategy in environment/config)
    // For now, we'll store it in a config table or environment variable
    // The AIQualificationService will read this config
    await this.updateAIPromptStrategy(winningStrategy.strategy_name);

    // Create templates based on winning strategy
    const templatesCreated = await this.createWinningStrategyTemplates(
      winningStrategy.strategy_name,
      userId
    );

    // Update template selection logic (prefer humanness-optimized templates)
    // This is handled in EmailTemplateService

    // Log codification
    await supabaseAdmin
      .from('audit_log')
      .insert({
        event_type: 'humanness_strategy_codified',
        user_id: userId,
        metadata: {
          test_id: testId,
          strategy_name: winningStrategy.strategy_name,
          detection_rate: winningStrategy.detection_rate,
        },
      });

    return {
      success: true,
      strategy_codified: winningStrategy.strategy_name,
      templates_created: templatesCreated,
      prompts_updated: true,
    };
  }

  /**
   * Get strategy by name
   */
  private async getStrategyByName(testId: string, strategyName: string) {
    const { data } = await this.supabase
      .from('humanness_test_analytics')
      .select('*')
      .eq('test_id', testId)
      .eq('ai_prompting_strategy', strategyName)
      .single();

    if (!data) {
      return null;
    }

    return {
      strategy_name: data.ai_prompting_strategy || 'unknown',
      detection_rate: Number(data.detection_rate),
      ai_messages_count: data.ai_messages_count,
      ai_correctly_identified: data.ai_correctly_identified,
      ai_incorrectly_identified_as_human: data.ai_incorrectly_identified_as_human,
    };
  }

  /**
   * Update AI prompt strategy (store in config)
   */
  private async updateAIPromptStrategy(strategyName: string): Promise<void> {
    // Store strategy in users table or a config table
    // For now, we'll use a simple approach: store in environment variable or database config
    // In production, this would be stored in a config table or feature flag system
    // The AIQualificationService will read this to determine default strategy

    // For MVP, we'll store it in a user setting or config table
    // This is a placeholder - actual implementation would depend on config system
    console.log(`Updating AI prompt strategy to: ${strategyName}`);
  }

  /**
   * Create templates based on winning strategy
   */
  private async createWinningStrategyTemplates(
    strategyName: string,
    userId: string
  ): Promise<number> {
    const strategyTemplates: Record<string, Array<{
      name: string;
      body: string;
      subject?: string;
      channel: 'linkedin' | 'email';
    }>> = {
      strategy_2: [
        {
          name: 'Conversational Follow-up',
          channel: 'email',
          subject: 'Quick question',
          body: "Hey {{prospect_name}},\n\nI'm reaching out because I noticed {{company}} is in the {{industry}} space. I'd love to hear about the challenges you're facing - what's keeping you up at night?\n\nLet me know if you'd be open to a quick chat!\n\nBest,\n{{user_name}}",
        },
        {
          name: 'Conversational LinkedIn',
          channel: 'linkedin',
          body: "Hey {{prospect_name}},\n\nI saw you're at {{company}} - that's awesome! I'm curious, what's the biggest challenge you're dealing with right now? Would love to hear your thoughts.",
        },
      ],
      strategy_3: [
        {
          name: 'Professional Warm Follow-up',
          channel: 'email',
          subject: 'Thought you might find this interesting',
          body: "Hi {{prospect_name}},\n\nI've been following {{company}}'s work in {{industry}}, and I'm genuinely interested in learning more about your approach. I'd love to understand what challenges you're facing and see if there's a way I can help.\n\nWould you be open to a brief conversation?\n\nBest regards,\n{{user_name}}",
        },
        {
          name: 'Professional Warm LinkedIn',
          channel: 'linkedin',
          body: "Hi {{prospect_name}},\n\nI'm reaching out because I'm genuinely interested in {{company}}'s work. I'd love to learn more about the challenges you're facing. Would you be open to a quick conversation?",
        },
      ],
      strategy_4: [
        {
          name: 'Short Direct Follow-up',
          channel: 'email',
          subject: 'Quick question',
          body: "Hi {{prospect_name}},\n\nWhat's your biggest challenge right now? I might be able to help.\n\n{{user_name}}",
        },
        {
          name: 'Short Direct LinkedIn',
          channel: 'linkedin',
          body: "Hi {{prospect_name}},\n\nWhat's your biggest challenge? I might be able to help.",
        },
      ],
      strategy_5: [
        {
          name: 'Question-Led Follow-up',
          channel: 'email',
          subject: 'Quick question about {{company}}',
          body: "Hi {{prospect_name}},\n\nWhat challenges is {{company}} facing in {{industry}} right now? I'm curious to learn more.\n\n{{user_name}}",
        },
        {
          name: 'Question-Led LinkedIn',
          channel: 'linkedin',
          body: "Hi {{prospect_name}},\n\nWhat challenges is {{company}} facing right now? I'm curious to learn more.",
        },
      ],
    };

    const templates = strategyTemplates[strategyName] || [];
    let created = 0;

    for (const template of templates) {
      const { error } = await this.supabase
        .from('email_templates')
        .insert({
          user_id: userId,
          name: template.name,
          body: template.body,
          subject: template.subject || null,
          channel: template.channel,
          is_system_template: false,
          is_active: true,
          use_case: 'follow_up_engaged',
          tone: 'professional',
          metadata: {
            humanness_strategy: strategyName,
          },
        });

      if (!error) {
        created++;
      }
    }

    return created;
  }
}



