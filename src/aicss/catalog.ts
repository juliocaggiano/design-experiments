export type AiCssDefinition = {
  id: string
  path: string
  title: string
  date: string
  category: 'Interactions' | 'Motion' | 'Interfaces'
  sourceGroup: 'Thinking & Reasoning' | 'Tool & Action States' | 'Text Outputs' | 'Structured Outputs'
  summary: string
  detail: string
  tags: string
}

export const AICSS_DEFINITIONS = [
  {
    id: 'thinking-reasoning',
    path: '/vault/thinking-reasoning',
    title: 'Thinking + Reasoning',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Thinking & Reasoning',
    summary: 'Reasoning steps stream into a collapsible block before resolving into a compact duration label.',
    detail: 'Progress is visible while the task runs, then folds away so the completed answer keeps the visual priority.',
    tags: 'AI, Reasoning, Disclosure',
  },
  {
    id: 'web-search',
    path: '/vault/ai-web-search',
    title: 'Web Search',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Tool & Action States',
    summary: 'A live search state resolves sources one at a time beneath the active query.',
    detail: 'Each globe becomes a confirmation mark as its source arrives, making tool progress readable without a separate progress bar.',
    tags: 'AI, Search, Tool State',
  },
  {
    id: 'streaming-text',
    path: '/vault/ai-streaming-text',
    title: 'Streaming Text',
    date: 'Jul 15, 2026',
    category: 'Motion',
    sourceGroup: 'Text Outputs',
    summary: 'Text arrives progressively with a caret that disappears when the response is complete.',
    detail: 'The stream uses word-sized timing variation rather than a mechanical constant rate, keeping progress visible without distracting from reading.',
    tags: 'AI, Streaming, Type',
  },
  {
    id: 'inline-citations',
    path: '/vault/ai-inline-citations',
    title: 'Inline Citations',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Text Outputs',
    summary: 'Superscript source markers connect generated claims to a compact evidence footer.',
    detail: 'Selecting a marker focuses the matching source while the prose remains continuous and easy to scan.',
    tags: 'AI, Sources, Trust',
  },
  {
    id: 'task-list',
    path: '/vault/ai-task-list',
    title: 'To-do List',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    sourceGroup: 'Structured Outputs',
    summary: 'A collapsible task list shows done, in-progress, and pending work during an agent run.',
    detail: 'The header carries aggregate progress while each row retains its own state, so the component works equally well open or collapsed.',
    tags: 'AI, Tasks, Progress',
  },
] as const satisfies readonly AiCssDefinition[]

export type AiCssId = (typeof AICSS_DEFINITIONS)[number]['id']

export function getAiCssDefinition(path: string) {
  return AICSS_DEFINITIONS.find((component) => component.path === path)
}
