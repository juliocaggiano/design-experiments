export type TransitionCategory = 'Interactions' | 'Motion' | 'Interfaces'

export type TransitionDefinition = {
  id: string
  path: string
  title: string
  date: string
  category: TransitionCategory
  summary: string
  detail: string
  tags: string
}

export const TRANSITION_DEFINITIONS = [
  {
    id: 'card-resize',
    path: '/vault/card-resize',
    title: 'Card resize',
    date: 'Jul 15, 2026',
    category: 'Motion',
    summary: 'A material card changes dimensions without snapping its contents.',
    detail: 'Width and height settle together, so the surface reads as one continuous object instead of two layouts being swapped.',
    tags: 'Layout, Resize, Continuity',
  },
  {
    id: 'number-pop-in',
    path: '/vault/number-pop-in',
    title: 'Number pop-in',
    date: 'Jul 15, 2026',
    category: 'Motion',
    summary: 'Changing digits rise, unblur, and settle with a small decimal stagger.',
    detail: 'The old value leaves first and the new value arrives by character, keeping rapidly changing metrics legible.',
    tags: 'Numbers, Stagger, Feedback',
  },
  {
    id: 'notification-badge',
    path: '/vault/notification-badge',
    title: 'Notification badge',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'A notification count enters diagonally and lands with a compact spring.',
    detail: 'Translation, blur, opacity, and scale share one visual destination while the exit stays deliberately quieter.',
    tags: 'Notification, Spring, Status',
  },
  {
    id: 'text-states-swap',
    path: '/vault/text-states-swap',
    title: 'Text states swap',
    date: 'Jul 15, 2026',
    category: 'Motion',
    summary: 'Status copy trades places through directional blur and offset.',
    detail: 'The outgoing and incoming labels use opposite travel so the interface communicates progression, not a flicker.',
    tags: 'Text, Status, Crossfade',
  },
  {
    id: 'menu-dropdown',
    path: '/vault/menu-dropdown',
    title: 'Menu dropdown',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'A compact menu opens from the trigger that caused it.',
    detail: 'The surface scales from its top-center origin on entry and closes faster, preserving the trigger-to-menu relationship.',
    tags: 'Menu, Origin, Disclosure',
  },
  {
    id: 'icon-swap',
    path: '/vault/icon-swap',
    title: 'Icon swap',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'Two related symbols exchange through scale, blur, and opacity.',
    detail: 'Both icons occupy the same optical box, so the swap changes meaning without disturbing the button geometry.',
    tags: 'Icon, Morph, Control',
  },
  {
    id: 'error-state-shake',
    path: '/vault/error-state-shake',
    title: 'Error state shake',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'An invalid field uses a short four-phase shake and inline message.',
    detail: 'The motion is brief enough to direct attention without blocking correction, and typing clears the state immediately.',
    tags: 'Form, Error, Shake',
  },
  {
    id: 'skeleton-loader-reveal',
    path: '/vault/skeleton-loader-reveal',
    title: 'Loading frame and reveal',
    date: 'Jul 15, 2026',
    category: 'Interfaces',
    summary: 'A pulsing placeholder crossfades into a compact profile row.',
    detail: 'The skeleton and content share one silhouette, so loading resolves in place instead of causing a layout jump.',
    tags: 'Loading, Skeleton, Crossfade',
  },
  {
    id: 'tabs-sliding',
    path: '/vault/tabs-sliding',
    title: 'Tabs sliding',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'A single pill follows Plan, Debug, and Ask without remounting.',
    detail: 'The continuous indicator preserves selection history and supports click plus arrow-key navigation.',
    tags: 'Tabs, Indicator, Navigation',
  },
  {
    id: 'shimmer-text',
    path: '/vault/shimmer-text',
    title: 'Thinking text',
    date: 'Jul 15, 2026',
    category: 'Motion',
    summary: 'A masked highlight sweeps across an in-progress label.',
    detail: 'The shimmer is deliberately limited to an active state and stops entirely when reduced motion is requested.',
    tags: 'Text, Loading, Gradient',
  },
  {
    id: 'tooltip-open-close',
    path: '/vault/tooltip-open-close',
    title: 'Tooltip open/close',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'A tooltip appears after a short intent delay and exits immediately.',
    detail: 'Hover and keyboard focus share the same surface, while asymmetric timing prevents a trail of lingering tooltips.',
    tags: 'Tooltip, Hover, Focus',
  },
  {
    id: 'accordion',
    path: '/vault/accordion',
    title: 'Accordion',
    date: 'Jul 15, 2026',
    category: 'Interactions',
    summary: 'An accordion interpolates its grid row while the chevron turns.',
    detail: 'Padding stays on the inner panel so the outer track can collapse fully without the common residual gap.',
    tags: 'Accordion, Disclosure, Layout',
  },
] as const satisfies readonly TransitionDefinition[]

export type TransitionId = (typeof TRANSITION_DEFINITIONS)[number]['id']

export function getTransitionDefinition(path: string) {
  return TRANSITION_DEFINITIONS.find((transition) => transition.path === path)
}
