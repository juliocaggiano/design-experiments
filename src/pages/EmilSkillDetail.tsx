import { useRef, useState } from 'react'
import { EmilSkillsDemo, type EmilSkillsControls } from '../demos/EmilSkillsDemo'
import {
  getEmilSkillVariants,
  type EmilSkillDefinition,
  type EmilSkillId,
  type EmilSkillVariantId,
} from '../emilskills/catalog'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/EmilSkillsDemo.tsx?raw'
import demoCss from '../demos/EmilSkillsDemo.css?raw'
import designEngSkill from '../content/skills/emil/emil-design-eng/SKILL.md?raw'
import vocabularySkill from '../content/skills/emil/animation-vocabulary/SKILL.md?raw'
import improveSkill from '../content/skills/emil/improve-animations/SKILL.md?raw'
import opportunitiesSkill from '../content/skills/emil/find-animation-opportunities/SKILL.md?raw'
import reviewSkill from '../content/skills/emil/review-animations/SKILL.md?raw'
import appleSkill from '../content/skills/emil/apple-design/SKILL.md?raw'
import designEngSource from '../content/skills/emil/emil-design-eng/SOURCE.md?raw'
import vocabularySource from '../content/skills/emil/animation-vocabulary/SOURCE.md?raw'
import improveSource from '../content/skills/emil/improve-animations/SOURCE.md?raw'
import opportunitiesSource from '../content/skills/emil/find-animation-opportunities/SOURCE.md?raw'
import reviewSource from '../content/skills/emil/review-animations/SOURCE.md?raw'
import appleSource from '../content/skills/emil/apple-design/SOURCE.md?raw'
import licenseSrc from '../content/skills/emil/emil-design-eng/LICENSE?raw'

/* One detail page renders all six Emil skill cards, driven by the catalog.
   The skill files are verbatim MIT-licensed snapshots (commit 6bf2443) —
   bundled with their license and source records, following the vault's
   skills-collection convention. */

const SKILL_TEXT: Record<EmilSkillId, string> = {
  'emil-design-eng': designEngSkill,
  'animation-vocabulary': vocabularySkill,
  'improve-animations': improveSkill,
  'find-animation-opportunities': opportunitiesSkill,
  'review-animations': reviewSkill,
  'apple-design': appleSkill,
}

const SOURCE_TEXT: Record<EmilSkillId, string> = {
  'emil-design-eng': designEngSource,
  'animation-vocabulary': vocabularySource,
  'improve-animations': improveSource,
  'find-animation-opportunities': opportunitiesSource,
  'review-animations': reviewSource,
  'apple-design': appleSource,
}

/* what the copy chip in the Skill section ships: install steps + the full
   MIT-licensed skill text with its license notice */
function installPayload(definition: EmilSkillDefinition) {
  return [
    `Install the "${definition.id}" skill for Claude Code (or any agent that reads skill files):`,
    '',
    `1. Create the folder .claude/skills/${definition.id}/ in your project (or ~/.claude/skills/${definition.id}/ for all projects).`,
    '2. Save the SKILL.md below into that folder, unchanged.',
    '3. Start a new session — the skill is picked up automatically from its description.',
    '',
    `Source: ${definition.upstream} (MIT license, © Emil Kowalski, pinned commit 6bf2443). The license text is included in the repository; keep the attribution when redistributing.`,
    '',
    '--- SKILL.md ---',
    '',
    SKILL_TEXT[definition.id],
  ].join('\n')
}

const BUILD_PROMPT_BASE = `Build a compact interactive specimen card for a design-engineering skill, in React and CSS on a restrained light design system (white surfaces, hairline gray borders, one accent).

Requirements shared by the collection:
- The feed thumbnail demonstrates one focused interaction only. It contains no explanatory report, selector, or technical caption.
- The expanded implementation exposes related examples through one labelled native selector.
- The same component renders both surfaces, with a focused default variant for the thumbnail and selectable variants in the expanded page.
- Compact autoplay begins only when at least 35% of the thumbnail enters view, stops offscreen, and replays on re-entry.
- Under prefers-reduced-motion, resolve directly to the settled end state instead of scheduling animation.
- Clicking inside the specimen must not trigger the surrounding card link (preventDefault + stopPropagation).
- Namespace every class so the component can live inside a larger design system.`

export function EmilSkillDetail({ definition }: { definition: EmilSkillDefinition }) {
  const controls = useRef<EmilSkillsControls>({}).current
  const variants = getEmilSkillVariants(definition.id)
  const [variant, setVariant] = useState<EmilSkillVariantId>(definition.defaultVariant)
  const selectedVariant = variants.find((option) => option.id === variant) ?? variants[0]

  return (
    <DetailShell title={definition.title}>
      {/* hero */}
      <div
        aria-label={definition.title}
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <EmilSkillsDemo id={definition.id} variant={definition.defaultVariant} />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">{definition.summary}</p>
          <p className="text-pretty text-[var(--text-primary)]">
            The preview isolates one representative interaction so the idea reads immediately. Use the selector in the
            implementation to explore the skill’s related examples. The complete upstream skill is bundled below,
            verbatim, for installation from the Skill section.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
              <ChipButton onClick={() => controls.replay?.()}>Replay</ChipButton>
            </div>
          </header>
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <span className="text-[11px] text-[var(--text-tertiary)]">Example</span>
              <select
                value={variant}
                onChange={(event) => setVariant(event.target.value as EmilSkillVariantId)}
                className="h-9 w-full rounded-[10px] border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] text-[var(--text-primary)] outline-none transition-colors duration-150 hover:border-[var(--border-ring)] focus:border-[var(--border-ring)]"
              >
                {variants.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <p className="max-w-[360px] text-pretty text-[11px] leading-[1.5] text-[var(--text-tertiary)]">
              {selectedVariant.description}
            </p>
          </div>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[220px] bg-[var(--bg-page)]">
            <EmilSkillsDemo id={definition.id} variant={variant} controls={controls} />
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Skill</h2>
            <CopyPromptChip text={installPayload(definition)} />
          </header>
          <CodeTabs
            tabs={[
              { file: 'SKILL.md', code: SKILL_TEXT[definition.id] },
              { file: 'SOURCE.md', code: SOURCE_TEXT[definition.id] },
              { file: 'LICENSE', code: licenseSrc },
            ]}
          />
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip
              text={assembleCopy(`${BUILD_PROMPT_BASE}\n\nThis card's focused default specimen: ${definition.specimen}`, [
                { name: 'EmilSkillsDemo.tsx', code: demoSrc },
                { name: 'EmilSkillsDemo.css', code: demoCss },
              ])}
            />
          </header>
          <CodeTabs
            tabs={[
              { file: 'EmilSkillsDemo.tsx', code: demoSrc },
              { file: 'EmilSkillsDemo.css', code: demoCss },
            ]}
          />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', definition.date],
            ['Tags', definition.tags],
            ['Author', 'Emil Kowalski'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Skill:{' '}
          <a href={definition.upstream} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]">
            emilkowalski/skills
          </a>
          {' · MIT · pinned 6bf2443'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
