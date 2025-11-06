# UniPil API Reference

**Created:** 2025-01-15  
**Purpose:** Complete reference for UniPil API endpoints used in Sales Machine  
**Base URL:** `https://1api21.unipile.com:15176/api/v1/accounts`  
**Authentication:** `Authorization: Bearer {API_KEY}`

---

## Overview

This document provides a comprehensive reference for UniPil API endpoints used throughout the Sales Machine platform. All endpoints require Bearer token authentication in the `Authorization` header.

**API Key:** `kgQvfznd.XKOSD0UGlF5clyJEOB6qpbj0HVuwGAcbIrpErX81sXg=`

---

## Endpoints Reference

### Posts

#### Retrieve a Post
- **Endpoint:** `GET /api/v1/posts/{post_id}`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/posts/{post_id}`
- **Method:** GET
- **Description:** Retrieve the details of a post
- **Documentation:** https://developer.unipile.com/reference/postscontroller_getpost
- **Used in:** Post engagement workflows

#### List All Comments from a Post
- **Endpoint:** `GET /api/v1/posts/{post_id}/comments`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/posts/{post_id}/comments`
- **Method:** GET
- **Description:** Returns a list of either comments on a given post or replies on a given comment
- **Documentation:** https://developer.unipile.com/reference/postscontroller_listallcomments
- **Used in:** Post engagement analysis

#### Comment a Post
- **Endpoint:** `POST /api/v1/posts/{post_id}/comments`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/posts/{post_id}/comments`
- **Method:** POST
- **Description:** Comment a post or reply to a post comment
- **Documentation:** https://developer.unipile.com/reference/postscontroller_sendcomment
- **Used in:** LinkedIn warmup actions (`linkedin-warmup-actions.json`)
- **Request Body:** `{ comment_text: string }`

#### List All Reactions from a Post
- **Endpoint:** `GET /api/v1/posts/{post_id}/reactions`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/posts/{post_id}/reactions`
- **Method:** GET
- **Description:** Returns a list of reactions to either a post or a post comment
- **Documentation:** https://developer.unipile.com/reference/postscontroller_listallreactions
- **Used in:** Post engagement analysis

#### Add Reaction to a Post
- **Endpoint:** `POST /api/v1/posts/{post_id}/reactions`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/posts/{post_id}/reactions`
- **Method:** POST
- **Description:** Add a reaction (like) to a post
- **Documentation:** https://developer.unipile.com/reference/postscontroller_addpostreaction
- **Used in:** LinkedIn warmup actions (`linkedin-warmup-actions.json`)
- **Request Body:** 
  ```json
  {
    "reaction_type": "like" | "love" | "celebrate" | "support" | "funny" | "insightful"
  }
  ```
- **Note:** Currently implemented as `likePost()` in `UniPilService.ts`, but could be extended to support other reaction types

### LinkedIn Specific

#### Retrieve Company Profile
- **Endpoint:** `GET /api/v1/linkedin/company/{company_url}`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/linkedin/company/{company_url}`
- **Method:** GET
- **Description:** Retrieve LinkedIn company profile data
- **Documentation:** https://developer.unipile.com/reference/linkedincontroller_getcompanyprofile
- **Used in:** LinkedIn scraper workflow (`linkedin-scraper.json`)
- **URL Parameter:** `company_url` (URL-encoded LinkedIn company page URL)

#### Get LinkedIn Search Parameters
- **Endpoint:** `GET /api/v1/linkedin/search-parameters`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/linkedin/search-parameters`
- **Method:** GET
- **Description:** Retrieve available LinkedIn search parameters and filters
- **Documentation:** https://developer.unipile.com/reference/linkedincontroller_getsearchparameterslist
- **Used in:** Search configuration and validation
- **Response:** Returns available search filters (industries, locations, job titles, company sizes, etc.)

#### Perform LinkedIn Search
- **Endpoint:** `POST /api/v1/linkedin/search`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/linkedin/search`
- **Method:** POST
- **Description:** Perform LinkedIn profile search with filters
- **Documentation:** https://developer.unipile.com/reference/linkedincontroller_performlinkedinsearch
- **Used in:** 
  - LinkedIn scraper workflow (`linkedin-scraper.json`)
  - Daily prospect detection (`daily-prospect-detection.json`)
