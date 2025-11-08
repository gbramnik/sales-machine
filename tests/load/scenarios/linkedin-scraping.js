import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { authenticateUser, triggerN8NWebhook, waitForCompletion, errorRate, API_BASE_URL, N8N_WEBHOOK_URL } from '../base.js';

/**
 * Scenario 1: 100 Concurrent LinkedIn Scraping Users
 * 
 * Tests N8N workflow capacity for LinkedIn scraping operations
 * 
 * Performance thresholds:
 * - HTTP request duration: p95 < 5s (workflow trigger)
 * - Workflow execution time: p95 < 30s (LinkedIn scraping)
 * - Error rate: < 1%
 */

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up to 100 users
    { duration: '6m', target: 100 },  // Steady state
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 5s for workflow trigger
    http_req_failed: ['rate<0.01'],   // <1% error rate
    errors: ['rate<0.01'],
    'http_req_duration{name:workflow_trigger}': ['p(95)<5000'],
    'http_req_duration{name:workflow_completion}': ['p(95)<30000'], // 30s for workflow
  },
};

// Test user credentials (should be loaded from test-users.json in real scenario)
// For now, using placeholder - should be replaced with actual test users
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
  
  // Trigger LinkedIn scraping workflow via N8N webhook
  const webhookPayload = {
    user_id: user.email, // Should be actual user_id from auth
    search_criteria: {
      keywords: 'CEO',
      location: 'France',
      industry: 'Technology',
    },
  };
  
  const webhookResponse = triggerN8NWebhook('/linkedin-scrape', webhookPayload, token);
  
  const triggerSuccess = check(webhookResponse, {
    'webhook trigger status is 200': (r) => r.status === 200,
    'webhook response has execution_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.execution_id || body.id;
      } catch {
        return false;
      }
    },
  }, { name: 'workflow_trigger' });
  
  if (!triggerSuccess) {
    errorRate.add(1);
    return;
  }
  
  // Parse execution ID from response
  let executionId = null;
  try {
    const body = JSON.parse(webhookResponse.body);
    executionId = body.execution_id || body.id;
  } catch (e) {
    errorRate.add(1);
    return;
  }
  
  // Wait for workflow completion (polling)
  // Note: This is a simplified version - actual implementation should poll N8N execution API
  const workflowCompleted = waitForCompletion(() => {
    // Poll N8N execution status
    // In real scenario, this would query N8N API: GET /api/v1/executions/{executionId}
    const statusUrl = `${N8N_WEBHOOK_URL}/execution-status/${executionId}`;
    const statusResponse = http.get(statusUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (statusResponse.status === 200) {
      try {
        const statusBody = JSON.parse(statusResponse.body);
        return statusBody.status === 'success' || statusBody.status === 'error';
      } catch {
        return false;
      }
    }
    return false;
  }, 60, 2); // Max 60s, poll every 2s
  
  const completionCheck = check(null, {
    'workflow completed within timeout': () => workflowCompleted,
  }, { name: 'workflow_completion' });
  
  if (!completionCheck) {
    errorRate.add(1);
  }
  
  // Verify prospect created in database
  // In real scenario, this would query Supabase API
  const prospectsResponse = http.get(`${API_BASE_URL}/prospects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  check(prospectsResponse, {
    'prospects query status is 200': (r) => r.status === 200,
  });
  
  sleep(1); // Think time between iterations
}



