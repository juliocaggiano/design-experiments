import type { VaultCategory } from '../vault-config'

export type ShadcnId =
  | 'attachment'
  | 'calendar'
  | 'card'
  | 'carousel'
  | 'chart'
  | 'breadcrumb'
  | 'bubble'
  | 'button-group'
  | 'command'

export type ShadcnDefinition = {
  id: ShadcnId
  path: string
  title: string
  date: string
  category: VaultCategory
  summary: string
  detail: string
  tags: string
  sourceUrl: string
}

const DOCS_ROOT = 'https://ui.shadcn.com/docs/components/base'

export const SHADCN_DEFINITIONS = [
  {
    id: 'attachment',
    path: '/vault/shadcn-attachment',
    title: 'Attachment',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The attachment demo combines a responsive image strip with uploading and completed file rows.',
    detail: 'It preserves the base-rhea anatomy while adding full image previews, working upload cancellation, and direct file removal.',
    tags: 'Files, Upload, Status',
    sourceUrl: `${DOCS_ROOT}/attachment`,
  },
  {
    id: 'calendar',
    path: '/vault/shadcn-calendar',
    title: 'Calendar',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The official calendar demo presents a bordered single-date picker with month and year dropdowns.',
    detail: 'It uses the current date, outside days, compact base-nova navigation, and the original selected-day behavior.',
    tags: 'Date, Selection, Calendar',
    sourceUrl: `${DOCS_ROOT}/calendar`,
  },
  {
    id: 'card',
    path: '/vault/shadcn-card',
    title: 'Card',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The official card demo is the complete login surface shown in the Shadcn documentation.',
    detail: 'Its title, description, sign-up action, email and password fields, forgot-password link, and two footer actions are kept intact.',
    tags: 'Surface, Composition, Form',
    sourceUrl: `${DOCS_ROOT}/card`,
  },
  {
    id: 'carousel',
    path: '/vault/shadcn-carousel',
    title: 'Carousel',
    date: 'Jul 16, 2026',
    category: 'Interactions',
    summary: 'The official carousel demo is a five-slide numbered track with previous and next controls.',
    detail: 'It uses the original square cards, Embla dragging and snapping, disabled boundary states, and circular base-nova arrow buttons.',
    tags: 'Carousel, Swipe, Navigation',
    sourceUrl: `${DOCS_ROOT}/carousel`,
  },
  {
    id: 'chart',
    path: '/vault/shadcn-chart',
    title: 'Chart',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The official interactive bar chart switches between desktop and mobile visitor totals.',
    detail: 'It preserves the thirty-day source dataset, active total controls, axis formatting, tooltip content, and blue Shadcn chart colors.',
    tags: 'Data, Tooltip, Visualization',
    sourceUrl: `${DOCS_ROOT}/chart`,
  },
  {
    id: 'breadcrumb',
    path: '/vault/shadcn-breadcrumb',
    title: 'Breadcrumb',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The official breadcrumb demo shows Home, a collapsed overflow menu, Components, and the current page.',
    detail: 'The original separators, muted link styling, ellipsis trigger, and Documentation, Themes, and GitHub menu items remain unchanged.',
    tags: 'Navigation, Hierarchy, Overflow',
    sourceUrl: `${DOCS_ROOT}/breadcrumb`,
  },
  {
    id: 'bubble',
    path: '/vault/shadcn-bubble',
    title: 'Bubble',
    date: 'Jul 16, 2026',
    category: 'Interfaces',
    summary: 'The official bubble demo reproduces the complete four-part conversation and reaction states.',
    detail: 'It uses base-rhea alignment, grouped muted messages, exact copy, pill geometry, and the original emoji reaction clusters.',
    tags: 'Chat, Message, Reaction',
    sourceUrl: `${DOCS_ROOT}/bubble`,
  },
  {
    id: 'button-group',
    path: '/vault/shadcn-button-group',
    title: 'Button Group',
    date: 'Jul 16, 2026',
    category: 'Interactions',
    summary: 'The official button-group demo joins back, archive, report, snooze, and overflow actions.',
    detail: 'Its dropdown preserves the mail actions, label submenu with radio selection, destructive trash action, and responsive back button.',
    tags: 'Buttons, Grouping, Action',
    sourceUrl: `${DOCS_ROOT}/button-group`,
  },
  {
    id: 'command',
    path: '/vault/shadcn-command',
    title: 'Command',
    date: 'Jul 16, 2026',
    category: 'Interactions',
    summary: 'The official command demo combines a searchable input with Suggestions and Settings groups.',
    detail: 'Calendar, Search Emoji, disabled Calculator, Profile, Billing, Settings, and the original keyboard shortcuts are reproduced verbatim.',
    tags: 'Command, Search, Keyboard',
    sourceUrl: `${DOCS_ROOT}/command`,
  },
] as const satisfies readonly ShadcnDefinition[]

export function getShadcnDefinition(path: string) {
  return SHADCN_DEFINITIONS.find((definition) => definition.path === path)
}
