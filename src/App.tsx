import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { LinkCard, RichCaption } from './components/Card'
import { OverlayDemo } from './demos/OverlayDemo'
import { FluidSpringDemo } from './demos/FluidSpring'
import { SheetDemo } from './demos/SheetDemo'
import { BetterColorsDemo, BetterTypographyDemo } from './demos/SkillsLab'
import { MicroButtonsDemo } from './demos/MicroButtonsDemo'
import { ScrollgalleryDemo } from './demos/ScrollgalleryDemo'
import { BorderBeamDemo } from './demos/BorderBeamDemo'
import { TransitionDemo } from './demos/transitions/TransitionDemo'
import { AiCssDemo } from './demos/aicss/AiCssDemo'
import { EmilSkillsDemo } from './demos/EmilSkillsDemo'
import { ShadcnDemo } from './demos/shadcn/ShadcnDemo'
import { ReactiveDitherDemo } from './demos/ReactiveDitherDemo'
import { LiquidConnectorDemo } from './demos/LiquidConnectorDemo'
import { MeetingOverlayDetail } from './pages/MeetingOverlayDetail'
import { FluidSpringsDetail } from './pages/FluidSpringsDetail'
import { SheetDetail } from './pages/SheetDetail'
import { MaterialsDetail } from './pages/MaterialsDetail'
import { BetterColorsDetail, BetterTypographyDetail } from './pages/SkillDetails'
import { EmilSkillDetail } from './pages/EmilSkillDetail'
import { DesignEngineeringDetail } from './pages/DesignEngineeringDetail'
import { ShadcnDetail } from './pages/ShadcnDetail'
import { ReactiveDitherDetail } from './pages/ReactiveDitherDetail'
import { LiquidConnectorDetail } from './pages/LiquidConnectorDetail'
import { EMIL_SKILL_DEFINITIONS, getEmilSkillDefinition, type EmilSkillDefinition } from './emilskills/catalog'
import { MicroButtonsDetail } from './pages/MicroButtonsDetail'
import { ScrollgalleryDetail } from './pages/ScrollgalleryDetail'
import { BorderBeamDetail } from './pages/BorderBeamDetail'
import { TransitionDetail } from './pages/TransitionDetail'
import { AiCssDetail } from './pages/AiCssDetail'
import { usePath } from './router'
import { TRANSITION_DEFINITIONS, getTransitionDefinition } from './transitions/catalog'
import { AICSS_DEFINITIONS, getAiCssDefinition } from './aicss/catalog'
import { SHADCN_DEFINITIONS, getShadcnDefinition, type ShadcnDefinition } from './shadcn/catalog'
import {
  VAULT_CATEGORIES,
  VAULT_ITEMS,
  categoryFromSearch,
  categoryHref,
  type VaultCategory,
} from './vault-config'

function Header() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-[15px] font-semibold text-[var(--text-primary)] text-pretty">
          Design Experiments
        </h1>
        <p className="text-pretty text-[var(--text-secondary)]">
          Here are some small projects I've been exploring lately. Feel free to remix them, btw.
        </p>
      </div>
    </header>
  )
}