- **Request Body:**
  ```json
  {
    "industry": "string",
    "location": "string",
    "job_title": "string",
    "company_size": "string",
    "limit": number
  }
  ```

#### Perform Action with User Profile
- **Endpoint:** `POST /api/v1/linkedin/profile-action`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/linkedin/profile-action`
- **Method:** POST
- **Description:** Perform actions on LinkedIn user profiles (connection request, message, etc.)
- **Documentation:** https://developer.unipile.com/reference/linkedincontroller_performactionwithuserprofile
- **Used in:** LinkedIn connection trigger (`linkedin-connection-trigger.json`)
- **Request Body:**
  ```json
  {
    "action": "connection_request" | "message" | "endorse" | "view_profile",
    "linkedin_url": "string",
    "message": "string" (optional, required for connection_request and message actions)
  }
  ```
- **Note:** This is a generic action endpoint. Specific endpoints like `/linkedin/connection-request` and `/linkedin/message` may be preferred for clarity.

#### Endorse User Profile Skill
- **Endpoint:** `POST /api/v1/linkedin/endorse`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/linkedin/endorse`
- **Method:** POST
- **Description:** Endorse a specific skill on a user's LinkedIn profile
- **Documentation:** https://developer.unipile.com/reference/linkedincontroller_endorseprofile
- **Used in:** Profile engagement workflows
- **Request Body:**
  ```json
  {
    "linkedin_url": "string",
    "skill_name": "string"
  }
  ```

### Messaging

#### Start a New Chat
- **Endpoint:** `POST /api/v1/chats`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/chats`
- **Method:** POST
- **Description:** Start a new chat/conversation
- **Documentation:** https://developer.unipile.com/reference/chatscontroller_startnewchat
- **Used in:** Direct messaging workflows
- **Request Body:**
  ```json
  {
    "attendee_linkedin_url": "string",
    "initial_message": "string" (optional)
  }
  ```

#### Send Message in Chat
- **Endpoint:** `POST /api/v1/chats/{chat_id}/messages`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/chats/{chat_id}/messages`
- **Method:** POST
- **Description:** Send a message in an existing chat/conversation
- **Documentation:** https://developer.unipile.com/reference/chatscontroller_sendmessageinchat
- **Used in:** 
  - AI conversation agent (`ai-conversation-agent.json`)
  - Direct messaging workflows
- **Request Body:**
  ```json
  {
    "message_text": "string",
    "attachments": [
      {
        "type": "file" | "image" | "document",
        "url": "string",
        "filename": "string"
      }
    ] (optional)
  }
  ```
- **Response:** Returns message object with `message_id` and timestamp

#### List All Chats
- **Endpoint:** `GET /api/v1/chats`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/chats`
- **Method:** GET
- **Description:** List all chats/conversations
- **Documentation:** https://developer.unipile.com/reference/chatscontroller_listallchats
- **Used in:** Chat management and synchronization

#### List Chats by Attendee
- **Endpoint:** `GET /api/v1/attendees/{attendee_id}/chats`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/attendees/{attendee_id}/chats`
- **Method:** GET
- **Description:** List all 1-to-1 chats for a given attendee
- **Documentation:** https://developer.unipile.com/reference/chatattendeescontroller_listchatsbyattendee
- **Used in:** Prospect conversation history retrieval

### Accounts

#### Reconnect an Account
- **Endpoint:** `POST /api/v1/accounts/{account_id}/reconnect`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/accounts/{account_id}/reconnect`
- **Method:** POST
- **Description:** Reconnect a LinkedIn account that has been disconnected
- **Documentation:** https://developer.unipile.com/reference/accountscontroller_reconnectaccount
- **Used in:** Account management and recovery workflows

#### Delete an Account
- **Endpoint:** `DELETE /api/v1/accounts/{account_id}`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/accounts/{account_id}`
- **Method:** DELETE
- **Description:** Delete a connected LinkedIn account
- **Documentation:** https://developer.unipile.com/reference/accountscontroller_deleteaccount
- **Used in:** Account cleanup and management

