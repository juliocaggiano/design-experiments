import type { VaultCategory } from '../vault-config'

/* Emil Kowalski's skills collection (github.com/emilkowalski/skills, MIT,
   pinned to commit 6bf2443) — one vault card per skill. Definitions only;
   demos and detail rendering live in src/demos/EmilSkillsDemo.tsx and
   src/pages/EmilSkillDetail.tsx. */

export type EmilSkillId =
  | 'emil-design-eng'
  | 'animation-vocabulary'
  | 'apple-design'

export type EmilSkillVariantId =
  | 'button-feedback'
  | 'popover-origin'
  | 'tabular-numbers'
  | 'pop-in'
  | 'rubber-band'
  | 'stagger'
  | 'shimmer'
  | 'interruptible-toggle'
  | 'direct-drag'
  | 'spatial-origin'

export type EmilSkillVariant = {
  id: EmilSkillVariantId
  label: string
  description: string
}

export type EmilSkillDefinition = {
  id: EmilSkillId
  path: string
  title: string
  date: string
  category: VaultCategory
  tags: string
  /* one line for the hero prose — what the skill is, in plain words */
  summary: string
  /* what the specimen demonstrates */
  specimen: string
  defaultVariant: EmilSkillVariantId
  upstream: string
}

const UPSTREAM_BASE = 'https://github.com/emilkowalski/skills/tree/main/skills'

export const EMIL_SKILL_DEFINITIONS: readonly EmilSkillDefinition[] = [
  {
    id: 'apple-design',
    path: '/vault/skill-apple-design',
    title: 'Fluid Interfaces',
    date: 'Jul 16, 2026',
    category: 'Skills',
    tags: 'Springs, Gestures, Apple',
    summary:
      "Apple's approach to fluid, physical motion translated for the web — springs that start from the current value, inherit velocity, and can be grabbed and redirected at any instant. This is the skill the vault's Fluid Cards, Interactive Pop-Up, and Frosted Materials grew out of.",
    specimen:
      'A toggle whose knob rides a real spring: click it mid-flight and it redirects without a jump — interruptible, velocity-preserving motion in its smallest form.',
    defaultVariant: 'interruptible-toggle',
    upstream: `${UPSTREAM_BASE}/apple-design`,
  },
]

/* Absorbed into the Design Engineering umbrella (/vault/skill-design-eng) —
   these no longer produce their own feed cards or routes, but the umbrella
   page renders their specimens, variants, and summaries. */
export const EMIL_SKILL_LIBRARY_DEFINITIONS: readonly EmilSkillDefinition[] = [
  {
    id: 'emil-design-eng',
    path: '/vault/skill-design-eng',
    title: 'Design Engineering Taste',
    date: 'Jul 16, 2026',
    category: 'Skills',
    tags: 'Polish, Craft, Components',
    summary:
      "Emil Kowalski's philosophy of UI polish — the invisible details that make software feel great: durations, easings, optical alignment, tabular numbers, and knowing when not to animate.",
    specimen:
      'A focused save action responds immediately, then replaces its label with a compact confirmation.',
    defaultVariant: 'button-feedback',
    upstream: `${UPSTREAM_BASE}/emil-design-eng`,
  },
  {
    id: 'animation-vocabulary',
    path: '/vault/skill-animation-vocabulary',
    title: 'Animation Vocabulary',
    date: 'Jul 16, 2026',
    category: 'Skills',
    tags: 'Motion, Naming, Glossary',
    summary:
      'A reverse-lookup glossary that turns a vague description of a motion effect into its exact term — so you can name what you want before prompting an AI or briefing a designer.',
    specimen:
      'One named motion effect plays in isolation; the expanded selector reveals the rest of the vocabulary.',
    defaultVariant: 'pop-in',
    upstream: `${UPSTREAM_BASE}/animation-vocabulary`,
  },
]

export const EMIL_SKILL_VARIANTS: Record<EmilSkillId, readonly EmilSkillVariant[]> = {
  'emil-design-eng': [
    { id: 'button-feedback', label: 'Button feedback', description: 'Responsive press feedback and a compact in-place confirmation.' },
    { id: 'popover-origin', label: 'Popover origin', description: 'A popover enters from the control that opened it.' },
    { id: 'tabular-numbers', label: 'Tabular numbers', description: 'Changing numbers keep a stable optical width.' },
  ],
  'animation-vocabulary': [
    { id: 'pop-in', label: 'Pop in', description: 'A compact entrance that combines opacity and scale.' },
    { id: 'rubber-band', label: 'Rubber-banding', description: 'Motion crosses a soft boundary and settles back.' },
    { id: 'stagger', label: 'Stagger', description: 'Related elements arrive in a short sequence.' },
    { id: 'shimmer', label: 'Shimmer', description: 'A highlight travels across an active loading label.' },
  ],
  'apple-design': [
    { id: 'interruptible-toggle', label: 'Interruptible spring', description: 'A spring redirects from its current position and velocity.' },
    { id: 'rubber-band', label: 'Rubber band', description: 'A control resists movement beyond its boundary.' },
    { id: 'direct-drag', label: 'Direct manipulation', description: 'The surface tracks the pointer one-to-one.' },
    { id: 'spatial-origin', label: 'Spatial origin', description: 'A surface expands from the control that invoked it.' },
  ],
}

export function getEmilSkillVariants(id: EmilSkillId) {
  return EMIL_SKILL_VARIANTS[id]
}

export function getEmilSkillDefinition(path: string) {
  return EMIL_SKILL_DEFINITIONS.find((definition) => definition.path === path)
}
