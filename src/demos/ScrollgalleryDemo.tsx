import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Check, FunnelSimple, List, MagnifyingGlass, Shuffle, X } from '@phosphor-icons/react'
import './ScrollgalleryDemo.css'

type SortMode = 'default' | 'latest' | 'oldest' | 'title' | 'artist'
type ViewMode = 'coverflow' | 'list'
type ThemeMode = 'light' | 'dark'

type Cover = {
  id: string
  title: string
  issue: string
  issueDate: string
  artist: string
  note: string
  cover: string
}

export type ScrollgalleryControls = {
  reset?: () => void
  shuffle?: () => void
  openSearch?: () => void
}

/* The owner's cover selection (batch 13), in the requested order. Cover
   artwork, titles, and artist credits were pulled from each issue's page on
   newyorker.com (og:image masters, cropped/resized to the 800x1086 pipeline);
   the May 23, 2022 issue appears twice because the list includes it twice. */
const COVERS: Cover[] = [
  { id: 'no-photos-please', title: 'No Photos, Please!', issue: 'August 29, 2022', issueDate: '2022-08-29', artist: 'Anita Kunz', note: 'The Mona Lisa declines the camera.', cover: '/vault/scrollgallery/no-photos-please.jpg' },
  { id: 'uvalde-may-24-2022', title: 'Uvalde, May 24, 2022', issue: 'June 6, 2022', issueDate: '2022-06-06', artist: 'Eric Drooker', note: 'Chalk outlines on black.', cover: '/vault/scrollgallery/uvalde-may-24-2022.jpg' },
  { id: 'summer-treat', title: 'Summer Treat', issue: 'August 9, 2021', issueDate: '2021-08-09', artist: 'Mark Ulriksen', note: 'Every dog in the park wants the same bone.', cover: '/vault/scrollgallery/summer-treat.jpg' },
  { id: 'making-mischief', title: 'Making Mischief', issue: 'May 23, 2022', issueDate: '2022-05-23', artist: 'Ana Juan', note: 'One paw closer to the little bird.', cover: '/vault/scrollgallery/making-mischief.jpg' },
  { id: 'heres-looking-at-you', title: 'Here’s Looking at You', issue: 'July 3, 2000', issueDate: '2000-07-03', artist: 'Anita Kunz', note: 'Scaling Liberty, at eye level.', cover: '/vault/scrollgallery/heres-looking-at-you.jpg' },
  { id: 'rat-race', title: 'Rat Race', issue: 'December 5, 2016', issueDate: '2016-12-05', artist: 'Peter de Sève', note: 'Same commute, different species.', cover: '/vault/scrollgallery/rat-race.jpg' },
  { id: 'the-face-of-justice', title: 'The Face of Justice', issue: 'July 22, 2024', issueDate: '2024-07-22', artist: 'Anita Kunz', note: 'Nine seats, one familiar face.', cover: '/vault/scrollgallery/the-face-of-justice.jpg' },
  { id: 'making-mischief-redux', title: 'Making Mischief', issue: 'May 23, 2022', issueDate: '2022-05-23', artist: 'Ana Juan', note: 'One paw closer to the little bird.', cover: '/vault/scrollgallery/making-mischief.jpg' },
  { id: 'fighting-back', title: 'Fighting Back', issue: 'October 24, 2011', issueDate: '2011-10-24', artist: 'Barry Blitt', note: 'The one per cent marches — for the status quo.', cover: '/vault/scrollgallery/fighting-back.jpg' },
]

const DEFAULT_ID = 'heres-looking-at-you'

function relativeIndex(index: number, active: number, length: number) {
  let relative = index - active
  if (relative > length / 2) relative -= length
  if (relative < -length / 2) relative += length
  return relative
}

