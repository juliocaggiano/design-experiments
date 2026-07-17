import { useState } from 'react'
import { BetterColorsDemo, BetterTypographyDemo, BetterUiDemo } from '../demos/SkillsLab'
import skillsLabSrc from '../demos/SkillsLab.tsx?raw'
import betterColorsSkillSrc from '../content/skills/better-colors/SKILL.md?raw'
import accessibilityContrastSrc from '../content/skills/better-colors/accessibility-contrast.md?raw'
import colorConversionSrc from '../content/skills/better-colors/color-conversion.md?raw'
import gamutTailwindSrc from '../content/skills/better-colors/gamut-and-tailwind.md?raw'
import paletteGenerationSrc from '../content/skills/better-colors/palette-generation.md?raw'
import betterTypographySkillSrc from '../content/skills/better-typography/SKILL.md?raw'
import choosingFontsSrc from '../content/skills/better-typography/choosing-fonts.md?raw'
import cssCheatSheetSrc from '../content/skills/better-typography/css-cheat-sheet.md?raw'
import typographyDetailsSrc from '../content/skills/better-typography/details-and-accessibility.md?raw'
import spacingSizingSrc from '../content/skills/better-typography/spacing-and-sizing.md?raw'
import variableFontsSrc from '../content/skills/better-typography/variable-fonts-and-opentype.md?raw'
import wrappingPunctuationSrc from '../content/skills/better-typography/wrapping-and-punctuation.md?raw'
import betterUiSkillSrc from '../content/skills/better-ui/SKILL.md?raw'
import surfacesSrc from '../content/skills/better-ui/surfaces.md?raw'
import animationsSrc from '../content/skills/better-ui/animations.md?raw'
import performanceSrc from '../content/skills/better-ui/performance.md?raw'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, SliderChip, assembleCopy } from './detail-kit'

const REFERENCES = {
  colors: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-colors',
  typography: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-typography',
  ui: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-ui',
}

const COLOR_PROMPT = `Build an interactive OKLCH palette study. Keep one hue stable while lightness moves evenly from tint to shade, reduce chroma near the gamut edges, and expose hue and chroma as keyboard-accessible controls. Label every step and keep text readable over each color.`

const TYPOGRAPHY_PROMPT = `Build a restrained typography study that makes size, line-height, and measure visible. Pair one characterful headline face with one quiet UI sans, use a tight heading and readable body rhythm, and expose the three variables as keyboard-accessible controls.`

const UI_PROMPT = `Build a small interface-polish study inside an existing light design system. Reuse its page, surface, border, and text tokens; keep a 12px outer radius, a 28px outlined action with an invisible 40px hit area, scale 0.96 on press, and interruptible plus-to-check icon transitions using opacity, scale, and blur. Include reduced-motion behavior and no animation dependency.`

const COLOR_TABS = [
  {
    file: 'palette.ts',
    code: `const lightness = [0.94, 0.79, 0.64, 0.49, 0.32]
const chromaScale = [0.28, 0.62, 0.9, 1, 0.72]

const palette = lightness.map((L, index) => ({
  L,
  C: chroma * chromaScale[index],
  H: hue,
}))

// The hue never drifts. Chroma softens at the pale and dark edges,
// where the displayable sRGB gamut is naturally smaller.`,
  },
  {
    file: 'tokens.css',
    code: `@theme {
  --color-accent-100: oklch(0.94 0.056 264);
  --color-accent-300: oklch(0.79 0.124 264);
  --color-accent-500: oklch(0.64 0.18 264);
  --color-accent-700: oklch(0.49 0.2 264);
  --color-accent-900: oklch(0.32 0.144 264);
}

/* Adjust L for contrast; preserve C and H whenever possible. */`,
  },
]

const TYPOGRAPHY_TABS = [
  {
    file: 'type.css',
    code: `.eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.headline {
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.body {
  max-width: 58ch;
  font-size: 1rem;
  line-height: 1.55;
  text-wrap: pretty;
}`,
  },
  {
    file: 'roles.ts',
    code: `const type = {
  eyebrow: { size: 11, leading: 1, tracking: '0.18em' },
  headline: { size: 52, leading: 1.08, tracking: '-0.035em' },
  body: { size: 16, leading: 1.55, measure: '58ch' },
  caption: { size: 13, leading: 1.4, tabularNumbers: true },
}

// Name values by what they do. A small, explicit scale is easier
// to preserve than a collection of unrelated font sizes.`,
  },
]

