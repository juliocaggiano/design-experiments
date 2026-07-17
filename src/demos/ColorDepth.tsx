import { LinkCard, Caption } from '../components/Card'

/* Two "Get Started" pills whose depth comes from stacked layers
   (base gradient + inset bevel + outer glow), not a single drop shadow. */
export function ColorDepthCard() {
  return (
    <LinkCard href="/vault/color-depth">
      <div className="relative flex h-[132px] w-full items-center justify-center gap-4 overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[#f8f9fb]">
        <button type="button" className="depth-btn depth-orange" tabIndex={-1}>
          <span className="depth-label">Get Started</span>
        </button>
        <button type="button" className="depth-btn depth-purple" tabIndex={-1}>
          <span className="depth-label">Get Started</span>
        </button>
      </div>
      <Caption title="The art of color depth" category="Skills" />
    </LinkCard>
  )
}
