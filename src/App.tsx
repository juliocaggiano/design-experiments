import { useLayoutEffect, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { X } from '@phosphor-icons/react'
import { LinkCard, Caption } from './components/Card'
import { OverlayDemo } from './demos/OverlayDemo'
import { FluidSpringDemo } from './demos/FluidSpring'
import { SheetDemo } from './demos/SheetDemo'
import { KnockoutBracketDemo } from './demos/KnockoutBracket'
import { BetterColorsDemo, BetterTypographyDemo, BetterUiDemo } from './demos/SkillsLab'
import { MicroButtonsDemo } from './demos/MicroButtonsDemo'
import { ScrollgalleryDemo } from './demos/ScrollgalleryDemo'
import { BorderBeamDemo } from './demos/BorderBeamDemo'
import { CuelumeDemo } from './demos/CuelumeDemo'
import { PlaywrightCliDemo } from './demos/PlaywrightCliDemo'
import { AnimationPrinciplesDemo } from './demos/AnimationPrinciplesDemo'
import { TransitionDemo } from './demos/transitions/TransitionDemo'
import { AiCssDemo } from './demos/aicss/AiCssDemo'
import { EmilSkillsDemo } from './demos/EmilSkillsDemo'
import { SonnerDemo } from './demos/SonnerDemo'
import { ShadcnDemo } from './demos/shadcn/ShadcnDemo'
import { InterfaceGuidelinesDemo } from './demos/InterfaceGuidelinesDemo'
import { ScribbleIndexDemo } from './demos/ScribbleIndexDemo'
import { GradientSpinDemo } from './demos/GradientSpinDemo'
import { ReactiveDitherDemo } from './demos/ReactiveDitherDemo'
import { MeetingOverlayDetail } from './pages/MeetingOverlayDetail'
import { FluidSpringsDetail } from './pages/FluidSpringsDetail'
import { SheetDetail } from './pages/SheetDetail'
import { MaterialsDetail } from './pages/MaterialsDetail'
import { KnockoutBracketDetail } from './pages/KnockoutBracketDetail'
import { BetterColorsDetail, BetterTypographyDetail, BetterUiDetail } from './pages/SkillDetails'
import { EmilSkillDetail } from './pages/EmilSkillDetail'
import { SonnerDetail } from './pages/SonnerDetail'
import { ShadcnDetail } from './pages/ShadcnDetail'
import { InterfaceGuidelinesDetail } from './pages/InterfaceGuidelinesDetail'
import { ScribbleIndexDetail } from './pages/ScribbleIndexDetail'
import { GradientSpinDetail } from './pages/GradientSpinDetail'
import { ReactiveDitherDetail } from './pages/ReactiveDitherDetail'
import { EMIL_SKILL_DEFINITIONS, getEmilSkillDefinition, type EmilSkillDefinition } from './emilskills/catalog'
import { MicroButtonsDetail } from './pages/MicroButtonsDetail'
import { ScrollgalleryDetail } from './pages/ScrollgalleryDetail'
import { BorderBeamDetail } from './pages/BorderBeamDetail'
import { CuelumeDetail } from './pages/CuelumeDetail'
import { PlaywrightCliDetail } from './pages/PlaywrightCliDetail'
import { AnimationPrinciplesDetail } from './pages/AnimationPrinciplesDetail'
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
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-semibold text-[var(--text-primary)] text-pretty">
          Design Engineering Experiments
        </h1>
        <p className="text-pretty text-[var(--text-secondary)]">
          These are some of the skills and small projects that I've been developing recently.
        </p>
      </div>
      <a
        aria-label="Close"
        href="/"
        onClick={(e) => e.preventDefault()}
        className="relative flex items-center justify-center rounded-md p-1 transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96] text-[var(--text-secondary)] after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
      >
        <X size={16} weight="regular" aria-hidden="true" />
      </a>
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
  const [pill, setPill] = useState({ x: 0, width: 0 })
  const [instantPill, setInstantPill] = useState(true)
  const visibleCount = selected === 'All'
    ? VAULT_ITEMS.length
    : VAULT_ITEMS.filter((item) => item.category === selected).length

  useLayoutEffect(() => {
    const updatePill = () => {
      const activeTab = tabRefs.current[categories.indexOf(selected)]
      if (!activeTab) return
      setPill({ x: activeTab.offsetLeft, width: activeTab.offsetWidth })
    }

    updatePill()
    const observer = new ResizeObserver(updatePill)
    if (tabsRef.current) observer.observe(tabsRef.current)
    tabRefs.current.forEach((tab) => { if (tab) observer.observe(tab) })
    return () => observer.disconnect()
  }, [selected])

  const selectAt = (index: number) => {
    const next = categories[index]
    if (!next) return
    setInstantPill(true)
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
      <div className="flex items-center justify-between gap-4 px-1">
        <span className="text-[12px] text-[var(--text-secondary)]">Browse by category</span>
        <span aria-live="polite" className="shrink-0 text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {visibleCount} {visibleCount === 1 ? 'experiment' : 'experiments'}
        </span>
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Experiment categories"
          onKeyDown={onTabsKeyDown}
          className="relative inline-flex min-w-max gap-1 rounded-[11px] border border-[var(--border-line)] bg-[var(--bg-surface)] p-1"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-1 rounded-[8px] border border-[var(--border-line)] bg-[var(--bg-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.025)] motion-reduce:transition-none"
            style={{
              width: pill.width,
              transform: `translateX(${pill.x - 4}px)`,
              transition: instantPill ? 'none' : 'transform 180ms var(--ease-move), width 180ms var(--ease-move)',
            }}
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
                onClick={() => {
                  setInstantPill(false)
                  onChange(category)
                }}
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

function KnockoutBracketCard() {
  return (
    <LinkCard href="/vault/knockout-bracket">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <KnockoutBracketDemo initialPage={2} compact light showNavigation={false} />
      </div>
      <Caption title="Road Cup Knockout" category="Interfaces" />
    </LinkCard>
  )
}

function MicroButtonsCard() {
  return (
    <LinkCard href="/vault/micro-buttons">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <MicroButtonsDemo />
      </div>
      <Caption title="Micro Interactions" category="Interactions" />
    </LinkCard>
  )
}

function ScrollgalleryCard() {
  return (
    <LinkCard href="/vault/chief-keef-index">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ScrollgalleryDemo compact thumbnail />
      </div>
      <Caption title="Scroll Gallery" category="Interfaces" />
    </LinkCard>
  )
}

function BorderBeamCard() {
  return (
    <LinkCard href="/vault/border-beam" interactive label="Open Gemini Button">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <BorderBeamDemo compact />
      </div>
      <Caption title="Gemini Button" category="Interactions" />
    </LinkCard>
  )
}

function CuelumeCard() {
  return (
    <LinkCard href="/vault/cuelume" interactive label="Open Interaction Sounds">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <CuelumeDemo />
      </div>
      <Caption title="Interaction Sounds" category="Interactions" />
    </LinkCard>
  )
}

function PlaywrightCliCard() {
  return (
    <LinkCard href="/vault/playwright-cli" interactive label="Open Playwright CLI">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <PlaywrightCliDemo compact />
      </div>
      <Caption title="Playwright CLI" category="Skills" />
    </LinkCard>
  )
}

function AnimationPrinciplesCard() {
  return (
    <LinkCard href="/vault/animation-principles" interactive label="Open 12 Principles of Animation">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <AnimationPrinciplesDemo compact />
      </div>
      <Caption title="12 Principles of Animation" category="Motion" />
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
      <Caption title={definition.title} category={definition.category} />
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
      <Caption title={definition.title} category={definition.category} />
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
      <Caption title={definition.title} category={definition.category} />
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

function SonnerCard() {
  return (
    <LinkCard href="/vault/sonner" interactive label="Open Toast Notifications">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <SonnerDemo compact />
      </div>
      <Caption title="Toast Notifications" category="Interactions" />
    </LinkCard>
  )
}

function ReactiveDitherCard() {
  return (
    <LinkCard href="/vault/reactive-dither" label="Open Reactive Dither">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ReactiveDitherDemo compact />
      </div>
      <Caption title="Reactive Dither" category="Motion" />
    </LinkCard>
  )
}

function GradientSpinCard() {
  return (
    <LinkCard href="/vault/gradient-spin" label="Open Gradient Spin">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <GradientSpinDemo compact />
      </div>
      <Caption title="Gradient Spin" category="Motion" />
    </LinkCard>
  )
}

function ShadcnCard({ definition }: { definition: ShadcnDefinition }) {
  return (
    <LinkCard href={definition.path} interactive label={`Open ${definition.title}`}>
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ShadcnDemo id={definition.id} compact />
      </div>
      <Caption title={definition.title} category={definition.category} />
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

function InterfaceGuidelinesCard() {
  return (
    <LinkCard href="/vault/interface-guidelines" interactive label="Open Interface Craft Guidelines">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <InterfaceGuidelinesDemo compact />
      </div>
      <Caption title="Interface Craft Guidelines" category="Skills" />
    </LinkCard>
  )
}

function ScribbleIndexCard() {
  return (
    <LinkCard href="/vault/scribble-index" interactive label="Open Scribble Index">
      <div className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <ScribbleIndexDemo compact />
      </div>
      <Caption title="Scribble Index" category="Interactions" />
    </LinkCard>
  )
}

function BetterColorsCard() {
  return (
    <LinkCard href="/vault/better-colors">
      <BetterColorsDemo compact />
      <Caption title="Cohesive Color Systems" category="Skills" />
    </LinkCard>
  )
}

function BetterTypographyCard() {
  return (
    <LinkCard href="/vault/better-typography">
      <BetterTypographyDemo compact />
      <Caption title="Typography Skills" category="Skills" />
    </LinkCard>
  )
}

function BetterUiCard() {
  return (
    <LinkCard href="/vault/better-ui">
      <BetterUiDemo compact />
      <Caption title="Better UI" category="Skills" />
    </LinkCard>
  )
}

function SheetCard() {
  return (
    <LinkCard href="/vault/bottom-sheet">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <SheetDemo />
      </div>
      <Caption title="Interactive Pop-Up" category="Interactions" />
    </LinkCard>
  )
}

function FluidSpringsCard() {
  return (
    <LinkCard href="/vault/fluid-springs">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <FluidSpringDemo />
      </div>
      <Caption title="Fluid Cards" category="Motion" />
    </LinkCard>
  )
}

function MeetingOverlayCard() {
  return (
    <LinkCard href="/vault/meeting-overlay">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
        <OverlayDemo title="Work Session: New Portfolio" time="Tomorrow 06:00" holdMs={3200} />
      </div>
      <Caption title="Stop missing your meetings" category="Motion" />
    </LinkCard>
  )
}

const FEED_CARDS = [
  { path: '/vault/meeting-overlay', category: 'Motion', Card: MeetingOverlayCard },
  { path: '/vault/reactive-dither', category: 'Motion', Card: ReactiveDitherCard },
  { path: '/vault/gradient-spin', category: 'Motion', Card: GradientSpinCard },
  { path: '/vault/scribble-index', category: 'Interactions', Card: ScribbleIndexCard },
  ...EMIL_SKILL_FEED_CARDS,
  { path: '/vault/sonner', category: 'Interactions', Card: SonnerCard },
  ...SHADCN_FEED_CARDS,
  { path: '/vault/interface-guidelines', category: 'Skills', Card: InterfaceGuidelinesCard },
  { path: '/vault/animation-principles', category: 'Motion', Card: AnimationPrinciplesCard },
  ...TRANSITION_FEED_CARDS,
  ...AICSS_FEED_CARDS,
  { path: '/vault/playwright-cli', category: 'Skills', Card: PlaywrightCliCard },
  { path: '/vault/cuelume', category: 'Interactions', Card: CuelumeCard },
  { path: '/vault/border-beam', category: 'Interactions', Card: BorderBeamCard },
  { path: '/vault/chief-keef-index', category: 'Interfaces', Card: ScrollgalleryCard },
  { path: '/vault/micro-buttons', category: 'Interactions', Card: MicroButtonsCard },
  { path: '/vault/better-colors', category: 'Skills', Card: BetterColorsCard },
  { path: '/vault/better-typography', category: 'Skills', Card: BetterTypographyCard },
  { path: '/vault/better-ui', category: 'Skills', Card: BetterUiCard },
  { path: '/vault/knockout-bracket', category: 'Interfaces', Card: KnockoutBracketCard },
  { path: '/vault/bottom-sheet', category: 'Interactions', Card: SheetCard },
  { path: '/vault/fluid-springs', category: 'Motion', Card: FluidSpringsCard },
] satisfies readonly { path: string; category: VaultCategory; Card: ComponentType }[]

function Feed() {
  const [category, setCategory] = useState<VaultCategory | 'All'>(() => categoryFromSearch(window.location.search))
  const visibleCards = category === 'All'
    ? FEED_CARDS
    : FEED_CARDS.filter((item) => item.category === category)

  const selectCategory = (nextCategory: VaultCategory | 'All') => {
    setCategory(nextCategory)
    window.history.replaceState({}, '', nextCategory === 'All' ? '/' : categoryHref(nextCategory))
  }

  return (
    <section className="flex flex-col gap-8 text-[15px] leading-[1.7]">
      <Header />
      <CategoryFilter selected={category} onChange={selectCategory} />
      <div className="relative">
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
    : shadcn ? <ShadcnDetail definition={shadcn} />
    : path === '/vault/reactive-dither' ? <ReactiveDitherDetail />
    : path === '/vault/gradient-spin' ? <GradientSpinDetail />
    : path === '/vault/scribble-index' ? <ScribbleIndexDetail />
    : path === '/vault/interface-guidelines' ? <InterfaceGuidelinesDetail />
    : path === '/vault/sonner' ? <SonnerDetail />
    : path === '/vault/animation-principles' ? <AnimationPrinciplesDetail />
    : path === '/vault/playwright-cli' ? <PlaywrightCliDetail />
    : path === '/vault/cuelume' ? <CuelumeDetail />
    : path === '/vault/border-beam' ? <BorderBeamDetail />
    : path === '/vault/chief-keef-index' ? <ScrollgalleryDetail />
    : path === '/vault/micro-buttons' ? <MicroButtonsDetail />
    : path === '/vault/better-colors' ? <BetterColorsDetail />
    : path === '/vault/better-typography' ? <BetterTypographyDetail />
    : path === '/vault/better-ui' ? <BetterUiDetail />
    : path === '/vault/knockout-bracket' ? <KnockoutBracketDetail />
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
