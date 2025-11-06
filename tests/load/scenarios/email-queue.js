import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { authenticateUser, apiRequest, errorRate, API_BASE_URL } from '../base.js';

/**
 * Scenario 2: 1000 Email Queue Operations
 * 
 * Tests Upstash Redis performance for email queue operations
 * 
 * Performance thresholds:
 * - Redis operation duration: p95 < 100ms
 * - Queue operation duration: p95 < 200ms
 * - Error rate: < 0.5%
 */

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up to 50 users
    { duration: '3m', target: 50 },  // Steady state (50 users × 20 ops = 1000 ops)
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 200ms for queue operations
    http_req_failed: ['rate<0.005'],  // <0.5% error rate
    errors: ['rate<0.005'],
    'http_req_duration{name:queue_operation}': ['p(95)<200'],
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
  
  // Create email campaign
  const campaignPayload = {
    name: `Load Test Campaign ${Math.random().toString(36).substring(7)}`,
    subject: 'Test Email Subject',
    template_id: null, // Use default template
  };
  
  const campaignResponse = apiRequest('POST', '/campaigns', campaignPayload, token);
  
  const campaignCreated = check(campaignResponse, {
    'campaign created status is 201': (r) => r.status === 201,
    'campaign response has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch {
        return false;
      }
    },
  });
  
  if (!campaignCreated) {
    errorRate.add(1);
    return;
  }
  
  let campaignId;
  try {
    const body = JSON.parse(campaignResponse.body);
    campaignId = body.data.id;
  } catch {
    errorRate.add(1);
    return;
  }
  
  // Create test prospects (batch: 10 prospects)
  const prospects = [];
  for (let i = 0; i < 10; i++) {
    const prospectPayload = {
      full_name: `Test Prospect ${i}`,
      company_name: 'Test Company',
      linkedin_url: `https://linkedin.com/in/test-${i}`,
      email: `test-prospect-${i}@test.com`,
      campaign_id: campaignId,
    };
    
    const prospectResponse = apiRequest('POST', '/prospects', prospectPayload, token);
    
    const prospectCreated = check(prospectResponse, {
      'prospect created status is 201': (r) => r.status === 201,
    });
    
    if (prospectCreated) {
      try {
        const body = JSON.parse(prospectResponse.body);
        if (body.data && body.data.id) {
          prospects.push(body.data.id);
        }
      } catch {
        // Continue
      }
    }
  }
  
  // Trigger email send (add to queue)
  const queuePayload = {
    campaign_id: campaignId,
    prospect_ids: prospects,
  };
  
  const queueResponse = apiRequest('POST', '/api/email-queue/add', queuePayload, token);
  
  const queueSuccess = check(queueResponse, {
    'email queued status is 200': (r) => r.status === 200,
  }, { name: 'queue_operation' });
  
  if (!queueSuccess) {
    errorRate.add(1);
  }
  
  // Poll queue status
  const queueStatusResponse = apiRequest('GET', `/api/email-queue/status?campaign_id=${campaignId}`, null, token);
  
  check(queueStatusResponse, {
    'queue status query status is 200': (r) => r.status === 200,
  });
  
  sleep(1); // Think time between iterations
}

