export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_conversation_log: {
        Row: {
          ai_confidence_score: number | null
          campaign_id: string | null
          channel: string
          claude_model_used: string | null
          created_at: string | null
          direction: string
          email_message_id: string | null
          generated_by_ai: boolean | null
          id: string
          in_reply_to_id: string | null
          is_qualified: boolean | null
          linkedin_message_id: string | null
          message_html: string | null
          message_text: string
          message_type: string | null
          metadata: Json | null
          prompt_template_used: string | null
          prospect_id: string
          qualification_reason: string | null
          received_at: string | null
          sent_at: string | null
          sentiment: string | null
          subject: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          ai_confidence_score?: number | null
          campaign_id?: string | null
          channel: string
          claude_model_used?: string | null
          created_at?: string | null
          direction: string
          email_message_id?: string | null
          generated_by_ai?: boolean | null
          id?: string
          in_reply_to_id?: string | null
          is_qualified?: boolean | null
          linkedin_message_id?: string | null
          message_html?: string | null
          message_text: string
          message_type?: string | null
          metadata?: Json | null
          prompt_template_used?: string | null
          prospect_id: string
          qualification_reason?: string | null
          received_at?: string | null
          sent_at?: string | null
          sentiment?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          ai_confidence_score?: number | null
          campaign_id?: string | null
          channel?: string
          claude_model_used?: string | null
          created_at?: string | null
          direction?: string
          email_message_id?: string | null
          generated_by_ai?: boolean | null
          id?: string
          in_reply_to_id?: string | null
          is_qualified?: boolean | null
          linkedin_message_id?: string | null
          message_html?: string | null
          message_text?: string
          message_type?: string | null
          metadata?: Json | null
          prompt_template_used?: string | null
          prospect_id?: string
          qualification_reason?: string | null
          received_at?: string | null
          sent_at?: string | null
          sentiment?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversation_log_in_reply_to_id_fkey"
            columns: ["in_reply_to_id"]
            isOneToOne: false
            referencedRelation: "ai_conversation_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversation_log_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials: {
        Row: {
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          service_name: string
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          service_name: string
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          service_name?: string
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          action: string
          automation_type: string
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          error_details: Json | null
          id: string
          list_id: string | null
          message: string
          metadata: Json | null
          n8n_execution_id: string | null
          prospect_id: string | null
          records_processed: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          automation_type: string
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          list_id?: string | null
          message: string
          metadata?: Json | null
          n8n_execution_id?: string | null
          prospect_id?: string | null
          records_processed?: number | null
          started_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          action?: string
          automation_type?: string
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          list_id?: string | null
          message?: string
          metadata?: Json | null
          n8n_execution_id?: string | null
          prospect_id?: string | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bounce_count: number | null
          bounce_rate: number | null
          bounced_count: number
          completed_at: string | null
          contacted_count: number
          created_at: string
          email_credential_id: string | null
          id: string
          linkedin_credential_id: string | null
          list_id: string
          n8n_execution_id: string | null
          name: string
          responded_count: number
          spam_complaint_count: number | null
          spam_complaint_rate: number | null
          started_at: string | null
          status: string
          total_prospects: number
          updated_at: string
          user_id: string
          workflow_type: string
        }
        Insert: {
          bounce_count?: number | null
          bounce_rate?: number | null
          bounced_count?: number
          completed_at?: string | null
          contacted_count?: number
          created_at?: string
          email_credential_id?: string | null
          id?: string
          linkedin_credential_id?: string | null
          list_id: string
          n8n_execution_id?: string | null
          name: string
          responded_count?: number
          spam_complaint_count?: number | null
          spam_complaint_rate?: number | null
          started_at?: string | null
          status?: string
          total_prospects?: number
          updated_at?: string
          user_id: string
          workflow_type: string
        }
        Update: {
          bounce_count?: number | null
          bounce_rate?: number | null
          bounced_count?: number
          completed_at?: string | null
          contacted_count?: number
          created_at?: string
          email_credential_id?: string | null
          id?: string
          linkedin_credential_id?: string | null
          list_id?: string
          n8n_execution_id?: string | null
          name?: string
          responded_count?: number
          spam_complaint_count?: number | null
          spam_complaint_rate?: number | null
          started_at?: string | null
          status?: string
          total_prospects?: number
          updated_at?: string
          user_id?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_email_credential_id_fkey"
            columns: ["email_credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_linkedin_credential_id_fkey"
            columns: ["linkedin_credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string | null
          description: string | null
          headquarters: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          scraped_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          scraped_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          scraped_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      credentials: {
        Row: {
          created_at: string
          encrypted_data: string
          id: string
          is_active: boolean
          last_tested_at: string | null
          metadata: Json | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_data: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          metadata?: Json | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_data?: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          metadata?: Json | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          channel: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          is_vip_template: boolean | null
          linkedin_message_preview: string | null
          meeting_rate: number | null
          name: string
          open_rate: number | null
          reply_rate: number | null
          sent_count: number | null
          subject_line: string | null
          tone: string | null
          updated_at: string | null
          use_case: string | null
          user_id: string | null
          variables_required: Json | null
          variant_id: string | null
        }
        Insert: {
          body: string
          channel?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          is_vip_template?: boolean | null
          linkedin_message_preview?: string | null
          meeting_rate?: number | null
          name: string
          open_rate?: number | null
          reply_rate?: number | null
          sent_count?: number | null
          subject_line?: string | null
          tone?: string | null
          updated_at?: string | null
          use_case?: string | null
          user_id?: string | null
          variables_required?: Json | null
          variant_id?: string | null
        }
        Update: {
          body?: string
          channel?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          is_vip_template?: boolean | null
          linkedin_message_preview?: string | null
          meeting_rate?: number | null
          name?: string
          open_rate?: number | null
          reply_rate?: number | null
          sent_count?: number | null
          subject_line?: string | null
          tone?: string | null
          updated_at?: string | null
          use_case?: string | null
          user_id?: string | null
          variables_required?: Json | null
          variant_id?: string | null
        }
        Relationships: []
      }
      lists: {
        Row: {
          campaign_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          prospect_count: number
          qualified_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          prospect_count?: number
          qualified_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          prospect_count?: number
          qualified_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospect_enrichment: {
        Row: {
          claude_model_used: string | null
          company_data: Json | null
          company_insights: string | null
          confidence_score: number | null
          enriched_at: string | null
          enrichment_source: string | null
          enrichment_version: string | null
          id: string
          mutual_connections: number | null
          pain_points: Json | null
          personalization_score: number | null
          prospect_id: string
          recent_activity: string | null
          shared_interests: Json | null
          talking_points: Json | null
          tech_stack: Json | null
          token_count: number | null
          user_id: string
        }
        Insert: {
          claude_model_used?: string | null
          company_data?: Json | null
          company_insights?: string | null
          confidence_score?: number | null
          enriched_at?: string | null
          enrichment_source?: string | null
          enrichment_version?: string | null
          id?: string
          mutual_connections?: number | null
          pain_points?: Json | null
          personalization_score?: number | null
          prospect_id: string
          recent_activity?: string | null
          shared_interests?: Json | null
          talking_points?: Json | null
          tech_stack?: Json | null
          token_count?: number | null
          user_id: string
        }
        Update: {
          claude_model_used?: string | null
          company_data?: Json | null
          company_insights?: string | null
          confidence_score?: number | null
          enriched_at?: string | null
          enrichment_source?: string | null
          enrichment_version?: string | null
          id?: string
          mutual_connections?: number | null
          pain_points?: Json | null
          personalization_score?: number | null
          prospect_id?: string
          recent_activity?: string | null
          shared_interests?: Json | null
          talking_points?: Json | null
          tech_stack?: Json | null
          token_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          company: string | null
          company_description: string | null
          company_linkedin_url: string | null
          company_website: string | null
          contacted_at: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          email_confidence_score: number | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          list_id: string
          location: string | null
          name: string
          qualification_score: number | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          company_description?: string | null
          company_linkedin_url?: string | null
          company_website?: string | null
          contacted_at?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          email_confidence_score?: number | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          list_id: string
          location?: string | null
          name: string
          qualification_score?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          company_description?: string | null
          company_linkedin_url?: string | null
          company_website?: string | null
          contacted_at?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          email_confidence_score?: number | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          list_id?: string
          location?: string | null
          name?: string
          qualification_score?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      blacklist_incidents: {
        Row: {
          blacklisted_phrase: string
          created_at: string | null
          id: string
          matched_text: string | null
          message_preview: string | null
          prospect_id: string | null
          review_queue_id: string | null
          severity: string | null
          user_id: string | null
          violation_category: string
        }
        Insert: {
          blacklisted_phrase: string
          created_at?: string | null
          id?: string
          matched_text?: string | null
          message_preview?: string | null
          prospect_id?: string | null
          review_queue_id?: string | null
          severity?: string | null
          user_id?: string | null
          violation_category: string
        }
        Update: {
          blacklisted_phrase?: string
          created_at?: string | null
          id?: string
          matched_text?: string | null
          message_preview?: string | null
          prospect_id?: string | null
          review_queue_id?: string | null
          severity?: string | null
          user_id?: string | null
          violation_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_incidents_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blacklist_incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blacklist_warnings: {
        Row: {
          escalated: boolean | null
          escalated_at: string | null
          first_violation_at: string | null
          id: string
          last_violation_at: string | null
          prospect_id: string | null
          user_id: string | null
          violation_category: string
          violation_count: number | null
        }
        Insert: {
          escalated?: boolean | null
          escalated_at?: string | null
          first_violation_at?: string | null
          id?: string
          last_violation_at?: string | null
          prospect_id?: string | null
          user_id?: string | null
          violation_category: string
          violation_count?: number | null
        }
        Update: {
          escalated?: boolean | null
          escalated_at?: string | null
          first_violation_at?: string | null
          id?: string
          last_violation_at?: string | null
          prospect_id?: string | null
          user_id?: string | null
          violation_category?: string
          violation_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_warnings_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blacklist_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_blacklist: {
        Row: {
          blacklisted_phrase: string
          created_at: string | null
          id: string
          is_active: boolean | null
          regex_pattern: string | null
          severity: string | null
          topic_category: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          blacklisted_phrase: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          regex_pattern?: string | null
          severity?: string | null
          topic_category: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          blacklisted_phrase?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          regex_pattern?: string | null
          severity?: string | null
          topic_category?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_blacklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          calendar_access_token: string | null
          calendar_provider: string | null
          calendar_refresh_token: string | null
          calendar_token_expires_at: string | null
          calendar_username: string | null
          company_name: string | null
          created_at: string | null
          daily_email_limit: number | null
          default_event_type_id: string | null
          domain_verification_status: Json | null
          domain_warmup_started_at: string | null
          email: string
          email_settings: Json | null
          full_name: string | null
          icp_criteria: Json | null
          id: string
          industry: string | null
          last_login_at: string | null
          monthly_prospect_limit: number | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          calendar_access_token?: string | null
          calendar_provider?: string | null
          calendar_refresh_token?: string | null
          calendar_token_expires_at?: string | null
          calendar_username?: string | null
          company_name?: string | null
          created_at?: string | null
          daily_email_limit?: number | null
          default_event_type_id?: string | null
          domain_verification_status?: Json | null
          domain_warmup_started_at?: string | null
          email: string
          email_settings?: Json | null
          full_name?: string | null
          icp_criteria?: Json | null
          id: string
          industry?: string | null
          last_login_at?: string | null
          monthly_prospect_limit?: number | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          calendar_access_token?: string | null
          calendar_provider?: string | null
          calendar_refresh_token?: string | null
          calendar_token_expires_at?: string | null
          calendar_username?: string | null
          company_name?: string | null
          created_at?: string | null
          daily_email_limit?: number | null
          default_event_type_id?: string | null
          domain_verification_status?: Json | null
          domain_warmup_started_at?: string | null
          email?: string
          email_settings?: Json | null
          full_name?: string | null
          icp_criteria?: Json | null
          id?: string
          industry?: string | null
          last_login_at?: string | null
          monthly_prospect_limit?: number | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_automation_logs: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
