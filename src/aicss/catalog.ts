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
    id: 'thinking-state',
    path: '/vault/thinking-state',
    title: 'Thinking State',
    date: 'Jul 15, 2026',
    category: 'Motion',
    sourceGroup: 'Thinking & Reasoning',
    summary: 'A restrained shimmer signals that an assistant is preparing its answer.',
    detail: 'The label stays quiet enough to sit inline with a conversation while its moving highlight makes the active state unmistakable.',
    tags: 'AI, Loading, Shimmer',
  },
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
    id: 'file-diff',
    path: '/vault/ai-file-diff',
    title: 'File Diff',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Tool & Action States',
    summary: 'A compact inline diff makes an assistant’s proposed file edit reviewable at a glance.',
    detail: 'Additions, deletions, line numbers, and the file summary share one contained surface that can expand without moving into a separate editor.',
    tags: 'AI, Code, Review',
  },
  {
    id: 'image-generation',
    path: '/vault/ai-image-generation',
    title: 'Image Generation',
    date: 'Jul 15, 2026',
    category: 'Motion',
    sourceGroup: 'Tool & Action States',
    summary: 'A luminous placeholder keeps an image request tangible while generation is in progress.',
    detail: 'The same frame resolves into the finished artwork, preserving dimensions and preventing a disruptive layout jump.',
    tags: 'AI, Image, Loading',
  },
  {
    id: 'text-response',
    path: '/vault/ai-text-response',
    title: 'Text Response',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Text Outputs',
    summary: 'Editorial response styles give assistant prose, emphasis, and inline code a calm shared rhythm.',
    detail: 'The treatment is intentionally plain: readable measure, clear paragraph spacing, and code that is distinct without becoming a badge wall.',
    tags: 'AI, Typography, Response',
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
    id: 'code-block',
    path: '/vault/ai-code-block',
    title: 'Code Block',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Text Outputs',
    summary: 'A quiet code surface combines a file label, syntax hierarchy, and one-click copy feedback.',
    detail: 'The command stays readable in a conversation while the utility action confirms itself in place instead of adding a toast.',
    tags: 'AI, Code, Copy',
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
  {
    id: 'data-table',
    path: '/vault/ai-data-table',
    title: 'Data Table',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Structured Outputs',
    summary: 'A compact sortable table keeps structured assistant results scannable.',
    detail: 'Numeric values align consistently, headers remain actionable, and the frame degrades to horizontal scrolling on small surfaces.',
    tags: 'AI, Data, Table',
  },
  {
    id: 'comparison-table',
    path: '/vault/ai-comparison-table',
    title: 'Comparison Table',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    sourceGroup: 'Structured Outputs',
    summary: 'A feature matrix makes plan differences legible with checks, dashes, and a movable emphasis column.',
    detail: 'Selecting a plan highlights the complete column rather than repeating decorative cards around every cell.',
    tags: 'AI, Compare, Table',
  },
] as const satisfies readonly AiCssDefinition[]

export type AiCssId = (typeof AICSS_DEFINITIONS)[number]['id']

export function getAiCssDefinition(path: string) {
  return AICSS_DEFINITIONS.find((component) => component.path === path)
}
