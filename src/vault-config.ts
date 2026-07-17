import { TRANSITION_DEFINITIONS } from './transitions/catalog'
import { AICSS_DEFINITIONS } from './aicss/catalog'
import { EMIL_SKILL_DEFINITIONS } from './emilskills/catalog'
import { SHADCN_DEFINITIONS } from './shadcn/catalog'

export const VAULT_CATEGORIES = ['Skills', 'Interactions', 'Motion', 'Interfaces'] as const

export type VaultCategory = (typeof VAULT_CATEGORIES)[number]

export type VaultItem = {
  path: string
  title: string
  date: string
  category: VaultCategory
}

export const VAULT_ITEMS: readonly VaultItem[] = [
  { path: '/vault/meeting-overlay', title: 'Stop missing your meetings', date: 'Jul 8, 2026', category: 'Motion' },
  { path: '/vault/reactive-dither', title: 'Reactive Dither', date: 'Jul 18, 2026', category: 'Motion' },
  { path: '/vault/gradient-spin', title: 'Gradient Spin', date: 'Jul 16, 2026', category: 'Motion' },
  { path: '/vault/scribble-index', title: 'Scribble Index', date: 'Jul 16, 2026', category: 'Interactions' },
  ...EMIL_SKILL_DEFINITIONS.map(({ path, title, date, category }) => ({ path, title, date, category })),
  { path: '/vault/sonner', title: 'Toast Notifications', date: 'Jul 16, 2026', category: 'Interactions' },
  ...SHADCN_DEFINITIONS.map(({ path, title, date, category }) => ({ path, title, date, category })),
  { path: '/vault/interface-guidelines', title: 'Interface Craft Guidelines', date: 'Jul 16, 2026', category: 'Skills' },
  { path: '/vault/animation-principles', title: '12 Principles of Animation', date: 'Jul 15, 2026', category: 'Motion' },
  ...TRANSITION_DEFINITIONS.map(({ path, title, date, category }) => ({ path, title, date, category })),
  ...AICSS_DEFINITIONS.map(({ path, title, date, category }) => ({ path, title, date, category })),
  { path: '/vault/playwright-cli', title: 'Playwright CLI', date: 'Jul 15, 2026', category: 'Skills' },
  { path: '/vault/cuelume', title: 'Interaction Sounds', date: 'Jul 15, 2026', category: 'Interactions' },
  { path: '/vault/border-beam', title: 'Gemini Button', date: 'Jul 14, 2026', category: 'Interactions' },
  { path: '/vault/chief-keef-index', title: 'Scroll Gallery', date: 'Jul 14, 2026', category: 'Interfaces' },
  { path: '/vault/micro-buttons', title: 'Micro Interactions', date: 'Jul 14, 2026', category: 'Interactions' },
  { path: '/vault/better-colors', title: 'Cohesive Color Systems', date: 'Jul 13, 2026', category: 'Skills' },
  { path: '/vault/better-typography', title: 'Typography Skills', date: 'Jul 13, 2026', category: 'Skills' },
  { path: '/vault/better-ui', title: 'Better UI', date: 'Jul 13, 2026', category: 'Skills' },
  { path: '/vault/knockout-bracket', title: 'Road Cup Knockout', date: 'Jul 12, 2026', category: 'Interfaces' },
  { path: '/vault/bottom-sheet', title: 'Interactive Pop-Up', date: 'Jul 12, 2026', category: 'Interactions' },
  { path: '/vault/fluid-springs', title: 'Fluid Cards', date: 'Jul 12, 2026', category: 'Motion' },
]

export function getVaultItem(path: string) {
  return VAULT_ITEMS.find((item) => item.path === path)
}

export function getVaultNeighbors(path: string) {
  const index = VAULT_ITEMS.findIndex((item) => item.path === path)
  if (index < 0) return null

  return {
    previous: VAULT_ITEMS[(index - 1 + VAULT_ITEMS.length) % VAULT_ITEMS.length],
    next: VAULT_ITEMS[(index + 1) % VAULT_ITEMS.length],
  }
}

export function categoryHref(category: VaultCategory) {
  return `/?category=${category.toLowerCase()}`
}

export function categoryFromSearch(search: string): VaultCategory | 'All' {
  const value = new URLSearchParams(search).get('category')
  return VAULT_CATEGORIES.find((category) => category.toLowerCase() === value) ?? 'All'
}
