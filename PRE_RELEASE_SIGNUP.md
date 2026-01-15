# Pre-Release Signup: API Contract + UI Behavior

This document defines the frontend behavior and the backend contract for the
pre-release signup flow. The backend will be implemented separately.

## Frontend Behavior

- Primary CTA button label: "Notify me".
- CTA opens an inline email form (not a modal).
- Form fields:
  - email (required)
  - company (optional)
  - role (optional)
- Submit button label: "Join waitlist".
- Success state: inline confirmation text + disable form inputs.
- Error state: inline error message under the form.
- No double-submit: disable submit while request is in flight.

## Endpoint

- Method: POST
- Path: /api/signup
- Content-Type: application/json

## Request Body

```json
{
  "email": "alex@example.com",
  "company": "Acme",
  "role": "CTO",
  "source": "landing",
  "referrer": "https://wayfinder.ai/",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "launch",
    "term": "llm routing",
    "content": "hero-cta"
  }
}
```

Notes:
- `email` is required and should be normalized to lowercase and trimmed.
- `company` and `role` are optional strings.
- `source` is required and should be "landing" for this frontend.
- `referrer` is optional (document.referrer or current URL).
- `utm` is optional; include keys only when present.

## Response: Success

- Status: 201 Created

```json
{
  "ok": true,
  "id": "signup_01J2W4B2W7G4J6T7N3JZ9A6XKP",
  "email": "alex@example.com",
  "status": "queued"
}
```

## Response: Already Exists

- Status: 200 OK

```json
{
  "ok": true,
  "id": "signup_01J2W4B2W7G4J6T7N3JZ9A6XKP",
  "email": "alex@example.com",
  "status": "already_subscribed"
}
```

## Response: Validation Error

- Status: 400 Bad Request

```json
{
  "ok": false,
  "error": "invalid_email"
}
```

## Response: Rate Limited

- Status: 429 Too Many Requests

```json
{
  "ok": false,
  "error": "rate_limited"
}
```

## Backend Handling (Redis)

Recommended Redis keys:
- `signup:email:{lowercase_email}` -> hash
- `signup:all` -> set of emails (optional)
- `signup:by_day:{YYYY-MM-DD}` -> set of emails (optional)

Hash fields:
- email
- company
- role
- source
- referrer
- utm_source
- utm_medium
- utm_campaign
- utm_term
- utm_content
- created_at (ISO 8601)

Suggested behavior:
- If `signup:email:{email}` exists, return 200 with status "already_subscribed".
- Otherwise, create the hash and return 201 with status "queued".
- Basic rate limit: 5 requests per IP per minute.

## Frontend Error Handling

- `invalid_email` -> show "Please enter a valid email address."
- `rate_limited` -> show "Please try again in a minute."
- other errors -> show "Something went wrong. Please try again."
