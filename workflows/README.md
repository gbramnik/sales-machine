# N8N Workflows

This directory contains N8N workflow definitions stored as JSON files.

## N8N Cloud Workspace

- **Workspace URL**: https://n8n.srv997159.hstgr.cloud
- **Base Webhook URL**: https://n8n.srv997159.hstgr.cloud/webhook/
- **Test Webhook**: https://n8n.srv997159.hstgr.cloud/webhook-test/3e42aefd-b374-4569-bb66-2b89e904535b

## Webhook Endpoints

All N8N webhooks follow the pattern: `https://n8n.srv997159.hstgr.cloud/webhook/{workflow-name}/{unique-id}`

| Workflow | Webhook URL | Description |
|----------|-------------|-------------|
| test-webhook | https://n8n.srv997159.hstgr.cloud/webhook-test/3e42aefd-b374-4569-bb66-2b89e904535b | Test webhook for validation |

## Deployment Process

### Local Deployment

Workflows can be deployed locally using the deployment script:

```bash
npm run deploy:workflows
```

This script:
1. Validates N8N_API_KEY and N8N_WEBHOOK_URL environment variables
2. Reads workflow JSON files from this directory
3. Validates JSON format for each workflow
4. Uses N8N API to upload/update workflows (when implemented)
5. Logs deployment summary

### GitHub Actions Deployment

Workflows can also be deployed via GitHub Actions with manual approval:

1. Go to: https://github.com/gbramnik/sales-machine/actions/workflows/deploy-workflows.yaml
2. Click "Run workflow"
3. Select branch (usually `main`)
4. Click "Run workflow" to confirm

**Prerequisites**: Ensure `N8N_API_KEY` and `N8N_WEBHOOK_URL` secrets are set in GitHub repository settings.

## Adding New Workflows

1. Export workflow JSON from N8N Cloud UI
2. Save to this directory as `{workflow-name}.json`
3. Run `npm run deploy:workflows` to deploy
4. Update the Webhook Endpoints table above

## Environment Variables

- `N8N_API_KEY`: API key for N8N Cloud workspace
- `N8N_WEBHOOK_URL`: Base webhook URL (https://n8n.srv997159.hstgr.cloud)