const UI_TABS = [
  {
    file: 'surface.css',
    code: `.surface {
  padding: 8px;
  border: 1px solid var(--border-line);
  border-radius: 12px;
  background: var(--bg-surface);
}

.action {
  position: relative;
  height: 28px;
  border: 1px solid var(--border-line);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition-property: transform, border-color, background-color, color;
  transition-duration: 150ms;
}

.action::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
}

.action:active { transform: scale(0.96); }`,
  },
  {
    file: 'icons.css',
    code: `.icon {
  position: absolute;
  inset: 0;
  transition: opacity 200ms, transform 200ms, filter 200ms;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

.icon[data-visible="false"] {
  opacity: 0;
  transform: scale(0.25);
  filter: blur(4px);
}

@media (prefers-reduced-motion: reduce) {
  .icon { transition: none; }
}`,
  },
]

const COLOR_GUIDE_AREAS = [
  ['Conversion', 'Move hex, RGB, and HSL values into OKLCH without changing the surrounding CSS.'],
  ['Palette generation', 'Build even tint-to-shade scales, multi-hue systems, and reversible dark-mode mappings.'],
  ['Contrast', 'Choose readable foregrounds and repair failing pairs by changing perceptual lightness.'],
  ['Gamut and Tailwind', 'Clamp colors safely, add Display P3 enhancements, and define Tailwind v4 theme tokens.'],
]

const COLOR_PRINCIPLES = [
  ['Use perceptual lightness', 'Equal changes to OKLCH L produce roughly equal visual changes, so palette steps feel even across different hues.'],
  ['Keep hue stable', 'Hold H constant through a scale. Unlike HSL, a blue ramp will not quietly drift toward purple as it gets lighter.'],
  ['Treat chroma independently', 'C describes colorfulness, but each hue has a different maximum. Match the percentage of available chroma—not one absolute C—across multiple hues.'],
  ['Avoid pure endpoints', 'Build scales between roughly L 0.05 and 0.95. Pure black and white have no chroma and make colored endpoints collapse.'],
  ['Clamp every palette step', 'Maximum chroma changes with lightness and hue. When a color falls outside the target gamut, reduce C while preserving L and H.'],
  ['Fix contrast with lightness', 'Measure a foreground against its actual background, then move only L. Chroma has negligible effect on contrast.'],
  ['Choose text from the background', 'Treat backgrounds above L 0.6 as light and use dark text; at or below L 0.6, use light text. Verify the final pair.'],
  ['Derive dark mode', 'Reverse the lightness mapping so light tokens become dark and dark tokens become light instead of hand-picking an unrelated second palette.'],
  ['Layer wide-gamut color', 'Ship an sRGB-safe value first, then enhance it inside a color-gamut: p3 media query for displays that can show more chroma.'],
  ['Preserve code during conversion', 'Change color values only. Leave gradient functions, comments, formatting, CSS keywords, and third-party hex requirements intact.'],
]

const COLOR_THRESHOLDS = [
  ['Light background', 'L > 0.60'],
  ['Body on light', 'foreground L < 0.35 when background L > 0.90'],
  ['Body on dark', 'foreground L > 0.90 when background L < 0.25'],
  ['Visible hue drift', 'more than 10° across the scale'],
  ['APCA body text', '|Lc| ≥ 75 minimum · 90 preferred'],
  ['WCAG AA body text', '4.5:1 contrast ratio'],
]

const COLOR_REVIEW_CHECKLIST = [
  'New project colors use OKLCH rather than hex, RGB, or HSL.',
  'Palette lightness steps are evenly distributed and hue stays constant.',
  'Multi-hue palettes match relative chroma, not one absolute C value.',
  'Every high-chroma step has been checked and clamped for its target gamut.',
  'Foreground contrast is measured against the surface it actually sits on.',
  'Contrast repairs adjust L while preserving C and H.',
  'Display P3 colors keep an sRGB fallback.',
  'Dark mode reuses the palette through a reversed lightness mapping.',
  'Tailwind v4 theme colors are defined as OKLCH tokens.',
]

