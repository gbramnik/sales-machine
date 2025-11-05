import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sales-machine/shared/types/database';
import { ApiError, ErrorCode } from '../types';
import { UniPilService } from './UniPilService';

export interface DetectedAuthor {
  author_linkedin_url: string;
  author_name: string;
  post_url: string;
}

export class AuthorDetectionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Detect authors that a prospect comments on
   * Uses UniPil API to fetch prospect's LinkedIn activity/comments
   * 
   * @param prospectLinkedInUrl LinkedIn URL of the prospect
   * @returns Array of authors that prospect commented on
   */
  async detectAuthorsProspectCommentsOn(
    prospectLinkedInUrl: string
  ): Promise<DetectedAuthor[]> {
    try {
      // TODO: Confirm exact UniPil API endpoint for prospect activity/comments
      // Possible endpoints:
      // - GET /api/v1/linkedin/profile/{prospectLinkedInUrl}/activity
      // - GET /api/v1/linkedin/profile/{prospectLinkedInUrl}/comments
      
      // For now, we'll use a placeholder approach
      // In production, this should call UniPil API to get prospect's comment activity
      
      // Example API call structure (to be confirmed with UniPil docs):
      // const encodedUrl = encodeURIComponent(prospectLinkedInUrl);
      // const endpoint = `/api/v1/linkedin/profile/${encodedUrl}/activity`;
      
      // Since UniPilService doesn't have this method yet, we'll need to add it
      // For now, return empty array as placeholder
      
      // TODO: Implement actual UniPil API call when endpoint is confirmed
      // const response = await UniPilService.getProspectActivity(prospectLinkedInUrl);
      
      // Parse response to extract authors
      // Authors are profiles that the prospect commented on
      // Return format: Array<{ author_linkedin_url, author_name, post_url }>
      
      console.warn('AuthorDetectionService.detectAuthorsProspectCommentsOn: Not yet implemented - UniPil API endpoint needs confirmation');
      
      // Placeholder return - will be implemented once UniPil API endpoint is confirmed
      return [];
    } catch (error) {
      throw new ApiError(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Failed to detect authors prospect comments on',
        500,
        error
      );
    }
  }

  /**
   * Store detected authors in prospect_enrichment table
   * Stores in company_data JSONB field or detected_authors field if it exists
   * 
   * @param prospectId Prospect ID
   * @param userId User ID
   * @param authors Array of detected authors
   */
  async storeDetectedAuthors(
    prospectId: string,
    userId: string,
    authors: DetectedAuthor[]
  ): Promise<void> {
    try {
      // Check if prospect_enrichment exists
      const { data: existing } = await this.supabase
        .from('prospect_enrichment')
        .select('id, company_data')
        .eq('prospect_id', prospectId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing enrichment with detected_authors in company_data
        const companyData = (existing.company_data as any) || {};
        companyData.detected_authors = authors;

        const { error } = await this.supabase
          .from('prospect_enrichment')
          .update({
            company_data: companyData,
          })
          .eq('id', existing.id);

        if (error) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to update prospect enrichment with detected authors',
            500,
            error
          );
        }
      } else {
        // Create new enrichment entry
        const { error } = await this.supabase
          .from('prospect_enrichment')
          .insert({
            prospect_id: prospectId,
            user_id: userId,
            company_data: {
              detected_authors: authors,
            },
          });

        if (error) {
          throw new ApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Failed to create prospect enrichment with detected authors',
            500,
            error
          );
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to store detected authors',
        500,
        error
      );
    }
  }

  /**
   * Get detected authors for a prospect
   * Retrieves from prospect_enrichment.company_data->detected_authors
   * 
   * @param prospectId Prospect ID
   * @param userId User ID
   * @returns Array of detected authors or empty array
   */
  async getDetectedAuthors(
    prospectId: string,
    userId: string
  ): Promise<DetectedAuthor[]> {
    try {
      const { data, error } = await this.supabase
        .from('prospect_enrichment')
        .select('company_data')
        .eq('prospect_id', prospectId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return [];
      }

      const companyData = (data.company_data as any) || {};
      return (companyData.detected_authors as DetectedAuthor[]) || [];
    } catch (error) {
      // Return empty array on error (non-critical)
      console.error('Failed to get detected authors:', error);
      return [];
    }
  }

  /**
   * Check if prospect has posts
   * Uses UniPil API to query prospect's recent posts
   * 
   * @param prospectLinkedInUrl LinkedIn URL of the prospect
   * @returns True if prospect has posts, false otherwise
   */
  async hasProspectPosts(prospectLinkedInUrl: string): Promise<boolean> {
    try {
      // TODO: Implement UniPil API call to check for prospect posts
      // This would be a new method in UniPilService: getProspectPosts(linkedinUrl)
      // For now, return false as placeholder
      
      console.warn('AuthorDetectionService.hasProspectPosts: Not yet implemented - UniPil API endpoint needs confirmation');
      return false;
    } catch (error) {
      // Return false on error (assume no posts)
      console.error('Failed to check prospect posts:', error);
      return false;
    }
  }

  /**
   * Get a random author from detected authors for engagement
   * 
   * @param prospectId Prospect ID
   * @param userId User ID
   * @returns Random detected author or null if none found
   */
  async getRandomAuthorForEngagement(
    prospectId: string,
    userId: string
  ): Promise<DetectedAuthor | null> {
    const authors = await this.getDetectedAuthors(prospectId, userId);
    
    if (authors.length === 0) {
      return null;
    }

    // Return random author
    const randomIndex = Math.floor(Math.random() * authors.length);
    return authors[randomIndex];
  }
}

