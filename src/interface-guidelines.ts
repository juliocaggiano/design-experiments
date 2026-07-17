export type InterfaceGuidelineCategoryId =
  | 'interactivity'
  | 'typography'
  | 'motion'
  | 'touch'
  | 'optimizations'
  | 'accessibility'
  | 'design'

export type InterfaceGuideline = {
  id: string
  title: string
  detail: string
}

export type InterfaceGuidelineCategory = {
  id: InterfaceGuidelineCategoryId
  label: string
  summary: string
  rules: readonly InterfaceGuideline[]
}

export const INTERFACE_GUIDELINE_CATEGORIES: readonly InterfaceGuidelineCategory[] = [
  {
    id: 'interactivity',
    label: 'Interactivity',
    summary: 'Make native behavior effortless before adding custom behavior.',
    rules: [
      { id: 'label-focus', title: 'Labels focus fields', detail: 'Associate every visible input label with its control.' },
      { id: 'enter-submit', title: 'Enter submits forms', detail: 'Wrap related inputs in a form and preserve native submission.' },
      { id: 'correct-input', title: 'Use the correct input type', detail: 'Choose email, password, URL, and other semantic input types.' },
      { id: 'native-validation', title: 'Use native validation', detail: 'Apply required and appropriate constraints before custom error logic.' },
      { id: 'input-decoration', title: 'Decorations focus the input', detail: 'Overlay prefixes and suffixes without creating a separate dead target.' },
      { id: 'instant-toggle', title: 'Toggles act immediately', detail: 'A switch should not require a second confirmation action.' },
      { id: 'submission-lock', title: 'Prevent duplicate submission', detail: 'Disable or otherwise lock the submit action while work is pending.' },
      { id: 'no-dead-zones', title: 'Remove dead zones', detail: 'Use generous item padding so lists feel continuously interactive.' },
      { id: 'decorative-pointer', title: 'Decoration ignores pointers', detail: 'Glows and visual overlays should never intercept interaction.' },
    ],
  },
  {
    id: 'typography',
    label: 'Typography',
    summary: 'Keep type stable, legible, and resistant to layout movement.',
    rules: [
      { id: 'font-rendering', title: 'Optimize font rendering', detail: 'Use antialiasing and optimizeLegibility where they improve the face.' },
      { id: 'subset-fonts', title: 'Ship only needed glyphs', detail: 'Subset fonts for the languages and characters the product actually uses.' },
      { id: 'stable-weight', title: 'Keep weight stable', detail: 'Hover and selected states should not change weight and shift layout.' },
      { id: 'readable-weight', title: 'Avoid fragile light weights', detail: 'Body text should remain at 400 or above; medium headings often suit 500–600.' },
      { id: 'fluid-type', title: 'Scale type fluidly', detail: 'Use clamp when a value should respond smoothly rather than jump at breakpoints.' },
      { id: 'tabular-figures', title: 'Use tabular figures', detail: 'Timers, tables, and counters should not move as their numbers change.' },
      { id: 'ios-text-size', title: 'Protect iOS text sizing', detail: 'Prevent unexpected landscape resizing with text-size-adjust.' },
    ],
  },
  {
    id: 'motion',
    label: 'Motion',
    summary: 'Use motion to preserve continuity without delaying familiar actions.',
    rules: [
      { id: 'theme-transition', title: 'Theme changes are instant', detail: 'Temporarily suppress interaction transitions during theme switching.' },
      { id: 'motion-speed', title: 'Keep interactions under 200ms', detail: 'Frequent UI responses should feel immediate rather than cinematic.' },
      { id: 'proportional-motion', title: 'Scale motion proportionally', detail: 'Small triggers need small scale deltas; dialogs should begin near their final size.' },
      { id: 'novelty-budget', title: 'Spend novelty carefully', detail: 'Menus, list edits, and trivial hovers usually need little or no entrance motion.' },
      { id: 'offscreen-pause', title: 'Pause off-screen loops', detail: 'Stop or unmount recurring animation when its surface is no longer visible.' },
      { id: 'anchor-offset', title: 'Smooth anchors land correctly', detail: 'Pair smooth in-page navigation with an offset for sticky interface chrome.' },
    ],
  },
  {
    id: 'touch',
    label: 'Touch',
    summary: 'Treat touch as its own input model, not a mouse with fewer buttons.',
    rules: [
      { id: 'hover-capability', title: 'Gate hover by capability', detail: 'Only show hover styling when the device can actually hover.' },
      { id: 'input-sixteen', title: 'Inputs stay at 16px', detail: 'Prevent surprise iOS zoom by keeping editable text large enough.' },
      { id: 'touch-autofocus', title: 'Avoid touch autofocus', detail: 'Do not summon the keyboard before the user has chosen to edit.' },
      { id: 'ios-video', title: 'Prepare video for iOS', detail: 'Muted, inline playback is required for reliable autoplay behavior.' },
      { id: 'gesture-action', title: 'Own custom gestures', detail: 'Disable conflicting native touch actions only on true pan or zoom surfaces.' },
      { id: 'tap-feedback', title: 'Replace tap highlight', detail: 'If the browser highlight is removed, provide an intentional pressed state.' },
    ],
  },
  {
    id: 'optimizations',
    label: 'Optimizations',
    summary: 'Spend rendering work only while it creates visible value.',
    rules: [
      { id: 'blur-budget', title: 'Budget blur carefully', detail: 'Large filter and backdrop blur radii can become expensive quickly.' },
      { id: 'gradient-banding', title: 'Avoid blurred rectangles', detail: 'Use radial gradients for soft glows to reduce visible banding.' },
      { id: 'gpu-sparing', title: 'Promote layers sparingly', detail: 'TranslateZ is a targeted escape hatch, not a global performance switch.' },
      { id: 'will-change', title: 'Toggle will-change briefly', detail: 'Enable it only around the animation that proved it needs help.' },
      { id: 'offscreen-media', title: 'Pause invisible media', detail: 'Too many unseen videos or animations can overwhelm mobile devices.' },
      { id: 'realtime-refs', title: 'Bypass renders when justified', detail: 'High-frequency pointer or wheel values may belong in refs and direct DOM updates.' },
      { id: 'adaptive-device', title: 'Adapt to device capability', detail: 'Network and hardware constraints should influence expensive experiences.' },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    summary: 'Make every state understandable without relying on a pointer or sight.',
    rules: [
      { id: 'disabled-tooltip', title: 'Do not tooltip disabled controls', detail: 'Disabled controls leave the tab order, so their explanation becomes unreachable.' },
      { id: 'focus-ring', title: 'Focus follows the shape', detail: 'Use a box-shadow ring so rounded controls retain rounded focus feedback.' },
      { id: 'arrow-navigation', title: 'Lists support arrow keys', detail: 'Sequential focusable items should be traversable with Up and Down.' },
      { id: 'keyboard-delete', title: 'Lists support keyboard deletion', detail: 'Provide an intentional keyboard path for removing the focused item.' },
      { id: 'press-menu', title: 'Menus respond on press', detail: 'Open high-frequency menus on pointer down when immediate response matters.' },
      { id: 'theme-favicon', title: 'Favicons respect theme', detail: 'An SVG favicon can adapt its own color to the system appearance.' },
      { id: 'icon-label', title: 'Icon buttons have names', detail: 'Every icon-only control needs an explicit accessible label.' },
      { id: 'tooltip-static', title: 'Tooltips stay non-interactive', detail: 'Hover explanations should not contain controls the keyboard cannot reach.' },
      { id: 'semantic-image', title: 'Images use image elements', detail: 'Preserve screen-reader semantics and native image actions.' },
      { id: 'illustration-label', title: 'HTML illustrations are named', detail: 'Hide decorative internals behind one useful accessible label.' },
      { id: 'selection-readable', title: 'Selection remains readable', detail: 'Gradient text should fall back to a solid color while selected.' },
      { id: 'prediction-cone', title: 'Nested menus forgive travel', detail: 'Protect the pointer path between a submenu trigger and its content.' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    summary: 'Put feedback beside the thing that changed and keep the next action obvious.',
    rules: [
      { id: 'optimistic-data', title: 'Update optimistically', detail: 'Reflect likely success immediately, then roll back with clear feedback on failure.' },
      { id: 'server-auth', title: 'Redirect before paint', detail: 'Resolve authentication on the server to avoid client-side route flicker.' },
      { id: 'styled-selection', title: 'Style text selection', detail: 'Selection is part of the interface and should remain intentional and legible.' },
      { id: 'local-feedback', title: 'Feedback stays local', detail: 'Copy success belongs inside the copy control; field errors belong on the field.' },
      { id: 'productive-empty', title: 'Empty states create momentum', detail: 'Offer a meaningful create action and templates when useful.' },
    ],
  },
]

export function getInterfaceGuidelineCategory(id: InterfaceGuidelineCategoryId) {
  return INTERFACE_GUIDELINE_CATEGORIES.find((category) => category.id === id)
    ?? INTERFACE_GUIDELINE_CATEGORIES[0]
}