const COLOR_SKILL_FILES = [
  { file: 'SKILL.md', code: betterColorsSkillSrc },
  { file: 'accessibility-contrast.md', code: accessibilityContrastSrc },
  { file: 'color-conversion.md', code: colorConversionSrc },
  { file: 'gamut-and-tailwind.md', code: gamutTailwindSrc },
  { file: 'palette-generation.md', code: paletteGenerationSrc },
]

const TYPOGRAPHY_GUIDE_AREAS = [
  ['Choosing fonts', 'Categories, pairing, anatomy, file formats, and respecting the project’s existing families.'],
  ['Variable fonts', 'Axes, real weights, OpenType features, tabular numbers, and progressive fallbacks.'],
  ['Scale and spacing', 'Semantic sizes, heading hierarchy, tracking, line-height, and optical text trimming.'],
  ['Wrapping', 'Measure, balanced headings, pretty descriptions, truncation, punctuation, and bidirectional text.'],
  ['Details', 'Underlines, selection, form text, decorative treatments, contrast, and font smoothing.'],
  ['CSS lookup', 'Every recommendation mapped to plain CSS and its Tailwind v4 equivalent.'],
]

const TYPOGRAPHY_PRINCIPLES = [
  ['Serve the right format', 'Use WOFF2 on the web. WOFF is only a legacy fallback; TTF and OTF are uncompressed desktop formats.'],
  ['Prefer properties over raw tags', 'Use font-weight, font-optical-sizing, and font-variant-* when they exist. Reserve raw axis or feature tags for custom abilities.'],
  ['Disable fake styles', 'Set font-synthesis: none so a missing weight or italic fails visibly instead of being synthesized by the browser.'],
  ['Keep the palette small', 'Rarely use more than three fonts, and limit weights and sizes. Pair typefaces for clear contrast rather than near-similarity.'],
  ['Name a semantic scale', 'Choose a small set of sizes and reuse it. Team systems benefit from role names such as body-sm instead of names that only describe pixels.'],
  ['Keep headings descending', 'On one page, a lower heading level must not render larger than the level above it. Choose tags from document structure and size them with CSS.'],
  ['Set line-height by role', 'Aim near 1.1 for headings and 1.5–1.6 for body copy. Unitless values continue to scale with the font.'],
  ['Set tracking by size', 'Large headings often need slightly negative tracking; small uppercase labels need positive tracking; body copy usually needs neither.'],
  ['Cap the measure', 'Keep long-form text around 60–75 characters per line—roughly 65ch, max-w-xl, or max-w-2xl at a 16 px body size.'],
  ['Wrap deliberately', 'Balance headings, make short descriptions pretty, break risky links and IDs, and keep badges or labels on one line.'],
  ['Stabilize changing numbers', 'Use tabular numbers for prices, counters, timers, and any value whose changing digit widths would shift the layout.'],
  ['Truncate accessibly', 'Use ellipsis for one line and line-clamp for several, but keep meaningful hidden content available in a tooltip or expanded view.'],
  ['Keep copy natural', 'Store natural casing and style it with text-transform. Use curly quotes, real dashes, a single ellipsis, and non-breaking spaces where meaning requires them.'],
  ['Use font-aware underlines', 'Pull underline position and thickness from the font or tune thickness, offset, and skip-ink. Custom elements are better for complex underline motion.'],
  ['Protect mobile inputs', 'Keep input text at 16 px on mobile so iOS does not zoom the page; reduce it only at wider breakpoints.'],
  ['Respect size and contrast floors', 'Use 16 px for body text, about 14 px for UI controls, 13 px for captions, and rarely less than 12 px. Meet 4.5:1 for regular text.'],
  ['Smooth once at the root', 'Apply antialiased font smoothing on the root layout so macOS rendering stays consistent without repeating the rule.'],
  ['Use logical direction', 'Prefer inline-start and text-align: start, set lang, and add dir=rtl where needed so layout and punctuation support both reading directions.'],
  ['Style selection intentionally', 'Keep selected text legible, disable selection only where it distracts, and leave meaningful content available to copy.'],
]

