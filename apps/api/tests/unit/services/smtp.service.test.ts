import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SMTPService } from '../../../../src/services/SMTPService';

describe('SMTPService', () => {
  let smtpService: SMTPService;
  const mockCredentials = {
    api_key: 'test-api-key',
    domain: 'test.example.com',
    from_email: 'test@example.com',
  };

  beforeEach(() => {
    smtpService = new SMTPService('mailgun');
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully via Mailgun API', async () => {
      const mockResponse = {
        id: 'message-123',
        message: 'Queued',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await smtpService.sendEmail(
        {
          to: 'recipient@example.com',
          subject: 'Test Subject',
          body: '<p>Test Body</p>',
          from: 'test@example.com',
        },
        mockCredentials
      );

      expect(result.message_id).toBe('message-123');
      expect(result.status).toBe('queued');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw error when Mailgun API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid domain' }),
      });

      await expect(
        smtpService.sendEmail(
          {
            to: 'recipient@example.com',
            subject: 'Test',
            body: 'Test',
            from: 'test@example.com',
          },
          mockCredentials
        )
      ).rejects.toThrow();
    });
  });

  describe('parseWebhookPayload', () => {
    it('should parse Mailgun bounce event', () => {
      const payload = {
        event: 'bounced',
        'message-id': 'msg-123',
        recipient: 'test@example.com',
        timestamp: '2025-01-11T12:00:00Z',
      };

      const result = smtpService.parseWebhookPayload(payload);

      expect(result.event_type).toBe('bounce');
      expect(result.message_id).toBe('msg-123');
      expect(result.recipient).toBe('test@example.com');
    });

    it('should parse Mailgun spam complaint event', () => {
      const payload = {
        event: 'complained',
        'message-id': 'msg-456',
        recipient: 'test@example.com',
        timestamp: '2025-01-11T12:00:00Z',
      };

      const result = smtpService.parseWebhookPayload(payload);

      expect(result.event_type).toBe('spam_complaint');
    });
  });

  describe('verifyCredentials', () => {
    it('should verify valid API credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const result = await smtpService.verifyCredentials(mockCredentials);

      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const result = await smtpService.verifyCredentials(mockCredentials);

      expect(result).toBe(false);
    });
  });
});

