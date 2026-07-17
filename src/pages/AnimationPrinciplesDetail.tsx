import { useRef } from 'react'
import {
  AnimationPrinciplesDemo,
  type AnimationPrinciplesControls,
} from '../demos/AnimationPrinciplesDemo'
import demoSrc from '../demos/AnimationPrinciplesDemo.tsx?raw'
import demoCss from '../demos/AnimationPrinciplesDemo.css?raw'
import skillSrc from '../content/skills/12-principles-of-animation/SKILL.md?raw'
import sourceSrc from '../content/skills/12-principles-of-animation/SOURCE.md?raw'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'

const REFERENCE_URL = 'http://www.ui-skills.com/skills/raphaelsalaja/12-principles-of-animation'
const UPSTREAM_URL = 'https://github.com/raphaelsalaja/skill/tree/main/skills/12-principles-of-animation'

const BUILD_PROMPT = `Build an interactive motion-review card that teaches web animation principles in a restrained light design system.

Visual structure:
- Use a white surface, warm-white canvas, hairline gray borders, compact sans typography, quiet shadows, and squircle-like corners.
- Present four selectable categories: Timing, Easing, Physics, and Staging.
- Keep one focal specimen in the stage and show the active rule's value beneath it.
- Reuse one responsive component for the thumbnail, hero, and full implementation.

Interaction:
- Replay every example on demand and loop it gently for passive previews.
- Keep user-triggered motion under 300ms, use ease-out for arrival, a spring only for overshoot, and a dimmed backdrop for staging.
- Give every control a pressed state, keyboard focus, semantic tabs, and reduced-motion behavior.
- Namespace every class so the component can safely live inside a larger design system.`

const RULE_GROUPS = [
  {
    priority: '01',
    title: 'Timing',
    summary: 'Make interaction feedback quick, consistent, and appropriate to the surface.',
    rules: [
      ['timing-under-300ms', 'Finish user-initiated animation within 300ms.'],
      ['timing-consistent', 'Give similar elements identical timing values.'],
      ['timing-no-entrance-context-menu', 'Let context menus appear immediately; animate only their exit.'],
    ],
  },
  {
    priority: '02',
    title: 'Easing',
    summary: 'Match the curve to the direction and reserve linear motion for progress.',
    rules: [
      ['easing-entrance-ease-out', 'Use ease-out for entrances: arrive quickly, then settle.'],
      ['easing-exit-ease-in', 'Use ease-in for exits: gather momentum before leaving.'],
      ['easing-no-linear-motion', 'Use linear easing for progress, not spatial motion.'],
      ['easing-natural-decay', 'Use exponential ramps when audio or energy should decay naturally.'],
    ],
  },
  {
    priority: '03',
    title: 'Physics',
    summary: 'Make surfaces feel responsive without turning subtle feedback into spectacle.',
    rules: [
      ['physics-active-state', 'Give interactive elements a small pressed-scale state.'],
      ['physics-subtle-deformation', 'Keep squash and stretch between 0.95 and 1.05.'],
      ['physics-spring-for-overshoot', 'Use a spring when an element must overshoot and settle.'],
      ['physics-no-excessive-stagger', 'Keep stagger delays at or below 50ms per item.'],
    ],
  },
  {
    priority: '04',
    title: 'Staging',
    summary: 'Control attention through one focal action, clear depth, and deliberate layering.',
    rules: [
      ['staging-one-focal-point', 'Animate only one prominent element at a time.'],
      ['staging-dim-background', 'Dim the background behind a modal or dialog.'],
      ['staging-z-index-hierarchy', 'Keep animated surfaces in the intended stacking order.'],
    ],
  },
] as const

const QUICK_CHECK = [
  ['Duration', 'Is direct-manipulation feedback below 300ms?'],
  ['Curve', 'Does arrival ease out and departure ease in?'],
  ['Physics', 'Is overshoot spring-driven and deformation restrained?'],
  ['Focus', 'Is there one dominant animated subject?'],
  ['Depth', 'Do backdrop and z-index reinforce the intended hierarchy?'],
  ['Access', 'Do reduced motion, keyboard focus, and semantic controls still work?'],
] as const