const TYPOGRAPHY_REVIEW_CHECKLIST = [
  'Web fonts are served as WOFF2.',
  'Common weights, axes, and numeric features use dedicated CSS properties.',
  'font-synthesis is disabled and every used style is genuinely loaded.',
  'Sizes come from a small type scale and heading levels descend visually.',
  'Heading levels follow the document outline without skips.',
  'Headings use tight unitless leading; body copy stays around 1.5–1.6.',
  'Large display text and small uppercase labels use appropriate tracking.',
  'Long-form text stays around 60–75 characters per line.',
  'Headings balance, short descriptions wrap prettily, and long strings can break.',
  'Changing numbers use tabular figures.',
  'Truncated content remains reachable in full.',
  'Copy remains in natural case and uses typographically correct punctuation.',
  'Underlines respect font metrics and avoid cutting through descenders.',
  'Inputs remain at least 16 px on mobile.',
  'Text sizes and contrast meet their accessibility floors.',
  'Font smoothing is applied once on the root layout.',
  'Directional spacing uses logical properties.',
  'Styled text selection remains legible and intentional.',
]

const TYPOGRAPHY_SKILL_FILES = [
  { file: 'SKILL.md', code: betterTypographySkillSrc },
  { file: 'choosing-fonts.md', code: choosingFontsSrc },
  { file: 'css-cheat-sheet.md', code: cssCheatSheetSrc },
  { file: 'details-and-accessibility.md', code: typographyDetailsSrc },
  { file: 'spacing-and-sizing.md', code: spacingSizingSrc },
  { file: 'variable-fonts-and-opentype.md', code: variableFontsSrc },
  { file: 'wrapping-and-punctuation.md', code: wrappingPunctuationSrc },
]

const UI_GUIDE_AREAS = [
  ['Surfaces', 'Radii, optical alignment, shadows, image outlines, and hit areas.'],
  ['Animations', 'Interruptible state changes, staggered entrances, soft exits, icon swaps, and press feedback.'],
  ['Performance', 'Exact transition properties and careful use of GPU compositing hints.'],
]

const UI_PRINCIPLES = [
  ['Concentric border radius', 'For nearby nested surfaces, outer radius equals inner radius plus the padding between them. Past 24 px of padding, treat the layers as separate surfaces.'],
  ['Optical alignment', 'Geometric centering is only a starting point. Shift icons or adjust their SVG when asymmetric weight makes the mathematically centered result look wrong.'],
  ['Shadows over depth borders', 'Use layered transparent shadows when a border is trying to create elevation. Keep real borders for dividers, input outlines, tables, and dense layout separation.'],
  ['Interruptible animations', 'Use CSS transitions for interactive state changes so motion can reverse from its current frame. Save keyframes for staged, one-shot sequences.'],
  ['Split and stagger entrances', 'Animate semantic pieces instead of one large container. A useful rhythm is roughly 100 ms between groups and 80 ms between headline words.'],
  ['Subtle exits', 'Exits should attract less attention than entrances. Favor a short 150 ms fade, blur, and fixed movement of about 12 px.'],
  ['Contextual icon motion', 'Keep both icons mounted. Cross-fade from scale 0.25 to 1, opacity 0 to 1, and blur 4 px to 0 with no bounce.'],
  ['Neutral image outlines', 'Inset a 1 px pure-black outline at 10% in light mode or pure white at 10% in dark mode. Tinted neutrals make image edges look dirty.'],
  ['Scale on press', 'Use 0.96 for tactile press feedback and never go below 0.95. Provide a static option when movement would distract.'],
  ['Skip default-state entrances', 'When using AnimatePresence for toggles or icon swaps, initial={false} prevents the default state from animating on first render.'],
  ['Never transition all', 'List the properties that actually change. This prevents accidental animation and gives the browser a smaller problem to solve.'],
  ['Use will-change sparingly', 'Only add it after observing first-frame stutter, and only for compositor-friendly properties such as transform, opacity, filter, or clip-path.'],
  ['Minimum hit area', 'Use 44 × 44 px for touch and at least 40 × 40 px on desktop. A pseudo-element can expand a smaller visible control without changing its layout.'],
]

const UI_REVIEW_CHECKLIST = [
  'Nested radii are concentric where the surfaces are visually related.',
  'Icons are optically—not only mathematically—centered.',
  'Depth uses shadows; structural separation keeps borders.',
  'Entrances are split and staggered; exits stay softer.',
  'Images use a neutral inset outline.',
  'Pressable controls scale to 0.96 where appropriate.',
  'Default states do not animate on first load.',
  'Transitions name exact properties instead of all.',
  'will-change is limited to observed compositor needs.',
  'Hit areas reach 44 px on touch and 40 px on desktop.',
]