function ToolbarControl({
  compact,
  label,
  onClick,
  children,
}: {
  compact: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  if (compact) return <span className="cki-icon-button" aria-hidden="true">{children}</span>
  return (
    <button type="button" className="cki-icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export function ScrollgalleryDemo({
  compact = false,
  thumbnail = false,
  interactive = !compact,
  controls,
}: {
  compact?: boolean
  thumbnail?: boolean
  interactive?: boolean
  controls?: ScrollgalleryControls
}) {
  const [activeId, setActiveId] = useState(DEFAULT_ID)
  const [sort, setSort] = useState<SortMode>('default')
  const [view, setView] = useState<ViewMode>('coverflow')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const dragStart = useRef<{ x: number; pointerId: number } | null>(null)
  const dragging = useRef(false)
  const suppressCoverClick = useRef(false)

  const ordered = useMemo(() => {
    const next = [...COVERS]
    if (sort === 'latest') next.sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    if (sort === 'oldest') next.sort((a, b) => a.issueDate.localeCompare(b.issueDate))
    if (sort === 'title') next.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'artist') next.sort((a, b) => a.artist.localeCompare(b.artist))
    return next
  }, [sort])

  const activeIndex = Math.max(0, ordered.findIndex((cover) => cover.id === activeId))
  const active = ordered[activeIndex] ?? ordered[0]
  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return ordered
    return ordered.filter((cover) => `${cover.title} ${cover.artist} ${cover.issue} ${cover.note}`.toLowerCase().includes(value))
  }, [ordered, query])

  const select = (id: string) => setActiveId(id)
  const step = (direction: number) => {
    const next = (activeIndex + direction + ordered.length) % ordered.length
    setActiveId(ordered[next].id)
  }
  const shuffle = () => {
    if (ordered.length < 2) return
    let next = activeIndex
    while (next === activeIndex) next = Math.floor(Math.random() * ordered.length)
    setActiveId(ordered[next].id)
  }
  const reset = () => {
    setActiveId(DEFAULT_ID)
    setSort('default')
    setView('coverflow')
    setTheme('light')
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }
  const openSearch = () => {
    setMenuOpen(false)
    setSearchOpen(true)
  }

  if (controls) {
    controls.reset = reset
    controls.shuffle = shuffle
    controls.openSearch = openSearch
  }

  useEffect(() => {
    if (!searchOpen) return
    const id = window.setTimeout(() => searchRef.current?.focus(), 80)
    return () => window.clearTimeout(id)
  }, [searchOpen])

  useEffect(() => {
    if (!compact || interactive || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => step(1), 3600)
    return () => window.clearInterval(id)
  }, [activeIndex, compact, interactive, ordered])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.key === 'Escape') {
      setSearchOpen(false)
      setMenuOpen(false)
      return
    }
    if (searchOpen || menuOpen) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1) }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0) return
    dragStart.current = { x: event.clientX, pointerId: event.pointerId }
    dragging.current = false
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return
    if (!dragging.current && Math.abs(event.clientX - dragStart.current.x) > 8) {
      dragging.current = true
      suppressCoverClick.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return
    const delta = event.clientX - dragStart.current.x
    const didDrag = dragging.current
    dragStart.current = null
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (didDrag && Math.abs(delta) > 42) step(delta < 0 ? 1 : -1)
    window.setTimeout(() => { suppressCoverClick.current = false }, 0)
  }
  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = null
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    window.setTimeout(() => { suppressCoverClick.current = false }, 0)
  }

  const chooseSort = (mode: SortMode) => {
    setSort(mode)
    setMenuOpen(false)
  }
  const chooseView = (mode: ViewMode) => {
    setView(mode)
    setMenuOpen(false)
  }
  const chooseTheme = (mode: ThemeMode) => {
    setTheme(mode)
    setMenuOpen(false)
  }

  return (
    <div
      className={`cki-shell ${compact ? 'cki-compact' : ''} ${thumbnail ? 'cki-thumbnail' : ''} cki-theme-${theme}`}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={onKeyDown}
      aria-label={interactive ? 'New Yorker cover gallery. Use left and right arrow keys to browse.' : undefined}
    >
      {!thumbnail ? (
        <header className="cki-header">
          <div className="cki-brand-row">
            {compact ? (
              <><span className="cki-brand">New Yorker</span><span className="cki-version">covers</span></>
            ) : (
              <>
                <button type="button" className="cki-brand" aria-label={`Switch to ${view === 'coverflow' ? 'list' : 'coverflow'} view`} onClick={() => chooseView(view === 'coverflow' ? 'list' : 'coverflow')}>New Yorker</button>
                <button type="button" className="cki-version" aria-label="Reset New Yorker covers gallery" onClick={reset}>covers</button>
              </>
            )}
          </div>
          <div className="cki-toolbar" role={interactive ? 'toolbar' : undefined} aria-label={interactive ? 'Cover controls' : undefined}>
            <ToolbarControl compact={!interactive} label="Search covers" onClick={openSearch}>
              <MagnifyingGlass size={18} weight="regular" />
            </ToolbarControl>
            <ToolbarControl compact={!interactive} label="Shuffle covers" onClick={shuffle}>
              <Shuffle size={18} weight="regular" />
            </ToolbarControl>
            <ToolbarControl compact={!interactive} label="Filter covers" onClick={() => { setSearchOpen(false); setMenuOpen((open) => !open) }}>
              <FunnelSimple size={18} weight="regular" />
            </ToolbarControl>
          </div>
        </header>
      ) : null}

      {view === 'coverflow' ? (
        <>
          <div className="cki-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
            <div className="cki-mask" aria-hidden="true" />
            {ordered.map((cover, index) => {
              const relative = relativeIndex(index, activeIndex, ordered.length)
              const className = `cki-cover cki-position-${relative < 0 ? 'n' : 'p'}${Math.abs(relative)} ${relative === 0 ? 'is-active' : ''}`
              const style = { '--cki-depth': Math.abs(relative) } as CSSProperties
              if (!interactive) {
                return (
                  <div key={cover.id} className={className} style={style} aria-hidden="true">
                    <img src={cover.cover} alt="" draggable={false} />
                  </div>
                )
              }
              return (
                <button
                  key={cover.id}
                  type="button"
                  className={className}
                  style={style}
                  data-cover-index={index}
                  data-cover-id={cover.id}
                  aria-current={relative === 0 ? 'true' : undefined}
                  aria-label={cover.title}
                  onClick={(event) => {
                    if (suppressCoverClick.current) {
                      event.preventDefault()
                      return
                    }
                    select(cover.id)
                  }}
                >
                  <img src={cover.cover} alt="" draggable={false} />
                </button>
              )
            })}
          </div>

          <section className="cki-meta" aria-live={interactive ? 'polite' : undefined}>
            <div className="cki-heading">
              <h2>{active.title}</h2>
              <p>{active.artist}</p>
            </div>
            {!thumbnail && !compact ? (
              <dl className="cki-details">
                <div><dt>Issue</dt><dd>{active.issue}</dd></div>
                <div><dt>Artist</dt><dd>{active.artist}</dd></div>
                <div><dt>Story</dt><dd>{active.note}</dd></div>
              </dl>
            ) : null}
          </section>
        </>
      ) : (
        <div className="cki-list-view">
          <div className="cki-list-heading"><List size={18} /><span>{ordered.length} covers</span></div>
          <div className="cki-list-scroll">
            {ordered.map((cover) => (
              <button key={cover.id} type="button" className={`cki-track-row ${cover.id === activeId ? 'is-selected' : ''}`} onClick={() => select(cover.id)}>
                <span className="cki-artwork" aria-hidden="true"><img src={cover.cover} alt="" /></span>
                <span><strong>{cover.title}</strong><small>{cover.artist} · {cover.issue}</small></span>
                <span className="cki-row-length">{cover.issueDate.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {menuOpen && interactive ? (
        <div className="cki-menu" role="menu" aria-label="Cover display options">
          <button type="button" onClick={() => chooseSort('latest')}>Latest{sort === 'latest' && <Check size={14} />}</button>
          <button type="button" onClick={() => chooseSort('oldest')}>Oldest{sort === 'oldest' && <Check size={14} />}</button>
          <button type="button" onClick={() => chooseSort('title')}>Title{sort === 'title' && <Check size={14} />}</button>
          <button type="button" onClick={() => chooseSort('artist')}>Artist{sort === 'artist' && <Check size={14} />}</button>
          <span className="cki-menu-divider" />
          <button type="button" onClick={() => chooseTheme('light')}>Light{theme === 'light' && <Check size={14} />}</button>
          <button type="button" onClick={() => chooseTheme('dark')}>Dark{theme === 'dark' && <Check size={14} />}</button>
          <span className="cki-menu-divider" />
          <button type="button" onClick={() => chooseView('list')}>List{view === 'list' && <Check size={14} />}</button>
          <button type="button" onClick={() => chooseView('coverflow')}>Coverflow{view === 'coverflow' && <Check size={14} />}</button>
        </div>
      ) : null}

      {searchOpen && interactive ? (
        <div className="cki-search" role="dialog" aria-modal="true" aria-label="Search covers">
          <button type="button" className="cki-search-backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <div className="cki-search-dialog">
            <div className="cki-search-field">
              <MagnifyingGlass size={19} aria-hidden="true" />
              <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything" aria-label="Search anything" />
              <button type="button" className="cki-search-close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <span>esc</span><X size={15} />
              </button>
            </div>
            <div className="cki-search-results">
              {results.map((cover) => (
                <button key={cover.id} type="button" className={`cki-search-row ${cover.id === activeId ? 'is-selected' : ''}`} onClick={() => { select(cover.id); setSearchOpen(false); setQuery('') }}>
                  <span className="cki-artwork" aria-hidden="true"><img src={cover.cover} alt="" /></span>
                  <span><strong>{cover.title}</strong><small>{cover.artist} · {cover.issue}</small></span>
                </button>
              ))}
              {results.length === 0 ? <p className="cki-search-empty">No covers found.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
