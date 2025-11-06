import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { authenticateUser, apiRequest, errorRate, API_BASE_URL } from '../base.js';

/**
 * Performance Benchmarks Test
 * 
 * Validates NFR3 requirements:
 * - API response time: p95 < 500ms
 * - Error rate: < 1%
 * 
 * Tests all critical API endpoints
 */

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp-up to 50 users
    { duration: '3m', target: 50 },   // Steady state
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    // NFR3: API response time < 500ms p95
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],   // <1% error rate
    errors: ['rate<0.01'],
    // Per-endpoint thresholds
    'http_req_duration{name:get_prospects}': ['p(95)<500'],
    'http_req_duration{name:post_prospects}': ['p(95)<500'],
    'http_req_duration{name:get_campaigns}': ['p(95)<500'],
    'http_req_duration{name:post_campaigns}': ['p(95)<500'],
    'http_req_duration{name:get_dashboard}': ['p(95)<500'],
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
  
  // Test GET /prospects
  const prospectsResponse = apiRequest('GET', '/prospects?limit=50', null, token);
  check(prospectsResponse, {
    'get prospects status is 200': (r) => r.status === 200,
  }, { name: 'get_prospects' });
  
  sleep(0.5);
  
  // Test POST /prospects
  const prospectPayload = {
    full_name: `Benchmark Prospect ${Math.random().toString(36).substring(7)}`,
    company_name: 'Test Company',
    linkedin_url: `https://linkedin.com/in/test-${Math.random().toString(36).substring(7)}`,
  };
  
  const createProspectResponse = apiRequest('POST', '/prospects', prospectPayload, token);
  check(createProspectResponse, {
    'post prospects status is 201': (r) => r.status === 201,
  }, { name: 'post_prospects' });
  
  sleep(0.5);
  
  // Test GET /campaigns
  const campaignsResponse = apiRequest('GET', '/campaigns', null, token);
  check(campaignsResponse, {
    'get campaigns status is 200': (r) => r.status === 200,
  }, { name: 'get_campaigns' });
  
  sleep(0.5);
  
  // Test POST /campaigns
  const campaignPayload = {
    name: `Benchmark Campaign ${Math.random().toString(36).substring(7)}`,
    subject: 'Test Email Subject',
  };
  
  const createCampaignResponse = apiRequest('POST', '/campaigns', campaignPayload, token);
  check(createCampaignResponse, {
    'post campaigns status is 201': (r) => r.status === 201,
  }, { name: 'post_campaigns' });
  
  sleep(0.5);
  
  // Test GET /dashboard
  const dashboardResponse = apiRequest('GET', '/dashboard', null, token);
  check(dashboardResponse, {
    'get dashboard status is 200': (r) => r.status === 200,
  }, { name: 'get_dashboard' });
  
  sleep(1); // Think time between iterations
}

