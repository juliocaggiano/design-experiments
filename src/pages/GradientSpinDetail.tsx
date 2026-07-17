import demoCss from '../demos/GradientSpinDemo.css?raw'
import demoSrc from '../demos/GradientSpinDemo.tsx?raw'
import licenseSrc from '../demos/GradientSpin.LICENSE.md?raw'
import { GradientSpinDemo } from '../demos/GradientSpinDemo'
import { assembleCopy, CodeTabs, CopyPromptChip, CreditRows, DetailShell } from './detail-kit'

const BUILD_PROMPT = `Build a light-mode React card for a gradient matrix loading animation.

Keep the feed thumbnail focused on one continuous spinner. In the expanded implementation, expose eight palettes, four wave patterns, path/row color mapping, timing, dim opacity, rows, columns, cell size, and gap. Use one shared opacity keyframe with negative per-cell delays, sample colors in OKLab, pause offscreen thumbnails, and preserve a useful reduced-motion state.`

export function GradientSpinDetail() {
  return (
    <DetailShell title="Gradient Spin">
      <div
        aria-label="Gradient Spin preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <GradientSpinDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Gradient Spin turns a small matrix into a calm loading signal. Every cell shares the same opacity keyframe;
            its position in the arrow, diagonal, snake, or ripple path only changes the negative delay, so the wave is
            already moving when it appears.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The thumbnail keeps that idea to one continuous specimen. The implementation below exposes the original
            palettes and behavior dimensions without adding more competing motion to the feed.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <span className="text-[11px] text-[var(--text-tertiary)]">Live controls</span>
          </header>
          <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <GradientSpinDemo />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Linear timing is intentional here: this is a perpetual loading cycle, not a spatial transition between two interface states.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'GradientSpinDemo.tsx', code: demoSrc },
              { name: 'GradientSpinDemo.css', code: demoCss },
              { name: 'GradientSpin.LICENSE.md', code: licenseSrc },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'GradientSpinDemo.tsx', code: demoSrc },
            { file: 'GradientSpinDemo.css', code: demoCss },
            { file: 'MIT License', code: licenseSrc },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 16, 2026'],
            ['Tags', 'Loading, Gradient, Motion'],
            ['Reference', 'gradient-spin — ziye'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Adapted from{' '}
          <a
            href="https://gradient-spin.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            gradient-spin
          </a>
          {' · '}
          <a
            href="https://github.com/BIAsia/gradient-spin"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            GitHub source
          </a>
          {' · MIT'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
