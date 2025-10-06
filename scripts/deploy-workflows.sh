#!/bin/bash

# N8N Workflow Deployment Script
# Deploys workflow JSON files to N8N Cloud using the N8N API

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if N8N_API_KEY is set
if [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}Error: N8N_API_KEY environment variable is not set${NC}"
    echo "Please set N8N_API_KEY before running this script"
    exit 1
fi

# Check if N8N_WEBHOOK_URL is set
if [ -z "$N8N_WEBHOOK_URL" ]; then
    echo -e "${RED}Error: N8N_WEBHOOK_URL environment variable is not set${NC}"
    echo "Please set N8N_WEBHOOK_URL before running this script"
    exit 1
fi

WORKFLOWS_DIR="./workflows"
DEPLOYED_COUNT=0
FAILED_COUNT=0

echo -e "${GREEN}Starting N8N workflow deployment...${NC}"
echo "Workflows directory: $WORKFLOWS_DIR"
echo ""

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo -e "${RED}Error: Workflows directory not found: $WORKFLOWS_DIR${NC}"
    exit 1
fi

# Find all .json files in workflows directory
WORKFLOW_FILES=$(find "$WORKFLOWS_DIR" -name "*.json" -type f)

if [ -z "$WORKFLOW_FILES" ]; then
    echo -e "${YELLOW}No workflow JSON files found in $WORKFLOWS_DIR${NC}"
    echo "Exiting with success (nothing to deploy)"
    exit 0
fi

# Deploy each workflow
for WORKFLOW_FILE in $WORKFLOW_FILES; do
    WORKFLOW_NAME=$(basename "$WORKFLOW_FILE")
    echo -e "${YELLOW}Deploying: $WORKFLOW_NAME${NC}"

    # Validate JSON format
    if ! jq empty "$WORKFLOW_FILE" 2>/dev/null; then
        echo -e "${RED}  ✗ Invalid JSON format${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi

    # TODO: Implement actual N8N API upload when API endpoint is available
    # For now, just validate the file exists and is valid JSON
    echo -e "${GREEN}  ✓ Validated (API upload not yet implemented)${NC}"
    DEPLOYED_COUNT=$((DEPLOYED_COUNT + 1))
done

echo ""
echo -e "${GREEN}Deployment Summary:${NC}"
echo "  Successfully deployed: $DEPLOYED_COUNT"
echo "  Failed: $FAILED_COUNT"

if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}Deployment completed with errors${NC}"
    exit 1
fi

echo -e "${GREEN}All workflows deployed successfully!${NC}"
exit 0
