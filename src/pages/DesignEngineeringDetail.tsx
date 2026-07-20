import { useRef, useState } from 'react'
import { AnimationPrinciplesDemo, type AnimationPrinciplesControls } from '../demos/AnimationPrinciplesDemo'
import { BetterUiDemo } from '../demos/SkillsLab'
import { EMIL_SKILL_LIBRARY_DEFINITIONS, type EmilSkillDefinition } from '../emilskills/catalog'
import { ChipButton, CreditRows, DetailShell } from './detail-kit'
import { EmilSkillImplementation } from './EmilSkillDetail'

const SECTIONS = [
  { id: 'taste', label: 'Taste' },
  { id: 'vocabulary', label: 'Animation Vocabulary' },
  { id: 'principles', label: '12 Principles' },
  { id: 'better-ui', label: 'Better UI' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function libraryDefinition(id: EmilSkillDefinition['id']): EmilSkillDefinition {
  const definition = EMIL_SKILL_LIBRARY_DEFINITIONS.find((entry) => entry.id === id)
  if (!definition) throw new Error(`Missing Emil skill library definition: ${id}`)
  return definition
}

/* The Design Engineering umbrella folds four small skill cards into one page:
   Emil Kowalski's design-eng taste and animation-vocabulary skills (rendered
   through the same implementation block as the standalone Emil pages), the
   12 principles of animation inspector, and the Better UI polish demo. The
   chip row switches sections in place, without a reload. */
export function DesignEngineeringDetail() {
  const [section, setSection] = useState<SectionId>('taste')
  const principlesControls = useRef<AnimationPrinciplesControls>({}).current
  const taste = libraryDefinition('emil-design-eng')
  const vocabulary = libraryDefinition('animation-vocabulary')

  return (
    <DetailShell title="Design Engineering">
      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex min-w-0 flex-col gap-6" data-active-section={section}>
          <div role="tablist" aria-label="Design engineering sections" className="flex flex-wrap gap-2">
            {SECTIONS.map(({ id, label }) => {
              const active = section === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-section={id}
                  onClick={() => setSection(id)}
                  className={`relative z-10 inline-flex h-7 items-center rounded-[8px] border px-2.5 text-[12px] transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-1 ${active ? 'border-[var(--border-line)] bg-[var(--bg-hover)] font-medium text-[var(--text-primary)]' : 'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {section === 'taste' ? (
            <section aria-label="Design engineering taste" className="flex min-w-0 flex-col gap-4">
              <EmilSkillImplementation definition={taste} />
              <p className="text-pretty text-[13px] text-[var(--text-secondary)]">{taste.summary}</p>
            </section>
          ) : null}

          {section === 'vocabulary' ? (
            <section aria-label="Animation vocabulary" className="flex min-w-0 flex-col gap-4">
              <EmilSkillImplementation definition={vocabulary} />
              <p className="text-pretty text-[13px] text-[var(--text-secondary)]">{vocabulary.summary}</p>
            </section>
          ) : null}

          {section === 'principles' ? (
            <section aria-label="12 principles of animation" className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center justify-end gap-2">
                <ChipButton onClick={() => principlesControls.replay?.()}>Replay</ChipButton>
              </div>
              <div className="relative z-10 h-[520px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[430px]">
                <AnimationPrinciplesDemo controls={principlesControls} />
              </div>
            </section>
          ) : null}

          {section === 'better-ui' ? (
            <section aria-label="Better UI" className="flex min-w-0 flex-col gap-4">
              <BetterUiDemo interactive />
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            One page for the vault's interface-craft skills: Emil Kowalski's design-engineering taste, his reverse-lookup
            animation vocabulary, the twelve principles of animation as an interactive inspector, and the Better UI
            polish demo. What used to be four small cards now lives behind one switch.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Pick a section above — the page swaps in place and every demo stays fully interactive, with the same
            variant selector the standalone skill pages use.
          </p>
        </div>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 16, 2026'],
            ['Tags', 'Polish, Motion, UI craft'],
            ['Author', 'Emil Kowalski'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Taste and vocabulary:{' '}
          <a
            href="https://github.com/emilkowalski/skills"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            emilkowalski/skills
          </a>
          {' · MIT · pinned 6bf2443 — 12 principles adapted from raphaelsalaja/skill, Better UI from jakubkrehel/skills'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
