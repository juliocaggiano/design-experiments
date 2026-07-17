import { useRef } from 'react'
import { ScrollgalleryDemo, type ScrollgalleryControls } from '../demos/ScrollgalleryDemo'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/ScrollgalleryDemo.tsx?raw'
import demoCss from '../demos/ScrollgalleryDemo.css?raw'

const BUILD_PROMPT = `Build a self-contained React coverflow for browsing a curated set of New Yorker covers.

Visual structure:
- A restrained light canvas with a 54px header. The New Yorker wordmark and muted “covers” label sit left; search, shuffle, and filter icons sit right.
- A perspective coverflow dominates the first half. The active cover is cropped into a square, 26px-radius squircle, centered, fully opaque, and softly shadowed. Neighboring covers step outward, scale down, rotate slightly in 3D, and fade with distance.
- Crop the source artwork asymmetrically: remove the roughly 9% decorative margin on the left, preserve the right edge, and anchor the image to the top so The New Yorker masthead remains visible.
- Leave 12px of breathing room before centering the active cover title and artist beneath the covers. Give the cover rail a clear top inset, then place the title block low enough that the fixed-ratio hero ends with only a compact bottom inset. Show the Issue, Artist, and Story table only in the full implementation.
- Keep the compact system typography and distribute white space deliberately above and below the coverflow. On mobile, enlarge the active cover and let the neighbors crop beyond the viewport.
- Inherit the surrounding vault's Neue Montreal font stack and default tracking instead of introducing component-specific typography.
- Keep the fixed-ratio expanded hero container-responsive by compressing its rail and type below 640px so no content crosses the rounded frame.

Behavior:
- Clicking a cover or using Left/Right changes the active issue with a smooth spring-like transform. Swiping the coverflow does the same.
- Search opens a centered command-palette dialog with a dimmed backdrop and live filtering across title, artist, issue, and story note.
- Shuffle selects a different cover.
- The filter menu supports latest, oldest, title, and artist ordering; light/dark surfaces; and list/coverflow views.
- Respect reduced motion and keep all focus states keyboard-visible.

Keep the cover records in one replaceable data array and use locally bundled artwork cropped into the same top-aligned square squircle slots so the thumbnail, search/list artwork, and expanded implementation remain synchronized. Keep the implementation namespaced so it can live inside another design system without leaking styles.`

export function ScrollgalleryDetail() {
  const controls = useRef<ScrollgalleryControls>({}).current

  return (
    <DetailShell title="Scroll Gallery">
      <div
        aria-label="Light-mode New Yorker cover gallery"
        className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <ScrollgalleryDemo compact interactive />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Scroll Gallery turns a temporary selection of New Yorker covers into the navigation itself. The selected
            issue stays centered while neighboring covers recede through perspective, fading, and soft shadow. Its
            context is reduced to the cover title, artist, issue date, and a short story note.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Search behaves like a command palette, shuffle always lands on a new cover, and the filter menu changes
            order, theme, and view. The coverflow responds to click, keyboard arrows, and horizontal swipe. All cover
            records live in one data array and the artwork is bundled locally, so this placeholder set can be swapped
            for your final selections without changing the interaction or letting the thumbnail drift from this page.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.openSearch?.()}>Search</ChipButton>
              <ChipButton onClick={() => controls.shuffle?.()}>Shuffle</ChipButton>
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 min-h-[620px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-[480px]:min-h-[670px]">
            <ScrollgalleryDemo controls={controls} />
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'ScrollgalleryDemo.tsx', code: demoSrc },
              { name: 'ScrollgalleryDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'ScrollgalleryDemo.tsx', code: demoSrc },
            { file: 'ScrollgalleryDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 14, 2026'],
            ['Tags', 'Coverflow, Editorial, Interaction'],
            ['Reference', 'The New Yorker cover archive'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Cover titles, artists, dates, and artwork:{' '}
          <a
            href="https://www.newyorker.com/tag/covers"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            The New Yorker cover archive
          </a>
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
