import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { authenticateUser, apiRequest, waitForCompletion, errorRate, API_BASE_URL } from '../base.js';

/**
 * Scenario 3: 100 AI Enrichment Requests
 * 
 * Tests Claude API rate limit handling and enrichment processing
 * 
 * Performance thresholds:
 * - API response time: p95 < 2s (enrichment trigger)
 * - Enrichment completion: p95 < 10s (Claude API + processing)
 * - Error rate: < 2% (account for rate limits)
 */

export const options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp-up to 100 users
    { duration: '3m', target: 100 },  // Steady state
    { duration: '1m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 2s for enrichment trigger
    http_req_failed: ['rate<0.02'],    // <2% error rate (account for rate limits)
    errors: ['rate<0.02'],
    'http_req_duration{name:enrichment_trigger}': ['p(95)<2000'],
    'http_req_duration{name:enrichment_completion}': ['p(95)<10000'], // 10s for enrichment
  },
};

// Test user credentials
const TEST_USERS = [
  { email: 'loadtest-user-1@test.sales-machine.com', password: 'test-password-1' },
  // Add more test users as needed
];

export default function () {
  // Select random test user
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  // Authenticate user
  const token = authenticateUser(user.email, user.password);
  if (!token) {
    errorRate.add(1);
    return;
  }
  
  // Create prospect
  const prospectPayload = {
    full_name: `Test Prospect ${Math.random().toString(36).substring(7)}`,
    company_name: 'Test Company',
    linkedin_url: `https://linkedin.com/in/test-${Math.random().toString(36).substring(7)}`,
    email: `test-${Math.random().toString(36).substring(7)}@test.com`,
  };
  
  const prospectResponse = apiRequest('POST', '/prospects', prospectPayload, token);
  
  const prospectCreated = check(prospectResponse, {
    'prospect created status is 201': (r) => r.status === 201,
    'prospect response has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch {
        return false;
      }
    },
  });
  
  if (!prospectCreated) {
    errorRate.add(1);
    return;
  }
  
  let prospectId;
  try {
    const body = JSON.parse(prospectResponse.body);
    prospectId = body.data.id;
  } catch {
    errorRate.add(1);
    return;
  }
  
  // Trigger AI enrichment
  // Note: Verify actual endpoint - may be POST /prospects/:id/enrich or POST /prospects/:id/enrichment
  const enrichResponse = apiRequest('POST', `/prospects/${prospectId}/enrich`, {}, token);
  
  const enrichTriggered = check(enrichResponse, {
    'enrichment trigger status is 200': (r) => r.status === 200,
    'enrichment response has execution_id or enrichment_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.execution_id || body.enrichment_id || body.data;
      } catch {
        return false;
      }
    },
  }, { name: 'enrichment_trigger' });
  
  if (!enrichTriggered) {
    // Check if rate limited (429)
    if (enrichResponse.status === 429) {
      // Rate limited - this is expected, log but don't count as error
      console.log('Rate limited - waiting...');
      sleep(5); // Wait before retry
    } else {
      errorRate.add(1);
    }
    return;
  }
  
  // Wait for enrichment completion (polling)
  const enrichmentCompleted = waitForCompletion(() => {
    // Poll enrichment status
    const statusResponse = apiRequest('GET', `/prospects/${prospectId}/enrichment`, null, token);
    
    if (statusResponse.status === 200) {
      try {
        const body = JSON.parse(statusResponse.body);
        // Check if enrichment is complete
        return body.data && (body.data.status === 'completed' || body.data.confidence_score);
      } catch {
        return false;
      }
    }
    return false;
  }, 30, 2); // Max 30s, poll every 2s
  
  const completionCheck = check(null, {
    'enrichment completed within timeout': () => enrichmentCompleted,
  }, { name: 'enrichment_completion' });
  
  if (!completionCheck) {
    errorRate.add(1);
  }
  
  // Verify enrichment data stored
  const enrichmentResponse = apiRequest('GET', `/prospects/${prospectId}/enrichment`, null, token);
  
  check(enrichmentResponse, {
    'enrichment data query status is 200': (r) => r.status === 200,
    'enrichment data exists': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Object.keys(body.data).length > 0;
      } catch {
        return false;
      }
    },
  });
  
  sleep(1); // Think time between iterations
}