export function AnimationPrinciplesDetail() {
  const controls = useRef<AnimationPrinciplesControls>({}).current

  return (
    <DetailShell title="12 Principles of Animation">
      <div
        aria-label="Interactive animation principles preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <AnimationPrinciplesDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Natural interface motion is less about adding movement and more about choosing the right duration, curve,
            physics, and focal point. This card turns Raphael Salaja&apos;s web-animation audit skill into a small motion
            inspector you can understand by watching it.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Select a category to compare its behavior, replay the specimen, then use the complete rule guide below when
            reviewing real code. The thumbnail, expanded hero, and implementation all use this same light-mode component.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => controls.replay?.()}>Replay motion</ChipButton>
          </header>
          <div className="relative z-10 h-[520px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[430px]">
            <AnimationPrinciplesDemo controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Choose Timing, Easing, Physics, or Staging. Every example loops automatically and can be replayed on demand.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-5">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Complete guide</h2>
          </header>

          <div className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-hover)] p-4">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Install the upstream skill</span>
            <code className="mt-2 block overflow-x-auto font-mono text-[12px] leading-[1.6] text-[var(--text-body)]">
              npx skills add https://github.com/raphaelsalaja/skill --skill 12-principles-of-animation
            </code>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RULE_GROUPS.map((group) => (
              <article key={group.title} className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Priority {group.priority}</span>
                    <h3 className="mt-1 font-semibold text-[var(--text-primary)]">{group.title}</h3>
                  </div>
                  <span className="rounded-md bg-[var(--bg-hover)] px-2 py-1 font-mono text-[10px] tabular-nums text-[var(--text-tertiary)]">
                    {group.rules.length} rules
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-[1.55] text-[var(--text-secondary)]">{group.summary}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {RULE_GROUPS.map((group) => (
              <section key={group.title} className="min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">{group.title} rules</h3>
                <div className="mt-2 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
                  {group.rules.map(([id, description]) => (
                    <article key={id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-4">
                      <code className="font-mono text-[11px] text-[var(--text-secondary)]">{id}</code>
                      <p className="text-[13px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <article className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
            <h3 className="font-semibold text-[var(--text-primary)]">How to run an audit</h3>
            <ol className="mt-2 space-y-2 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              <li><span className="mr-2 font-mono text-[10px] text-[var(--text-tertiary)]">01</span>Read the animation files or select the pattern you want reviewed.</li>
              <li><span className="mr-2 font-mono text-[10px] text-[var(--text-tertiary)]">02</span>Check every rule in priority order: Timing, Easing, Physics, then Staging.</li>
              <li><span className="mr-2 font-mono text-[10px] text-[var(--text-tertiary)]">03</span>Return each finding as <code className="font-mono text-[11px] text-[var(--text-body)]">file:line - [rule-id] description</code>.</li>
              <li><span className="mr-2 font-mono text-[10px] text-[var(--text-tertiary)]">04</span>Finish with a summary table grouped by rule, count, and severity.</li>
            </ol>
          </article>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Fast review checklist</h3>
            <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {QUICK_CHECK.map(([label, question]) => (
                <article key={label} className="border-b border-[var(--border-subtle)] py-3">
                  <span className="text-[11px] font-medium text-[var(--text-primary)]">{label}</span>
                  <p className="mt-1 text-[13px] leading-[1.55] text-[var(--text-secondary)]">{question}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Local skill archive</h2>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Pinned upstream snapshot · complete and readable offline</p>
            </div>
          </header>
          <CodeTabs tabs={[
            { file: 'SKILL.md', code: skillSrc },
            { file: 'SOURCE.md', code: sourceSrc },
          ]} />
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'AnimationPrinciplesDemo.tsx', code: demoSrc },
              { name: 'AnimationPrinciplesDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'AnimationPrinciplesDemo.tsx', code: demoSrc },
            { file: 'AnimationPrinciplesDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 15, 2026'],
            ['Tags', 'Motion, Animation, Interface quality'],
            ['Skill author', 'Raphael Salaja'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Reference:{' '}
          <a href={REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]">UI Skills</a>
          {' · '}
          <a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]">Raphael Salaja source</a>
          {' · MIT (declared upstream)'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