function CategoryFilter({
  selected,
  onChange,
}: {
  selected: VaultCategory | 'All'
  onChange: (category: VaultCategory | 'All') => void
}) {
  const categories: readonly (VaultCategory | 'All')[] = ['All', ...VAULT_CATEGORIES]
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pillRef = useRef<HTMLSpanElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)

  /* Liquid pill: the selection pill travels on an underdamped spring (soft
   * overshoot), stretches and squashes with its velocity like a moving
   * droplet, and a lighter ghost pill eases behind the hovered tab. All
   * motion is written directly to the DOM from one rAF loop — no React state
   * per frame — and reduced motion snaps instantly with no ghost. */
  const motion = useRef({
    x: 0, w: 0, vx: 0, vw: 0, tx: 0, tw: 0,
    gx: 0, gw: 0, gtx: 0, gtw: 0, ghostShown: false, hoverIndex: -1,
    raf: 0, running: false, last: 0, ready: false,
  })

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const measure = (index: number) => {
    const tab = tabRefs.current[index]
    return tab ? { x: tab.offsetLeft - 4, w: tab.offsetWidth } : null
  }

  useLayoutEffect(() => {
    const m = motion.current
    const pill = pillRef.current
    const ghost = ghostRef.current
    if (!pill || !ghost) return

    const writePill = () => {
      const stretch = Math.min(0.16, Math.abs(m.vx) * 0.012)
      pill.style.width = `${m.w}px`
      pill.style.transform = `translateX(${m.x}px) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.35})`
    }
    const writeGhost = () => {
      ghost.style.width = `${m.gw}px`
      ghost.style.transform = `translateX(${m.gx}px)`
    }
    const snapPill = () => {
      m.x = m.tx; m.w = m.tw; m.vx = 0; m.vw = 0
      writePill()
    }
    const snapGhost = () => {
      m.gx = m.gtx; m.gw = m.gtw
      writeGhost()
    }

    const loop = (now: number) => {
      const dt = m.last === 0 ? 1 : Math.min(2.5, Math.max(0.25, (now - m.last) / 16.667))
      m.last = now
      m.vx = (m.vx + (m.tx - m.x) * 0.11 * dt) * Math.pow(0.675, dt)
      m.vw = (m.vw + (m.tw - m.w) * 0.11 * dt) * Math.pow(0.675, dt)
      m.x += m.vx * dt
      m.w += m.vw * dt
      m.gx += (m.gtx - m.gx) * Math.min(1, 0.2 * dt)
      m.gw += (m.gtw - m.gw) * Math.min(1, 0.2 * dt)
      writePill()
      writeGhost()
      const settled =
        Math.abs(m.tx - m.x) < 0.1 && Math.abs(m.vx) < 0.1 &&
        Math.abs(m.tw - m.w) < 0.1 && Math.abs(m.vw) < 0.1
      const ghostSettled = Math.abs(m.gtx - m.gx) < 0.1 && Math.abs(m.gtw - m.gw) < 0.1
      if (settled && ghostSettled) {
        snapPill()
        snapGhost()
        m.running = false
        m.last = 0
        m.raf = 0
        return
      }
      m.raf = window.requestAnimationFrame(loop)
    }
    const wake = () => {
      if (m.running) return
      m.running = true
      m.last = 0
      m.raf = window.requestAnimationFrame(loop)
    }

    const retarget = (index: number, animate: boolean) => {
      const target = measure(index)
      if (!target) return
      m.tx = target.x
      m.tw = target.w
      if (animate && m.ready && !reduced()) wake()
      else snapPill()
      m.ready = true
    }

    retarget(categories.indexOf(selected), true)

    const observer = new ResizeObserver(() => {
      // ResizeObserver fires an initial delivery when observation starts —
      // right after retarget() set m.tx/m.tw — so only snap when the measured
      // geometry truly changed; otherwise the spring would be killed on
      // every selection change and clicks would jump instead of travel.
      const target = measure(categories.indexOf(selected))
      if (!target) return
      if (Math.abs(target.x - m.tx) > 0.5 || Math.abs(target.w - m.tw) > 0.5) {
        m.tx = target.x
        m.tw = target.w
        snapPill()
      }
      if (m.ghostShown && m.hoverIndex >= 0) {
        const ghostTarget = measure(m.hoverIndex)
        if (ghostTarget && (Math.abs(ghostTarget.x - m.gtx) > 0.5 || Math.abs(ghostTarget.w - m.gtw) > 0.5)) {
          m.gtx = ghostTarget.x
          m.gtw = ghostTarget.w
          snapGhost()
        }
      }
    })
    if (tabsRef.current) observer.observe(tabsRef.current)
    tabRefs.current.forEach((tab) => { if (tab) observer.observe(tab) })

    const list = tabsRef.current
    const onHover = (event: MouseEvent) => {
      if (reduced()) return
      const index = tabRefs.current.findIndex((tab) => tab === event.target || tab?.contains(event.target as Node))
      if (index < 0) return
      const target = measure(index)
      if (!target) return
      m.hoverIndex = index
      m.gtx = target.x
      m.gtw = target.w
      if (!m.ghostShown) {
        snapGhost()
        m.ghostShown = true
        ghost.style.opacity = '1'
      }
      wake()
    }
    const onLeave = () => {
      m.ghostShown = false
      m.hoverIndex = -1
      ghost.style.opacity = '0'
    }
    list?.addEventListener('mouseover', onHover)
    list?.addEventListener('mouseleave', onLeave)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(m.raf)
      m.running = false
      list?.removeEventListener('mouseover', onHover)
      list?.removeEventListener('mouseleave', onLeave)
    }
  }, [selected])

  const selectAt = (index: number) => {
    const next = categories[index]
    if (!next) return
    onChange(next)
    window.requestAnimationFrame(() => {
      tabRefs.current[index]?.focus()
      tabRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
  }

  const onTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = categories.indexOf(selected)
    const next = {
      ArrowLeft: (current - 1 + categories.length) % categories.length,
      ArrowRight: (current + 1) % categories.length,
      Home: 0,
      End: categories.length - 1,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    selectAt(next)
  }

  return (
    <section aria-label="Filter experiments by category" className="flex min-w-0 flex-col gap-2">
      <div className="-ml-1 -mr-1 overflow-x-auto pl-1 pr-1 pb-1">
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Experiment categories"
          onKeyDown={onTabsKeyDown}
          className="relative inline-flex min-w-max gap-1 rounded-[11px] border border-[var(--border-line)] bg-[var(--bg-surface)] p-1"
        >
          <span
            ref={ghostRef}
            data-category-ghost
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-1 rounded-[8px] bg-[var(--bg-hover)] opacity-0 transition-opacity duration-150"
          />
          <span
            ref={pillRef}
            data-category-pill
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-1 rounded-[8px] border border-[var(--border-line)] bg-[var(--bg-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.025)]"
          />
          {categories.map((category, index) => {
            const count = category === 'All'
              ? VAULT_ITEMS.length
              : VAULT_ITEMS.filter((item) => item.category === category).length
            const active = selected === category
            return (
              <button
                key={category}
                ref={(element) => { tabRefs.current[index] = element }}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="vault-filter-results"
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(category)}
                className={`relative z-10 inline-flex h-7 items-center gap-1.5 rounded-[8px] border border-transparent bg-transparent px-2.5 text-[12px] transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-1 ${active ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}
              >
                {category}
                <span className="text-[10px] tabular-nums text-[var(--text-tertiary)]">{count}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FooterAbout() {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
        <h2 className="font-semibold text-[var(--text-primary)]">Contact</h2>
      </header>
      <div>
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2">
          <span className="text-[var(--text-secondary)]">Email</span>
          <a
            href="mailto:julio@uni.minerva.edu"
            className="text-[var(--text-primary)] underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--border-ring)]"
          >
            julio@uni.minerva.edu
          </a>
        </div>
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2">
          <span className="text-[var(--text-secondary)]">Location</span>
          <span className="text-[var(--text-primary)]">Cupertino, California</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-[var(--text-secondary)]">Media</span>
          <span className="flex items-center gap-3">
            {/* placeholder hrefs — swap for the real profile URLs */}
            <a href="#" className="text-[var(--text-primary)] underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--border-ring)]">LinkedIn</a>
            <a href="#" className="text-[var(--text-primary)] underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--border-ring)]">Portfolio</a>
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">© 2026 CAGGIANO</p>
    </section>
  )
}

function Teaser() {
  return (
    <div aria-hidden="true" className="relative grid max-h-[12rem] grid-cols-1 gap-y-4 overflow-hidden">
      {[0, 1].map((i) => (
        <div key={i} className="block rounded-xl border border-dashed border-[var(--border-line)] p-2 text-left">
          <div className="flex aspect-video items-center justify-center rounded-[12px] border border-dashed border-[var(--border-line)]">
            <span className="text-[12px] text-[var(--text-tertiary)]">More soon</span>
          </div>
          <div className="px-1 pt-2.5 pb-1">
            <span className="block h-[1.4em]" />
          </div>
        </div>
      ))}
      <div className="vault-fade" />
    </div>
  )
}

function MicroButtonsCard() {
  return (
    <LinkCard href="/vault/micro-buttons">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <MicroButtonsDemo />
      </div>
      <RichCaption title="Micro Interactions" summary="Nine hover-driven button micro-interactions, rebuilt 1:1 from Amicro's catalogue." category="Interactions" />
    </LinkCard>
  )
}

function ScrollgalleryCard() {
  return (
    <LinkCard href="/vault/chief-keef-index">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ScrollgalleryDemo compact thumbnail />
      </div>
      <RichCaption title="Scroll Gallery" summary="A living photo gallery you can scroll, shuffle, and search." category="Interfaces" />
    </LinkCard>
  )
}

function BorderBeamCard() {
  return (
    <LinkCard href="/vault/border-beam" interactive label="Open Gemini Button">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <BorderBeamDemo compact />
      </div>
      <RichCaption title="Gemini Button" summary="A button wrapped in a traveling border beam." category="Interactions" />
    </LinkCard>
  )
}

type TransitionRecord = (typeof TRANSITION_DEFINITIONS)[number]

function TransitionCard({ definition }: { definition: TransitionRecord }) {
  return (
    <LinkCard href={definition.path} interactive label={`Open ${definition.title}`}>
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <TransitionDemo id={definition.id} compact />
      </div>
      <RichCaption title={definition.title} summary={definition.summary} category={definition.category} />
    </LinkCard>
  )
}

const TRANSITION_FEED_CARDS = TRANSITION_DEFINITIONS.map((definition) => ({
  path: definition.path,
  category: definition.category,
  Card: function TransitionFeedCard() {
    return <TransitionCard definition={definition} />
  },
})) satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

type AiCssRecord = (typeof AICSS_DEFINITIONS)[number]

function AiCssCard({ definition }: { definition: AiCssRecord }) {
  return (
    <LinkCard href={definition.path} interactive label={`Open ${definition.title}`}>
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <AiCssDemo id={definition.id} compact />
      </div>
      <RichCaption title={definition.title} summary={definition.summary} category={definition.category} />
    </LinkCard>
  )
}

const AICSS_FEED_CARDS = AICSS_DEFINITIONS.map((definition) => ({
  path: definition.path,
  category: definition.category,
  Card: function AiCssFeedCard() {
    return <AiCssCard definition={definition} />
  },
})) satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

function EmilSkillCard({ definition }: { definition: EmilSkillDefinition }) {
  return (
    <LinkCard href={definition.path} interactive label={`Open ${definition.title}`}>
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <EmilSkillsDemo id={definition.id} compact />
      </div>
      <RichCaption title={definition.title} summary={definition.summary} category={definition.category} />
    </LinkCard>
  )
}

const EMIL_SKILL_FEED_CARDS = EMIL_SKILL_DEFINITIONS.map((definition) => ({
  path: definition.path,
  category: definition.category,
  Card: function EmilSkillFeedCard() {
    return <EmilSkillCard definition={definition} />
  },
})) satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

function DesignEngineeringCard() {
  return (
    <LinkCard href="/vault/skill-design-eng" interactive label="Open Design Engineering">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <EmilSkillsDemo id="emil-design-eng" compact />
      </div>
      <RichCaption title="Design Engineering" summary="Taste, animation vocabulary, motion principles, and UI upgrades in one place." category="Skills" />
    </LinkCard>
  )
}

function ReactiveDitherCard() {
  return (
    <LinkCard href="/vault/reactive-dither" label="Open Liquid Dither Effect">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ReactiveDitherDemo compact />
      </div>
      <RichCaption title="Liquid Dither Effect" summary="A dithered cube mark that scatters under the pointer and springs back." category="Motion" />
    </LinkCard>
  )
}

function LiquidConnectorCard() {
  return (
    <LinkCard href="/vault/liquid-connector" interactive label="Open Liquid Connector">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <LiquidConnectorDemo compact />
      </div>
      <RichCaption title="Liquid Connector" summary="A connector card that peels off the prompt with a liquid seam — the whole surface is one SVG path." category="Motion" />
    </LinkCard>
  )
}

function ShadcnCard({ definition }: { definition: ShadcnDefinition }) {
  return (
    <LinkCard href={definition.path} interactive label={`Open ${definition.title}`}>
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ShadcnDemo id={definition.id} compact />
      </div>
      <RichCaption title={definition.title} summary={definition.summary} category={definition.category} />
    </LinkCard>
  )
}

const SHADCN_FEED_CARDS = SHADCN_DEFINITIONS.map((definition) => ({
  path: definition.path,
  category: definition.category,
  Card: function ShadcnFeedCard() {
    return <ShadcnCard definition={definition} />
  },
})) satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

function BetterColorsCard() {
  return (
    <LinkCard href="/vault/better-colors">
      <BetterColorsDemo compact />
      <RichCaption title="Cohesive Color Systems" summary="Building palettes that stay cohesive across surfaces and states." category="Skills" />
    </LinkCard>
  )
}

function BetterTypographyCard() {
  return (
    <LinkCard href="/vault/better-typography">
      <BetterTypographyDemo compact />
      <RichCaption title="Typography Skills" summary="Type settings and tweaks that make interface text read better." category="Skills" />
    </LinkCard>
  )
}

function SheetCard() {
  return (
    <LinkCard href="/vault/bottom-sheet">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <SheetDemo />
      </div>
      <RichCaption title="Interactive Pop-Up" summary="A bottom sheet with spring snap points you can drag and flick." category="Interactions" />
    </LinkCard>
  )
}

function FluidSpringsCard() {
  return (
    <LinkCard href="/vault/fluid-springs">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <FluidSpringDemo />
      </div>
      <RichCaption title="Fluid Cards" summary="Cards you can grab, drag, and flick on interruptible fluid springs." category="Motion" />
    </LinkCard>
  )
}

function MeetingOverlayCard() {
  return (
    <LinkCard href="/vault/meeting-overlay">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <OverlayDemo title="Work Session: New Portfolio" time="Tomorrow 06:00" holdMs={3200} />
      </div>
      <RichCaption
        title="Don't Miss Meetings"
        summary="A desktop-pet overlay that walks on screen to remind you before every meeting."
        category="Motion"
      />
    </LinkCard>
  )
}

const FEED_CARDS = [
  { path: '/vault/meeting-overlay', category: 'Motion', Card: MeetingOverlayCard },
  { path: '/vault/reactive-dither', category: 'Motion', Card: ReactiveDitherCard },
  { path: '/vault/liquid-connector', category: 'Motion', Card: LiquidConnectorCard },
  { path: '/vault/skill-design-eng', category: 'Skills', Card: DesignEngineeringCard },
  ...EMIL_SKILL_FEED_CARDS,
  ...SHADCN_FEED_CARDS,
  ...TRANSITION_FEED_CARDS,
  ...AICSS_FEED_CARDS,
  { path: '/vault/border-beam', category: 'Interactions', Card: BorderBeamCard },
  { path: '/vault/chief-keef-index', category: 'Interfaces', Card: ScrollgalleryCard },
  { path: '/vault/micro-buttons', category: 'Interactions', Card: MicroButtonsCard },
  { path: '/vault/better-colors', category: 'Skills', Card: BetterColorsCard },
  { path: '/vault/better-typography', category: 'Skills', Card: BetterTypographyCard },
  { path: '/vault/bottom-sheet', category: 'Interactions', Card: SheetCard },
  { path: '/vault/fluid-springs', category: 'Motion', Card: FluidSpringsCard },
] satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

function Feed() {
  const [category, setCategory] = useState<VaultCategory | 'All'>(() => categoryFromSearch(window.location.search))
  const visibleCards = category === 'All'
    ? FEED_CARDS
    : FEED_CARDS.filter((item) => item.category === category)

  /* Feed thumbnails must never move the page: cmdk (the shadcn command demo)
   * calls scrollIntoView on its selected item when a filtered grid mounts,
   * which scrolled the window down into the feed. While the feed is mounted,
   * swallow scrollIntoView calls that originate inside the results grid —
   * thumbnails are ambient visuals, nothing inside them may scroll the page.
   * Detail pages are unaffected (the patch is removed on unmount). */
  useEffect(() => {
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function (this: Element, arg?: boolean | ScrollIntoViewOptions) {
      if (this.closest('.vault-filter-results')) return
      original.call(this, arg as never)
    } as typeof original
    return () => { Element.prototype.scrollIntoView = original }
  }, [])

  const selectCategory = (nextCategory: VaultCategory | 'All') => {
    setCategory(nextCategory)
    window.history.replaceState({}, '', nextCategory === 'All' ? '/' : categoryHref(nextCategory))
  }

  return (
    <section className="flex flex-col gap-[26px] text-[15px] leading-[1.7]">
      <Header />
      <CategoryFilter selected={category} onChange={selectCategory} />
      <div className="relative mt-1.5">
        <div id="vault-filter-results" role="tabpanel" aria-label={`${category} experiments`} key={category} className="vault-filter-results grid grid-cols-1 gap-y-4">
          {visibleCards.map(({ path, Card }) => <Card key={path} />)}
          {category === 'All' ? <Teaser /> : null}
        </div>
      </div>
      <FooterAbout />
    </section>
  )
}

export default function App() {
  const path = usePath()
  const transition = getTransitionDefinition(path)
  const aiCss = getAiCssDefinition(path)
  const emilSkill = getEmilSkillDefinition(path)
  const shadcn = getShadcnDefinition(path)
  const page =
    transition ? <TransitionDetail definition={transition} />
    : aiCss ? <AiCssDetail definition={aiCss} />
    : emilSkill ? <EmilSkillDetail definition={emilSkill} />
    : path === '/vault/skill-design-eng' ? <DesignEngineeringDetail />
    : shadcn ? <ShadcnDetail definition={shadcn} />
    : path === '/vault/reactive-dither' ? <ReactiveDitherDetail />
    : path === '/vault/liquid-connector' ? <LiquidConnectorDetail />
    : path === '/vault/border-beam' ? <BorderBeamDetail />
    : path === '/vault/chief-keef-index' ? <ScrollgalleryDetail />
    : path === '/vault/micro-buttons' ? <MicroButtonsDetail />
    : path === '/vault/better-colors' ? <BetterColorsDetail />
    : path === '/vault/better-typography' ? <BetterTypographyDetail />
    : path === '/vault/meeting-overlay' ? <MeetingOverlayDetail />
    : path === '/vault/fluid-springs' ? <FluidSpringsDetail />
    : path === '/vault/bottom-sheet' ? <SheetDetail />
    : path === '/vault/materials' ? <MaterialsDetail />
    : <Feed />
  return (
    <main className="flex-auto min-w-0 flex flex-col isolate">
      <div className="page-fade-in" key={path}>
        <div className="py-24">{page}</div>
      </div>
    </main>
  )
}
