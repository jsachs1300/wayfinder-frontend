import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function ApiReferencePage() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400 mb-3">
            API Reference
          </p>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-white mb-4">
            Managed Wayfinder API
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
            Use the managed Wayfinder endpoints to route prompts, capture feedback,
            and improve model selection over time. This reference documents the
            public endpoints available in the hosted service.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 mb-10">
            <h2 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
              Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Pass your Wayfinder token in the request header.
            </p>
            <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`X-Wayfinder-Token: wf_...`}
            </pre>
          </div>

          <div className="space-y-10">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                  POST /api/users/register
                </h2>
                <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 text-xs font-semibold">
                  Public
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a user account and receive your first Wayfinder token.
                User self-service must be enabled on the hosted service.
              </p>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Request body
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li><span className="font-semibold">email</span> (string, required)</li>
                <li><span className="font-semibold">password</span> (string, required)</li>
              </ul>

              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto mb-6">
{`{
  "email": "alex@example.com",
  "password": "your-secure-password"
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Response body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "user": {
    "id": "user_123",
    "email": "alex@example.com",
    "tier": "free",
    "status": "active",
    "created_at": "2026-01-15T18:00:00.000Z",
    "updated_at": "2026-01-15T18:00:00.000Z",
    "last_login_at": null
  },
  "token": {
    "id": "token_123",
    "token": "wf_...",
    "name": "Default Token",
    "is_primary": true
  }
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                  POST /api/users/login
                </h2>
                <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 text-xs font-semibold">
                  Public
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Authenticate a user and return account details plus existing tokens.
                Token values are not returned for security.
              </p>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Request body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto mb-6">
{`{
  "email": "alex@example.com",
  "password": "your-secure-password"
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Response body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "user": {
    "id": "user_123",
    "email": "alex@example.com",
    "tier": "free",
    "status": "active",
    "created_at": "2026-01-15T18:00:00.000Z",
    "updated_at": "2026-01-15T18:00:00.000Z",
    "last_login_at": "2026-01-15T18:10:00.000Z"
  },
  "tokens": [
    {
      "id": "token_123",
      "name": "Default Token",
      "is_primary": true,
      "environment": "dev",
      "created_at": "2026-01-15T18:00:00.000Z",
      "updated_at": "2026-01-15T18:00:00.000Z"
    }
  ]
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                  POST /route
                </h2>
                <span className="inline-flex items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 px-3 py-1 text-xs font-semibold">
                  Routing
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Route a prompt through Wayfinder to receive a primary and alternate
                model recommendation.
              </p>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Request body
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li><span className="font-semibold">prompt</span> (string, required)</li>
                <li><span className="font-semibold">context</span> (object, optional)</li>
                <li><span className="font-semibold">prefer_model</span> (string, optional)</li>
                <li><span className="font-semibold">metadata</span> (object, optional)</li>
                <li><span className="font-semibold">router_model</span> (openai | gemini | consensus, optional)</li>
              </ul>

              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto mb-6">
{`{
  "prompt": "Summarize this support ticket: user cannot reset password on iOS",
  "metadata": { "channel": "support" },
  "router_model": "consensus"
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Response body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "primary": { "model": "gpt-4-turbo", "score": 9, "reason": "Best suited for this task based on prompt analysis" },
  "alternate": { "model": "gpt-4o", "score": 8, "reason": "Viable alternative with different strengths" },
  "request_id": "6f57f863-01f6-4c1f-a2d0-5385af4a0605",
  "router_model_used": "consensus",
  "from_cache": false
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                  POST /feedback
                </h2>
                <span className="inline-flex items-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-200 px-3 py-1 text-xs font-semibold">
                  Feedback
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Submit feedback for a considered response to improve future routing.
              </p>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Request body
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li><span className="font-semibold">request_id</span> (string, required)</li>
                <li><span className="font-semibold">selected_model</span> (string, required)</li>
                <li><span className="font-semibold">intent_label</span> (code_review | coding | legal | summarization | reasoning | creative | support | other, required)</li>
                <li><span className="font-semibold">rating</span> (positive | negative | neutral, optional)</li>
                <li><span className="font-semibold">preferred_model</span> (string, optional)</li>
                <li><span className="font-semibold">metadata</span> (object, optional)</li>
              </ul>

              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto mb-6">
{`{
  "request_id": "6f57f863-01f6-4c1f-a2d0-5385af4a0605",
  "selected_model": "gpt-4-turbo",
  "intent_label": "support",
  "rating": "positive",
  "metadata": { "ticket_id": "SUP-1842" }
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Response body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "feedback_id": "6391cb03-1a23-4727-ab90-675766635182",
  "acknowledged": true,
  "knowledge_updated": true
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                  Token Management
                </h2>
                <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 text-xs font-semibold">
                  Auth required
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage tokens for your account. Provide <span className="font-semibold">X-Wayfinder-Token</span>
                from an existing token to authorize these endpoints.
              </p>

              <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">GET /api/tokens</p>
                  <p>List tokens for the authenticated user.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">POST /api/tokens</p>
                  <p>Create a new token for the authenticated user.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">DELETE /api/tokens/:id</p>
                  <p>Delete a non-primary token.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">POST /api/tokens/:id/rotate</p>
                  <p>Rotate a token and receive a new token value.</p>
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-8 mb-2">
                Create token request body
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li><span className="font-semibold">name</span> (string, optional)</li>
                <li><span className="font-semibold">eligible_models</span> (string[], optional)</li>
                <li><span className="font-semibold">environment</span> (prod | dev, optional)</li>
                <li><span className="font-semibold">router_model_preference</span> (openai | gemini | consensus, optional)</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                If <span className="font-semibold">eligible_models</span> is omitted or empty, the backend resolves
                model eligibility from the current default-token profile.
              </p>

              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto mb-6">
{`{
  "name": "Staging Token",
  "eligible_models": ["gpt-4o-mini", "gemini-2.5-flash"],
  "environment": "dev",
  "router_model_preference": "consensus"
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Rotate token response body
              </h3>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "token": "wf_...",
  "rotated_at": "2026-01-15T18:20:00.000Z"
}`}
              </pre>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-8 mb-2">
                Admin default-token profile
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Admins can manage the system-wide default token model list via
                <span className="font-semibold"> GET/PUT /admin/default-token-profile</span>.
              </p>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "profile": {
    "model_ids": ["gpt-4o-mini", "gemini-2.5-flash"],
    "version": 4
  },
  "effective_model_ids": ["gpt-4o-mini", "gemini-2.5-flash"],
  "missing_model_ids": [],
  "recommended_model_ids": ["gpt-4o-mini", "gemini-2.5-flash"],
  "cache_scope": "global:v4",
  "cache_flush_recommended": true,
  "cache_flush_hint": "Clear global cache if immediate cleanup is needed."
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <h2 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
                Errors
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Errors are returned in a standard JSON shape.
              </p>
              <pre className="rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "error": "ValidationError",
  "message": "Invalid request body",
  "details": { "...": "..." },
  "timestamp": "2026-01-15T18:55:47.288Z"
}`}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/#signup">
              <Button size="lg">Join the waitlist</Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="secondary">How it works</Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