const UI_SKILL_FILES = [
  { file: 'SKILL.md', code: betterUiSkillSrc },
  { file: 'surfaces.md', code: surfacesSrc },
  { file: 'animations.md', code: animationsSrc },
  { file: 'performance.md', code: performanceSrc },
]

function SkillGuide({
  id,
  introTitle,
  intro,
  areas,
  principles,
  checklist,
  thresholds,
}: {
  id: string
  introTitle: string
  intro: string
  areas: string[][]
  principles: string[][]
  checklist: string[]
  thresholds?: string[][]
}) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-5">
      <header className="border-b border-[var(--border-line)] pb-2">
        <h2 id={id} className="font-semibold text-[var(--text-primary)]">The complete guide</h2>
      </header>

      <div className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
        <p className="font-medium text-[var(--text-primary)]">{introTitle}</p>
        <p className="mt-1 text-pretty text-[13px] text-[var(--text-secondary)]">{intro}</p>
      </div>

      <div className={`grid grid-cols-1 gap-2 ${areas.length > 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {areas.map(([title, description]) => (
          <article key={title} className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-3">
            <h3 className="text-[13px] font-medium text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 text-[12px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
          </article>
        ))}
      </div>

      <div>
        <h3 className="pb-2 text-[13px] font-medium text-[var(--text-primary)]">{principles.length} core principles</h3>
        <div className="overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)]">
          {principles.map(([title, description], index) => (
            <article key={title} className="grid gap-1 border-b border-[var(--border-subtle)] p-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-5">
              <h4 className="flex gap-2 text-[13px] font-medium text-[var(--text-primary)]">
                <span className="w-5 shrink-0 font-mono tabular-nums text-[var(--text-tertiary)]">{String(index + 1).padStart(2, '0')}</span>
                <span>{title}</span>
              </h4>
              <p className="pl-7 text-[13px] leading-[1.6] text-[var(--text-secondary)] sm:pl-0">{description}</p>
            </article>
          ))}
        </div>
      </div>

      {thresholds && (
        <div>
          <h3 className="pb-2 text-[13px] font-medium text-[var(--text-primary)]">Key thresholds</h3>
          <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] sm:grid-cols-2">
            {thresholds.map(([label, value]) => (
              <div key={label} className="border-b border-[var(--border-subtle)] p-3 sm:odd:border-r">
                <dt className="text-[12px] text-[var(--text-tertiary)]">{label}</dt>
                <dd className="mt-0.5 font-mono text-[12px] leading-[1.5] text-[var(--text-secondary)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div>
        <h3 className="pb-2 text-[13px] font-medium text-[var(--text-primary)]">Review checklist</h3>
        <ul className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item} className="flex gap-2 border-b border-[var(--border-subtle)] p-3 text-[13px] leading-[1.55] text-[var(--text-secondary)] sm:odd:border-r">
              <span aria-hidden="true" className="mt-[3px] size-3.5 shrink-0 rounded-[4px] border border-[var(--border-ring)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function BetterColorsSkillGuide() {
  return (
    <SkillGuide
      id="better-colors-guide"
      introTitle="Use this to build color systems that stay visually even and readable."
      intro="OKLCH separates perceptual lightness, colorfulness, and hue. That makes conversion, palette generation, contrast repair, gamut handling, and light/dark themes predictable instead of trial and error."
      areas={COLOR_GUIDE_AREAS}
      principles={COLOR_PRINCIPLES}
      checklist={COLOR_REVIEW_CHECKLIST}
      thresholds={COLOR_THRESHOLDS}
    />
  )
}

function BetterTypographySkillGuide() {
  return (
    <SkillGuide
      id="better-typography-guide"
      introTitle="Use this whenever text needs to become clearer, steadier, or easier to maintain."
      intro="The skill moves from font files and feature settings through hierarchy, rhythm, wrapping, punctuation, forms, accessibility, and implementation in the project’s existing styling system."
      areas={TYPOGRAPHY_GUIDE_AREAS}
      principles={TYPOGRAPHY_PRINCIPLES}
      checklist={TYPOGRAPHY_REVIEW_CHECKLIST}
    />
  )
}

function BetterUiSkillGuide() {
  return (
    <section aria-labelledby="better-ui-guide" className="flex min-w-0 flex-col gap-5">
      <header className="border-b border-[var(--border-line)] pb-2">
        <h2 id="better-ui-guide" className="font-semibold text-[var(--text-primary)]">The complete guide</h2>
      </header>

      <div className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
        <p className="font-medium text-[var(--text-primary)]">Use this when an interface works, but still feels off.</p>
        <p className="mt-1 text-pretty text-[13px] text-[var(--text-secondary)]">
          The skill covers component polish, hover states, surfaces, micro-interactions, entrance and exit motion,
          performance hints, and the small alignment decisions that make an interface feel intentional.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {UI_GUIDE_AREAS.map(([title, description]) => (
          <article key={title} className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-3">
            <h3 className="text-[13px] font-medium text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 text-[12px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
          </article>
        ))}
      </div>

      <div>
        <h3 className="pb-2 text-[13px] font-medium text-[var(--text-primary)]">13 core principles</h3>
        <div className="overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)]">
          {UI_PRINCIPLES.map(([title, description], index) => (
            <article key={title} className="grid gap-1 border-b border-[var(--border-subtle)] p-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-5">
              <h4 className="flex gap-2 text-[13px] font-medium text-[var(--text-primary)]">
                <span className="w-5 shrink-0 font-mono tabular-nums text-[var(--text-tertiary)]">{String(index + 1).padStart(2, '0')}</span>
                <span>{title}</span>
              </h4>
              <p className="pl-7 text-[13px] leading-[1.6] text-[var(--text-secondary)] sm:pl-0">{description}</p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="pb-2 text-[13px] font-medium text-[var(--text-primary)]">Review checklist</h3>
        <ul className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] sm:grid-cols-2">
          {UI_REVIEW_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 border-b border-[var(--border-subtle)] p-3 text-[13px] leading-[1.55] text-[var(--text-secondary)] sm:odd:border-r">
              <span aria-hidden="true" className="mt-[3px] size-3.5 shrink-0 rounded-[4px] border border-[var(--border-ring)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function LocalSkillArchive({ slug, files }: { slug: string; files: { file: string; code: string }[] }) {
  return (
    <section data-local-skill={slug} className="flex min-w-0 flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
        <h2 className="font-semibold text-[var(--text-primary)]">Complete skill files</h2>
        <span className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[10px] text-[var(--text-tertiary)]">
          Bundled locally · f8a1574
        </span>
      </header>
      <p className="text-pretty text-[13px] text-[var(--text-secondary)]">
        All {files.length} upstream documents are part of this vault's build. Reading them below never contacts GitHub, and the pinned
        snapshot will remain with this page even if the original repository changes.
      </p>
      <CodeTabs tabs={files} />
    </section>
  )
}

function Reference({ href, label }: { href: string; label: string }) {
  return (
    <section className="flex flex-col gap-3">
      <header className="border-b border-[var(--border-line)] pb-2">
        <h2 className="font-semibold text-[var(--text-primary)]">Reference</h2>
      </header>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] py-2 text-[var(--text-primary)] underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--border-ring)]"
      >
        <span>{label}</span>
        <span aria-hidden="true" className="text-[var(--text-tertiary)]">↗</span>
      </a>
    </section>
  )
}

function CodeAndCredits({
  prompt,
  tabs,
  tags,
  reference,
  referenceLabel,
}: {
  prompt: string
  tabs: { file: string; code: string }[]
  tags: string
  reference: string
  referenceLabel: string
}) {
  return (
    <>
      <section className="flex min-w-0 flex-col gap-3">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
          <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
          <CopyPromptChip text={assembleCopy(prompt, [{ name: 'SkillsLab.tsx', code: skillsLabSrc }])} />
        </header>
        <CodeTabs tabs={tabs} />
      </section>

      <Reference href={reference} label={referenceLabel} />

      <CreditRows
        rows={[
          ['Company', 'CAGGIANO'],
          ['Date', 'Jul 13, 2026'],
          ['Tags', tags],
        ]}
      />

      <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
        <a
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
        >
          MIT
        </a>{' '}
        → free to copy
      </p>
    </>
  )
}

export function BetterColorsDetail() {
  const [hue, setHue] = useState(264)
  const [chroma, setChroma] = useState(0.2)

  return (
    <DetailShell title="Better colors">
      <BetterColorsDemo />

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Most digital color scales become strange at the edges: blue drifts purple, yellow feels brighter than
            everything else, and “50% lightness” means almost nothing. I built this palette around OKLCH so one hue can
            move from tint to shade without losing itself.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The chroma bends down near white and black, where the displayable gamut gets smaller. The result feels even
            before it looks technical—which is generally where I want a color system to land.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => { setHue(264); setChroma(0.2) }}>Reset</ChipButton>
          </header>
          <BetterColorsDemo hue={hue} chroma={chroma} />
          <div className="-mt-5 grid grid-cols-1 gap-3 rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 sm:grid-cols-2">
            <SliderChip label="Hue" min={0} max={360} value={hue} format={(value) => `${Math.round(value)}°`} onChange={(value) => setHue(Math.round(value))} />
            <SliderChip label="Chroma" min={0.04} max={0.28} value={chroma} format={(value) => value.toFixed(2)} onChange={(value) => setChroma(Math.round(value * 100) / 100)} />
          </div>
        </section>

        <BetterColorsSkillGuide />

        <LocalSkillArchive slug="better-colors" files={COLOR_SKILL_FILES} />

        <CodeAndCredits
          prompt={COLOR_PROMPT}
          tabs={COLOR_TABS}
          tags="OKLCH, Palettes, Contrast"
          reference={REFERENCES.colors}
          referenceLabel="jakubkrehel/skills — Better Colors"
        />
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}

export function BetterTypographyDetail() {
  const [size, setSize] = useState(52)
  const [leading, setLeading] = useState(1.08)
  const [measure, setMeasure] = useState(520)

  return (
    <DetailShell title="Better typography">
      <BetterTypographyDemo />

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Good typography is mostly restraint. I wanted to make the quiet variables visible here: a heading that is
            tight without becoming decorative, body copy that has space to breathe, and a line length that lets the eye
            return without searching.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The serif and sans are deliberately different, but everything else stays on a small scale. Change the size,
            leading, or measure below and the composition quickly shows why those three decisions need each other.
          </p>
        </div>

        <BetterTypographySkillGuide />

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => { setSize(52); setLeading(1.08); setMeasure(520) }}>Reset</ChipButton>
          </header>
          <BetterTypographyDemo size={size} leading={leading} measure={measure} />
          <div className="-mt-5 grid grid-cols-1 gap-3 rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 sm:grid-cols-3">
            <SliderChip label="Size" min={32} max={68} value={size} format={(value) => `${Math.round(value)}px`} onChange={(value) => setSize(Math.round(value))} />
            <SliderChip label="Leading" min={0.95} max={1.35} value={leading} format={(value) => value.toFixed(2)} onChange={(value) => setLeading(Math.round(value * 100) / 100)} />
            <SliderChip label="Measure" min={340} max={620} value={measure} format={(value) => `${Math.round(value)}px`} onChange={(value) => setMeasure(Math.round(value))} />
          </div>
        </section>

        <LocalSkillArchive slug="better-typography" files={TYPOGRAPHY_SKILL_FILES} />

        <CodeAndCredits
          prompt={TYPOGRAPHY_PROMPT}
          tabs={TYPOGRAPHY_TABS}
          tags="Typography, Rhythm, Measure"
          reference={REFERENCES.typography}
          referenceLabel="jakubkrehel/skills — Better Typography"
        />
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}

export function BetterUiDetail() {
  return (
    <DetailShell title="Better UI">
      <BetterUiDemo interactive />

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Interfaces rarely feel polished because of one spectacular decision. It is usually the accumulation of
            smaller ones—and, in this vault, the first detail is consistency. The surface, hairline, radius, type, and
            control below all come from the same system as every other experiment.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Press Save: the visible chip gives by four percent while its hit area remains 40 px, then the icons stay
            mounted and trade places through scale, opacity, and blur. Press it again before it finishes and the
            transition simply turns around.
          </p>
        </div>

        <BetterUiSkillGuide />

        <section className="flex min-w-0 flex-col gap-4">
          <header className="border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
          </header>
          <BetterUiDemo interactive />
          <p className="text-pretty text-[13px] text-[var(--text-secondary)]">
            The visible chip stays at the vault's 28 px control height; an invisible 40 px target keeps it easy to use.
          </p>
        </section>

        <LocalSkillArchive slug="better-ui" files={UI_SKILL_FILES} />

        <CodeAndCredits
          prompt={UI_PROMPT}
          tabs={UI_TABS}
          tags="Surfaces, Motion, Micro-interactions"
          reference={REFERENCES.ui}
          referenceLabel="jakubkrehel/skills — Better UI"
        />
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