#### Request Hosted Authentication Link
- **Endpoint:** `POST /api/v1/hosted/request-link`
- **Full URL:** `https://{subdomain}.unipile.com:{port}/api/v1/hosted/request-link`
- **Method:** POST
- **Description:** Request a hosted authentication link for connecting LinkedIn accounts
- **Documentation:** https://developer.unipile.com/reference/hostedcontroller_requestlink
- **Used in:** Account onboarding workflows
- **Request Body:**
  ```json
  {
    "platform": "linkedin",
    "redirect_url": "string" (optional)
  }
  ```

---

## Current Implementation Status

### ✅ Implemented Endpoints

1. **LinkedIn Search** (`POST /linkedin/search`)
   - ✅ Implemented in `UniPilService.searchProfiles()`
   - ✅ Used in `linkedin-scraper.json`
   - ✅ Used in `daily-prospect-detection.json`

2. **Get Company Profile** (`GET /linkedin/company/{url}`)
   - ✅ Implemented in `UniPilService.getCompanyPage()`
   - ✅ Used in `linkedin-scraper.json`

3. **Like Post** (`POST /linkedin/like`)
   - ✅ Implemented in `UniPilService.likePost()`
   - ✅ Used in `linkedin-warmup-actions.json`

4. **Comment Post** (`POST /linkedin/comment`)
   - ✅ Implemented in `UniPilService.commentOnPost()`
   - ✅ Used in `linkedin-warmup-actions.json`

5. **Connection Request** (`POST /linkedin/connection-request`)
   - ✅ Implemented in `UniPilService.sendConnectionRequest()`
   - ✅ Used in `linkedin-connection-trigger.json`

6. **Send Message** (`POST /linkedin/message`)
   - ✅ Implemented in `UniPilService.sendMessage()`
   - ⚠️ Not yet used in workflows (planned for future stories)

### 📋 Endpoints to Implement (Future Stories)

1. **List All Chats** - For conversation history retrieval
2. **Start New Chat** - For initiating conversations
3. **Send Message in Chat** - Alternative to direct message endpoint
4. **List Chats by Attendee** - For prospect conversation lookup
5. **Get Post Details** - For post engagement analysis
6. **List Post Comments** - For engagement tracking
7. **List Post Reactions** - For engagement metrics
8. **Reconnect Account** - For account recovery
9. **Delete Account** - For account cleanup
10. **Request Hosted Auth Link** - For account onboarding
11. **Endorse Profile** - For profile engagement

---

## Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer kgQvfznd.XKOSD0UGlF5clyJEOB6qpbj0HVuwGAcbIrpErX81sXg=
```

## Base URL Configuration

**Current Configuration:**
- **Base URL:** `https://1api21.unipile.com:15176/api/v1/accounts`
- **Format:** `{base_url}/{endpoint}`

**Example:**
- Search endpoint: `https://1api21.unipile.com:15176/api/v1/accounts/linkedin/search`
- Company endpoint: `https://1api21.unipile.com:15176/api/v1/accounts/linkedin/company/{encoded_url}`

## Rate Limits

- **Default:** 20 prospects/day
- **Maximum:** 40 prospects/day
- **Cost:** 5€/compte LinkedIn/month

## Error Handling

Standard error response format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:
- `INVALID_API_KEY` - API key is invalid or expired
- `RATE_LIMIT_EXCEEDED` - Daily limit reached
- `ACCOUNT_DISCONNECTED` - LinkedIn account needs reconnection
- `INVALID_REQUEST` - Request parameters are invalid

## Response Format

Standard success response format:
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

---

## Integration Notes

### Workflow Integration

All workflows use hardcoded API key (no environment variables in N8N):
- API key is embedded directly in workflow JSON files
- Base URL is hardcoded in workflow nodes
- No dependency on N8N environment variables

### Service Integration

`UniPilService.ts` uses environment variables:
- `UNIPIL_API_KEY` from `apps/api/.env`
- `UNIPIL_API_URL` from `apps/api/.env` (defaults to configured base URL)

---

## Documentation Links

- **Main API Reference:** https://developer.unipile.com/reference
- **Posts Controller:** https://developer.unipile.com/reference/postscontroller_getpost
- **LinkedIn Controller:** https://developer.unipile.com/reference/linkedincontroller_getcompanyprofile
- **Messaging Controller:** https://developer.unipile.com/reference/chatscontroller_startnewchat
- **Accounts Controller:** https://developer.unipile.com/reference/accountscontroller_reconnectaccount

---

## Update History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.0 | Initial documentation created with all endpoint references |

