# Google Sheets Setup for Metrics Dashboard

## Story 1.8: Basic Reporting & Metrics

This document explains how to set up Google Sheets for user metrics dashboards.

## Prerequisites

1. Google Cloud Project with Google Sheets API enabled
2. Service Account created with JSON credentials
3. Service Account email for sharing sheets

## Step 1: Create Template Google Sheet

1. Create a new Google Sheet
2. Create 3 tabs with the following headers:

### Tab 1: Campaign Overview
| Date | Total Prospects Scraped | Enriched | Contacted | Replied | Qualified | Meetings Booked | Meetings per 100 Prospects |
|------|------------------------|----------|-----------|---------|-----------|-----------------|---------------------------|

### Tab 2: Email Performance
| Date | Sent Count | Open Rate | Reply Rate | Bounce Rate | Spam Complaint Rate | Health Status |
|------|------------|-----------|------------|-------------|---------------------|---------------|

### Tab 3: AI Agent Performance
| Date | Total Conversations | Qualification Accuracy | Confidence Score Average |
|------|---------------------|----------------------|-------------------------|

3. Save the template sheet
4. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 2: Create User-Specific Sheets

### Option A: Manual Copy (Micro-MVP)
1. For each beta user:
   - Duplicate the template sheet
   - Rename it: "Sales Machine Metrics - {user_email}"
   - Copy the Sheet ID from the URL
   - Share with user's email (read-only access)
   - Share with service account email (Editor access)
   - Update `users.google_sheet_id` in Supabase:
     ```sql
     UPDATE users SET google_sheet_id = '{SHEET_ID}' WHERE email = '{user_email}';
     ```

### Option B: Programmatic Copy (Future Enhancement)
Use Google Drive API to copy template:
```javascript
POST https://www.googleapis.com/drive/v3/files/{template_file_id}/copy
{
  "name": "Sales Machine Metrics - {user_email}"
}
```

## Step 3: Configure Service Account

1. Download service account JSON credentials
2. Store in environment variables:
   - `GOOGLE_SHEETS_CREDENTIALS` (full JSON as string) OR
   - Individual fields: `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_PROJECT_ID`

3. Share each user's sheet with service account email (Editor access)

## Step 4: Generate Access Token

The N8N workflow needs a Google Sheets API access token. Generate it using service account JWT:

```javascript
// Generate JWT token
const jwt = require('jsonwebtoken');
const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

const token = jwt.sign(
  {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  },
  credentials.private_key,
  { algorithm: 'RS256' }
);

// Exchange for access token
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
});

const { access_token } = await response.json();
```

Store `access_token` in `GOOGLE_SHEETS_ACCESS_TOKEN` environment variable (or refresh periodically).

## Notes

- For Micro-MVP, manual sheet creation is acceptable
- For production, automate sheet creation via Google Drive API
- Access tokens expire after 1 hour - implement refresh logic in production
- Each user gets their own sheet with read-only access
- Service account needs Editor access to append data

