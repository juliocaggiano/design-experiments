import { useRef } from 'react'
import { KnockoutBracketDemo, type KnockoutControls } from '../demos/KnockoutBracket'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import bracketSrc from '../demos/KnockoutBracket.tsx?raw'

const BUILD_PROMPT = `Build this: a responsive knockout bracket that pages through a tournament instead of forcing one giant horizontal scroll.

Core requirements:
- Model the tournament as ordered rounds where every round has half as many matches as the one before it.
- Show a window of rounds. Stack the leftmost visible round compactly, then center every later match exactly between its two feeder matches.
- Connect each feeder pair with thin elbow lines.
- Previous and next buttons page the bracket. Cards, headers, connectors, and container height must share one coordinated transition.
- Finished matches show scores, winner emphasis, loser dimming, FT or FT (P), and penalty scores when present. Upcoming matches show their scheduled time.
- Make the layout responsive without a horizontal scrollbar and respect prefers-reduced-motion.
- Keep the data internally consistent: a winner must occupy the matching slot in every later round.`

const CODE_TABS = [
  {
    file: 'layout.ts',
    code: `// The first visible round stacks at one fixed rhythm.
positions[base] = rounds[base].matches.map((_, i) => i * (CARD_H + GAP_Y))

// Every later match sits between its two feeder matches.
for (let round = base + 1; round < rounds.length; round += 1) {
  positions[round] = rounds[round].matches.map((_, i) =>
    (positions[round - 1][i * 2] + positions[round - 1][i * 2 + 1]) / 2,
  )
}

// Recalculate from the new base when paging. CSS transitions move cards,
// headers, connectors, and height together instead of scrolling a giant tree.`,
  },
  {
    file: 'progression.ts',
    code: `// The joke only works if the bracket remains a valid tree.
// Brazil wins each feeder match, then appears in an upcoming final.
const brazilPath = [
  ['Round of 32', 'Brazil 2–1 Japan'],
  ['Round of 16', 'Brazil 2–1 Norway'],
  ['Quarter-finals', 'Brazil 2–0 England'],
  ['Semi-finals', 'Brazil 1–0 Argentina'],
  ['Final', 'Spain vs Brazil · upcoming'],
]`,
  },
  {
    file: 'motion.css',
    code: `.bracket-item,
.bracket-connector {
  transition:
    left 500ms cubic-bezier(.16, 1, .3, 1),
    top 500ms cubic-bezier(.16, 1, .3, 1),
    width 500ms cubic-bezier(.16, 1, .3, 1),
    height 500ms cubic-bezier(.16, 1, .3, 1),
    opacity 350ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .bracket-item,
  .bracket-connector { transition: none; }
}`,
  },
]

export function KnockoutBracketDetail() {
  const controls = useRef<KnockoutControls>({}).current

  return (
    <DetailShell title="Knockout bracket">
      <div
        aria-label="A paged World Cup bracket ending with Spain versus Brazil"
        className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <KnockoutBracketDemo initialPage={2} compact light />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            I’m Brazilian, and I would love to pretend Brazil is still good at soccer—even though it isn’t. This is my way of coping.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The bracket keeps the fantasy mathematically honest: Brazil beats Japan, Norway, England, and Argentina before reaching an upcoming final against Spain. It pages one set of rounds at a time, so the tree stays readable without turning into a horizontal-scroll spreadsheet.
          </p>
          <p className="text-pretty text-[var(--text-secondary)]">
            Interaction and layout reference:{' '}
            <a
              href="https://skiper-ui.com/v1/skiper107"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-primary)]"
            >
              Skiper UI’s Knockout bracket
            </a>.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col items-start justify-between gap-3 border-b border-[var(--border-line)] pb-2 sm:flex-row sm:items-center">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex flex-wrap items-center gap-2">
              <ChipButton onClick={() => controls.previous?.()}>Previous</ChipButton>
              <ChipButton onClick={() => controls.next?.()}>Next</ChipButton>
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <KnockoutBracketDemo light controls={controls} />
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'KnockoutBracket.tsx', code: bracketSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 12, 2026'],
            ['Tags', 'Layout, Motion, Data'],
            ['Reference', 'Skiper UI 107'],
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
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
