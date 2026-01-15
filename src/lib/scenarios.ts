import { Scenario } from '@/types/scenarios'

export const scenarios: Scenario[] = [
  {
    id: 'routing',
    title: 'Support Summary Routing',
    description: 'Routes a support summarization request with metadata',
    request: {
      method: 'POST',
      endpoint: '/route',
      body: {
        prompt: 'Summarize this support ticket: user cannot reset password on iOS',
        metadata: {
          channel: 'support'
        },
        router_model: 'consensus'
      }
    },
    response: {
      primary: {
        model: 'gpt-4-turbo',
        score: 9,
        reason: 'Best suited for this task based on prompt analysis'
      },
      alternate: {
        model: 'gpt-4o',
        score: 8,
        reason: 'Viable alternative with different strengths'
      },
      request_id: '6f57f863-01f6-4c1f-a2d0-5385af4a0605',
      router_model_used: 'consensus',
      from_cache: false
    },
    highlightFields: ['primary', 'alternate', 'router_model_used']
  },
  {
    id: 'policy',
    title: 'Enterprise Privacy Draft',
    description: 'Routes a legal-style prompt with context metadata',
    request: {
      method: 'POST',
      endpoint: '/route',
      body: {
        prompt: 'Draft a concise privacy policy update for storing telemetry events',
        context: {
          audience: 'enterprise'
        },
        router_model: 'openai'
      }
    },
    response: {
      primary: {
        model: 'gpt-4-turbo',
        score: 9,
        reason: 'Best suited for this task based on prompt analysis'
      },
      alternate: {
        model: 'gpt-4o',
        score: 8,
        reason: 'Viable alternative with different strengths'
      },
      request_id: '79aca35e-2a2f-4a33-85b7-6167088fde9e',
      router_model_used: 'openai',
      from_cache: true
    },
    highlightFields: ['primary', 'alternate', 'from_cache']
  },
  {
    id: 'caching',
    title: 'Preferred Model Hint',
    description: 'Routes a coding prompt with prefer_model set',
    request: {
      method: 'POST',
      endpoint: '/route',
      body: {
        prompt: 'Implement a rate limiter in Node.js using Redis',
        prefer_model: 'gpt-4o',
        router_model: 'gemini'
      }
    },
    response: {
      primary: {
        model: 'gpt-4-turbo',
        score: 9,
        reason: 'Best suited for this task based on prompt analysis'
      },
      alternate: {
        model: 'gpt-4o',
        score: 8,
        reason: 'Viable alternative with different strengths'
      },
      request_id: '3ce25b05-1751-43ab-ab48-66344745f296',
      router_model_used: 'gemini',
      from_cache: true
    },
    highlightFields: ['primary', 'alternate', 'from_cache']
  },
  {
    id: 'feedback',
    title: 'Feedback Capture',
    description: 'Send feedback to improve future routing',
    request: {
      method: 'POST',
      endpoint: '/feedback',
      body: {
        request_id: '6f57f863-01f6-4c1f-a2d0-5385af4a0605',
        selected_model: 'gpt-4-turbo',
        intent_label: 'support',
        rating: 'positive',
        metadata: {
          ticket_id: 'SUP-1842'
        }
      }
    },
    response: {
      feedback_id: '6391cb03-1a23-4727-ab90-675766635182',
      acknowledged: true,
      knowledge_updated: true
    },
    highlightFields: ['feedback_id', 'acknowledged', 'knowledge_updated']
  }
]
