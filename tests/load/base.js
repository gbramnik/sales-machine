import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Base k6 test configuration and helpers
 * 
 * Common functions and configuration for all load test scenarios
 */

// Custom metrics
export const errorRate = new Rate('errors');

// Test options (can be overridden in specific scenarios)
export const defaultOptions = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up
    { duration: '6m', target: 100 },  // Steady state
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 5s for workflow triggers
    http_req_failed: ['rate<0.01'],   // <1% error rate
    errors: ['rate<0.01'],
  },
};

// Environment variables
export const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';
export const API_KEY = __ENV.API_KEY || '';
export const N8N_WEBHOOK_URL = __ENV.N8N_WEBHOOK_URL || 'https://n8n.srv997159.hstgr.cloud/webhook';
export const SUPABASE_URL = __ENV.SUPABASE_URL || '';

/**
 * Authenticate user and get JWT token
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {string|null} JWT token or null if authentication fails
 */
export function authenticateUser(email, password) {
  const url = `${API_BASE_URL}/auth/login`;
  const payload = JSON.stringify({
    email,
    password,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(url, payload, params);
  
  const success = check(response, {
    'authentication status is 200': (r) => r.status === 200,
    'response has token': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.token;
    },
  });
  
  if (!success) {
    errorRate.add(1);
    return null;
  }
  
  const body = JSON.parse(response.body);
  return body.data.token;
}

/**
 * Make authenticated API request
 * 
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {object} payload - Request payload (optional)
 * @param {string} token - JWT token
 * @returns {object} HTTP response
 */
export function apiRequest(method, path, payload, token) {
  const url = `${API_BASE_URL}${path}`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  
  let response;
  switch (method.toUpperCase()) {
    case 'GET':
      response = http.get(url, params);
      break;
    case 'POST':
      response = http.post(url, JSON.stringify(payload), params);
      break;
    case 'PUT':
      response = http.put(url, JSON.stringify(payload), params);
      break;
    case 'PATCH':
      response = http.patch(url, JSON.stringify(payload), params);
      break;
    case 'DELETE':
      response = http.del(url, null, params);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
  
  return response;
}

/**
 * Trigger N8N webhook
 * 
 * @param {string} webhookPath - Webhook path (e.g., '/linkedin-scrape')
 * @param {object} payload - Webhook payload
 * @param {string} token - API token (optional)
 * @returns {object} HTTP response
 */
export function triggerN8NWebhook(webhookPath, payload, token = null) {
  const url = `${N8N_WEBHOOK_URL}${webhookPath}`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    params.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = http.post(url, JSON.stringify(payload), params);
  return response;
}

/**
 * Wait for async operation to complete (polling)
 * 
 * @param {function} checkFunction - Function that returns true when complete
 * @param {number} maxWait - Maximum wait time in seconds
 * @param {number} pollInterval - Poll interval in seconds
 * @returns {boolean} True if completed, false if timeout
 */
export function waitForCompletion(checkFunction, maxWait = 60, pollInterval = 2) {
  const startTime = Date.now();
  const maxWaitMs = maxWait * 1000;
  const pollIntervalMs = pollInterval * 1000;
  
  while (Date.now() - startTime < maxWaitMs) {
    if (checkFunction()) {
      return true;
    }
    sleep(pollInterval);
  }
  
  return false;
}

/**
 * Generate random test data
 */
export const testData = {
  randomEmail: () => `test-${Math.random().toString(36).substring(7)}@test.sales-machine.com`,
  randomName: () => `Test User ${Math.random().toString(36).substring(7)}`,
  randomLinkedInUrl: () => `https://linkedin.com/in/test-${Math.random().toString(36).substring(7)}`,
};



