# Load Testing with k6

This directory contains load testing scripts and results for validating system performance under load.

## Installation

### macOS
```bash
brew install k6
```

### Linux
Follow the [k6 installation guide](https://k6.io/docs/getting-started/installation/)

### Windows
Use WSL or Docker:
```bash
docker run --rm -i grafana/k6 run -
```

### Verify Installation
```bash
k6 version
```

**Minimum version:** k6 v0.47.0+

## Environment Setup

### Environment Variables
Create a `.env` file in `tests/load/` (not committed to git):

```bash
API_BASE_URL=https://api-staging.sales-machine.com
API_KEY=your-api-key
N8N_WEBHOOK_URL=https://n8n.srv997159.hstgr.cloud/webhook
SUPABASE_URL=https://your-project.supabase.co
```

### Test Users
Test users should be created in the staging environment:
- Naming: `loadtest-user-{1..20}@test.sales-machine.com`
- Store credentials in `tests/load/data/test-users.json` (gitignored)

## Running Tests

### Run a specific scenario:
```bash
k6 run scenarios/linkedin-scraping.js
```

### Run with environment variables:
```bash
API_BASE_URL=https://api-staging.sales-machine.com k6 run scenarios/linkedin-scraping.js
```

### Run with output to file:
```bash
k6 run --out json=results/linkedin-scraping-$(date +%Y%m%d-%H%M%S).json scenarios/linkedin-scraping.js
```

## Test Scenarios

1. **LinkedIn Scraping** (`scenarios/linkedin-scraping.js`)
   - 100 concurrent users
   - Tests N8N workflow capacity

2. **Email Queue** (`scenarios/email-queue.js`)
   - 1000 email queue operations
   - Tests Upstash Redis performance

3. **AI Enrichment** (`scenarios/ai-enrichment.js`)
   - 100 AI enrichment requests
   - Tests Claude API rate limit handling

4. **Performance Benchmarks** (`scenarios/performance-benchmarks.js`)
   - Validates NFR3 requirements (API <500ms p95, workflows <5s)

## Interpreting Results

### Key Metrics
- **p50, p95, p99**: Response time percentiles
- **http_req_duration**: HTTP request duration
- **http_req_failed**: Failed request rate
- **vus**: Virtual users (concurrent)

### Performance Thresholds (NFR3)
- API response time: p95 < 500ms
- Workflow execution: p95 < 5 seconds
- Error rate: < 1%

### Example Output
```
✓ http_req_duration..............: avg=234ms min=45ms med=198ms max=1.2s p(90)=456ms p(95)=512ms
✗ http_req_duration..............: p(95)=512ms (threshold: 500ms)
```

## Important Notes

⚠️ **NEVER run load tests against production!**

- Always use staging environment
- Monitor all systems during tests (N8N, Supabase, Upstash, Claude API)
- Clean up test data after tests
- Document all results and bottlenecks

## Results

Test results are stored in `tests/load/results/` (gitignored).

## Troubleshooting

### k6 not found
- Verify installation: `k6 version`
- Check PATH includes k6 binary

### Connection errors
- Verify API_BASE_URL is correct
- Check network connectivity
- Verify API key is valid

### Rate limit errors
- Reduce virtual users (vus)
- Increase ramp-up time
- Check Claude API rate limits

