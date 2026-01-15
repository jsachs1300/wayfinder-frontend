export type ScenarioId = 'policy' | 'routing' | 'caching' | 'feedback'

export interface Scenario {
  id: ScenarioId
  title: string
  description: string
  request: {
    method: string
    endpoint: string
    body: Record<string, unknown>
  }
  response: Record<string, unknown>
  highlightFields: string[]
}
