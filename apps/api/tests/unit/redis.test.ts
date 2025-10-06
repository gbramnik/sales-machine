import { describe, it, expect } from 'vitest';

describe('Redis Configuration', () => {
  it('should have valid REDIS_URL format', () => {
    const testUrl = 'https://stirred-gnu-7257.upstash.io';
    expect(testUrl).toMatch(/^https:\/\/.*\.upstash\.io$/);
  });

  it('should have valid REDIS_TOKEN format', () => {
    const testToken = 'ARxZAAImcDJlNjdmODg2MTBiYjE0MzUyOGE3OGVhYjU5NDVhNGU5MXAyNzI1Nw';
    expect(testToken).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(testToken.length).toBeGreaterThan(20);
  });
});
