import { useEffect, useRef, useState, type CSSProperties } from 'react'

type Winner = 'home' | 'away'

export interface Team {
  name: string
  flag: string
}

export interface MatchSide {
  team: Team | null
  score: number | null
  penalties?: number
}

export interface Match {
  id: string
  date: string
  time?: string
  status: 'finished' | 'upcoming'
  home: MatchSide
  away: MatchSide
  winner?: Winner
}

export interface Round {
  name: string
  matches: Match[]
}

export interface KnockoutControls {
  previous?: () => void
  next?: () => void
  reset?: () => void
}

const T = {
  southAfrica: { name: 'South Africa', flag: '🇿🇦' },
  canada: { name: 'Canada', flag: '🇨🇦' },
  netherlands: { name: 'Netherlands', flag: '🇳🇱' },
  morocco: { name: 'Morocco', flag: '🇲🇦' },
  germany: { name: 'Germany', flag: '🇩🇪' },
  paraguay: { name: 'Paraguay', flag: '🇵🇾' },
  france: { name: 'France', flag: '🇫🇷' },
  sweden: { name: 'Sweden', flag: '🇸🇪' },
  belgium: { name: 'Belgium', flag: '🇧🇪' },
  senegal: { name: 'Senegal', flag: '🇸🇳' },
  usa: { name: 'USA', flag: '🇺🇸' },
  bosnia: { name: 'Bosnia', flag: '🇧🇦' },
  spain: { name: 'Spain', flag: '🇪🇸' },
  austria: { name: 'Austria', flag: '🇦🇹' },
  portugal: { name: 'Portugal', flag: '🇵🇹' },
  croatia: { name: 'Croatia', flag: '🇭🇷' },
  brazil: { name: 'Brazil', flag: '🇧🇷' },
  japan: { name: 'Japan', flag: '🇯🇵' },
  norway: { name: 'Norway', flag: '🇳🇴' },
  ivoryCoast: { name: "Côte d'Ivoire", flag: '🇨🇮' },
  mexico: { name: 'Mexico', flag: '🇲🇽' },
  ecuador: { name: 'Ecuador', flag: '🇪🇨' },
  england: { name: 'England', flag: '🏴' },
  drCongo: { name: 'DR Congo', flag: '🇨🇩' },
  switzerland: { name: 'Switzerland', flag: '🇨🇭' },
  algeria: { name: 'Algeria', flag: '🇩🇿' },
  colombia: { name: 'Colombia', flag: '🇨🇴' },
  ghana: { name: 'Ghana', flag: '🇬🇭' },
  argentina: { name: 'Argentina', flag: '🇦🇷' },
  caboVerde: { name: 'Cabo Verde', flag: '🇨🇻' },
  egypt: { name: 'Egypt', flag: '🇪🇬' },
  australia: { name: 'Australia', flag: '🇦🇺' },
} satisfies Record<string, Team>

const side = (team: Team | null, score: number | null = null, penalties?: number): MatchSide =>
  penalties === undefined ? { team, score } : { team, score, penalties }

const finished = (
  id: string,
  date: string,
  home: Team,
  homeScore: number,
  away: Team,
  awayScore: number,
  winner: Winner,
  penalties?: [number, number],
): Match => ({
  id,
  date,
  status: 'finished',
  home: side(home, homeScore, penalties?.[0]),
  away: side(away, awayScore, penalties?.[1]),
  winner,
})

const upcoming = (id: string, date: string, time: string, home: Team | null, away: Team | null): Match => ({
  id,
  date,
  time,
  status: 'upcoming',
  home: side(home),
  away: side(away),
})

/* Every winner is carried into the matching downstream slot. Brazil's path
   is deliberate: Japan → Norway → England → Argentina → the final. */
export const WORLD_CUP_ROUNDS: Round[] = [
  {
    name: 'Round of 32',
    matches: [
      finished('r32-1', 'Mon, 29 Jun', T.southAfrica, 0, T.canada, 1, 'away'),
      finished('r32-2', 'Tue, 30 Jun', T.netherlands, 1, T.morocco, 1, 'away', [2, 3]),
      finished('r32-3', 'Tue, 30 Jun', T.germany, 1, T.paraguay, 1, 'away', [3, 4]),
      finished('r32-4', 'Wed, 1 Jul', T.france, 3, T.sweden, 0, 'home'),
      finished('r32-5', 'Thu, 2 Jul', T.belgium, 3, T.senegal, 2, 'home'),
      finished('r32-6', 'Thu, 2 Jul', T.usa, 2, T.bosnia, 0, 'home'),
      finished('r32-7', 'Fri, 3 Jul', T.spain, 3, T.austria, 0, 'home'),
      finished('r32-8', 'Fri, 3 Jul', T.portugal, 2, T.croatia, 1, 'home'),
      finished('r32-9', 'Mon, 29 Jun', T.brazil, 2, T.japan, 1, 'home'),
      finished('r32-10', 'Tue, 30 Jun', T.ivoryCoast, 1, T.norway, 2, 'away'),
      finished('r32-11', 'Wed, 1 Jul', T.mexico, 2, T.ecuador, 0, 'home'),
      finished('r32-12', 'Wed, 1 Jul', T.england, 2, T.drCongo, 1, 'home'),
      finished('r32-13', 'Fri, 3 Jul', T.switzerland, 2, T.algeria, 0, 'home'),
      finished('r32-14', 'Sat, 4 Jul', T.colombia, 1, T.ghana, 0, 'home'),
      finished('r32-15', 'Sat, 4 Jul', T.argentina, 3, T.caboVerde, 2, 'home'),
      finished('r32-16', 'Fri, 3 Jul', T.australia, 1, T.egypt, 1, 'away', [2, 4]),
    ],
  },
  {
    name: 'Round of 16',
    matches: [
      finished('r16-1', 'Sat, 4 Jul', T.canada, 0, T.morocco, 3, 'away'),
      finished('r16-2', 'Sun, 5 Jul', T.paraguay, 0, T.france, 1, 'away'),
      finished('r16-3', 'Mon, 6 Jul', T.usa, 1, T.belgium, 4, 'away'),
      finished('r16-4', 'Mon, 6 Jul', T.portugal, 0, T.spain, 1, 'away'),
      finished('r16-5', 'Mon, 6 Jul', T.brazil, 2, T.norway, 1, 'home'),
      finished('r16-6', 'Mon, 6 Jul', T.mexico, 2, T.england, 3, 'away'),
      finished('r16-7', 'Tue, 7 Jul', T.switzerland, 0, T.colombia, 0, 'home', [4, 3]),
      finished('r16-8', 'Tue, 7 Jul', T.argentina, 3, T.egypt, 2, 'home'),
    ],
  },
  {
    name: 'Quarter-finals',
    matches: [
      finished('qf-1', 'Fri, 10 Jul', T.france, 2, T.morocco, 0, 'home'),
      finished('qf-2', 'Sat, 11 Jul', T.spain, 2, T.belgium, 1, 'home'),
      finished('qf-3', 'Sun, 12 Jul', T.brazil, 2, T.england, 0, 'home'),
      finished('qf-4', 'Sun, 12 Jul', T.argentina, 2, T.switzerland, 1, 'home'),
    ],
  },
  {
    name: 'Semi-finals',
    matches: [
      finished('sf-1', 'Wed, 15 Jul', T.france, 1, T.spain, 2, 'away'),
      finished('sf-2', 'Thu, 16 Jul', T.brazil, 1, T.argentina, 0, 'home'),
    ],
  },
  {
    name: 'Final',
    matches: [upcoming('final', 'Sun, 19 Jul', '12:00 pm', T.spain, T.brazil)],
  },
]

const WINDOWS = [[0, 1, 2], [1, 2, 3], [3, 4]] as const
const NARROW_WINDOWS = [[0, 1], [2, 3], [3, 4]] as const
const CARD_H = 48
const GAP_Y = 8
const HEADER_H = 28
const FOOTER_H = 22

function verticalPositions(baseRound: number, cardHeight: number, gapY: number) {
  const positions = WORLD_CUP_ROUNDS.map(() => [] as number[])
  positions[baseRound] = WORLD_CUP_ROUNDS[baseRound].matches.map((_, i) => i * (cardHeight + gapY))

  for (let round = baseRound + 1; round < WORLD_CUP_ROUNDS.length; round += 1) {
    positions[round] = WORLD_CUP_ROUNDS[round].matches.map((_, i) =>
      (positions[round - 1][i * 2] + positions[round - 1][i * 2 + 1]) / 2,
    )
  }
  for (let round = baseRound - 1; round >= 0; round -= 1) {
    const scale = 2 ** (baseRound - round)
    positions[round] = WORLD_CUP_ROUNDS[round].matches.map((_, i) => positions[baseRound][Math.floor(i / scale)])
  }
  return positions
}

function MatchCard({ match, dense, light }: { match: Match; dense: boolean; light: boolean }) {
  const score = (sideData: MatchSide) => {
    if (sideData.score === null) return '–'
    return sideData.penalties === undefined ? sideData.score : `${sideData.score} (${sideData.penalties})`
  }

  return (
    <div
      data-match-card=""
      className={`relative h-full overflow-hidden rounded-[8px] border ${light ? 'border-[var(--border-line)] bg-[var(--bg-surface)]' : 'border-white/[0.08] bg-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.18)]'}`}
    >
      <div className={`flex items-center justify-between border-b px-2 ${light ? 'border-[var(--border-subtle)] text-[var(--text-tertiary)]' : 'border-white/[0.06] text-white/35'} ${dense ? 'h-[10px] text-[6px]' : 'h-4 text-[8px]'}`}>
        <span className="truncate">{match.date}{match.time ? ` · ${match.time}` : ''}</span>
        <span className="ml-1 shrink-0">{match.status === 'finished' ? (match.home.penalties === undefined ? 'FT' : 'FT (P)') : 'UPCOMING'}</span>
      </div>
      {(['home', 'away'] as const).map((slot) => {
        const current = match[slot]
        const won = match.winner === slot
        const lost = match.status === 'finished' && !won
        return (
          <div key={slot} className={`relative flex items-center gap-1.5 px-2 ${dense ? 'h-3 text-[8px]' : 'h-4 text-[10px]'} ${light ? (lost ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]') : (lost ? 'text-white/30' : 'text-white/85')}`}>
            <span className={`shrink-0 text-center leading-none ${dense ? 'w-3 text-[9px]' : 'w-3.5 text-[11px]'}`} aria-hidden="true">{current.team?.flag ?? '◇'}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{current.team?.name ?? 'TBD'}</span>
            <span className={`shrink-0 font-mono tabular-nums ${dense ? 'text-[7px]' : 'text-[9px]'}`}>{score(current)}</span>
            {won && (
              <>
                <span aria-label="Winner" className="sr-only">Winner</span>
                <span aria-hidden="true" className={`absolute right-[2px] top-1/2 -translate-y-1/2 border-y-[3px] border-r-[5px] border-y-transparent ${light ? 'border-r-[var(--text-secondary)]' : 'border-r-white/65'}`} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function KnockoutBracketDemo({
  initialPage = 1,
  compact = false,
  light = false,
  showNavigation = true,
  controls,
}: {
  initialPage?: number
  compact?: boolean
  light?: boolean
  showNavigation?: boolean
  controls?: KnockoutControls
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(Math.max(0, Math.min(WINDOWS.length - 1, initialPage)))
  const [size, setSize] = useState({ width: 640, height: 240 })

  useEffect(() => {
    const stage = stageRef.current!
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((current) =>
        Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1 ? current : { width, height },
      )
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!controls) return
    controls.previous = () => setPage((current) => Math.max(0, current - 1))
    controls.next = () => setPage((current) => Math.min(WINDOWS.length - 1, current + 1))
    controls.reset = () => setPage(Math.max(0, Math.min(WINDOWS.length - 1, initialPage)))
    return () => {
      controls.previous = undefined
      controls.next = undefined
      controls.reset = undefined
    }
  }, [controls, initialPage])

  const pageWindows = size.width < 360 && !compact ? NARROW_WINDOWS : WINDOWS
  const visibleRounds = pageWindows[page]
  const baseRound = visibleRounds[0]
  const dense = compact && size.height < 132
  const baseCount = WORLD_CUP_ROUNDS[baseRound].matches.length
  const gapY = dense ? 2 : GAP_Y
  const headerHeight = dense ? Math.max(16, Math.min(22, Math.floor(size.height * 0.2))) : HEADER_H
  const cardHeight = dense
    ? Math.min(38, Math.max(34, (size.height - headerHeight - (baseCount - 1) * gapY) / baseCount))
    : CARD_H
  const y = verticalPositions(baseRound, cardHeight, gapY)
  const cardsHeight = baseCount * cardHeight + (baseCount - 1) * gapY
  const contentHeight = headerHeight + cardsHeight + (compact ? 0 : FOOTER_H)
  const topOffset = compact ? Math.max(0, (size.height - (headerHeight + cardsHeight)) / 2) : 0
  const edge = compact ? 40 : 52
  const gapX = size.width < 480 ? 22 : 34
  const columnCount = visibleRounds.length
  const usableWidth = Math.max(0, size.width - edge * 2)
  const minCardWidth = Math.max(64, Math.min(88, (size.width - gapX * (columnCount - 1) - 8) / columnCount))
  const cardWidth = Math.min(190, Math.max(minCardWidth, (usableWidth - gapX * (columnCount - 1)) / columnCount))
  const totalWidth = cardWidth * columnCount + gapX * (columnCount - 1)
  const innerLeft = (size.width - totalWidth) / 2

  const leftForRound = (round: number) => {
    const visibleColumn = (visibleRounds as readonly number[]).indexOf(round)
    if (visibleColumn >= 0) return innerLeft + visibleColumn * (cardWidth + gapX)
    return round < baseRound ? innerLeft - cardWidth - gapX : innerLeft + totalWidth + gapX
  }

  const stopCardNavigation = (event: React.MouseEvent<HTMLButtonElement>, nextPage: number) => {
    event.preventDefault()
    event.stopPropagation()
    setPage(nextPage)
  }

  const connectors = WORLD_CUP_ROUNDS.slice(1).flatMap((round, index) => {
    const roundIndex = index + 1
    const previous = roundIndex - 1
    const visible = (visibleRounds as readonly number[]).includes(previous)
      && (visibleRounds as readonly number[]).includes(roundIndex)
    const fromX = leftForRound(previous) + cardWidth
    const toX = Math.max(fromX, leftForRound(roundIndex))
    const middleX = (fromX + toX) / 2
    return round.matches.flatMap((match, i) => {
      const firstY = topOffset + headerHeight + y[previous][i * 2] + cardHeight / 2
      const secondY = topOffset + headerHeight + y[previous][i * 2 + 1] + cardHeight / 2
      const targetY = topOffset + headerHeight + y[roundIndex][i] + cardHeight / 2
      const horizontalStyle = (top: number): CSSProperties => ({ left: fromX, top, width: middleX - fromX, opacity: visible ? 1 : 0 })
      return [
        <span key={`${match.id}-a`} className={`kb-line absolute h-px ${light ? 'bg-[var(--border-ring)]' : 'bg-white/10'}`} style={horizontalStyle(firstY)} />,
        <span key={`${match.id}-b`} className={`kb-line absolute h-px ${light ? 'bg-[var(--border-ring)]' : 'bg-white/10'}`} style={horizontalStyle(secondY)} />,
        <span key={`${match.id}-v`} className={`kb-line absolute w-px ${light ? 'bg-[var(--border-ring)]' : 'bg-white/10'}`} style={{ left: middleX, top: Math.min(firstY, secondY), height: Math.abs(secondY - firstY), opacity: visible ? 1 : 0 }} />,
        <span key={`${match.id}-out`} className={`kb-line absolute h-px ${light ? 'bg-[var(--border-ring)]' : 'bg-white/10'}`} style={{ left: middleX, top: targetY, width: toX - middleX, opacity: visible ? 1 : 0 }} />,
      ]
    })
  })

  return (
    <div
      ref={stageRef}
      data-page={page}
      data-appearance={light ? 'light' : 'dark'}
      role="group"
      aria-label="World Cup knockout bracket with Brazil in the final"
      className={`kb-stage relative w-full overflow-hidden ${light ? 'bg-[var(--bg-page)] text-[var(--text-primary)]' : 'bg-[#080808] text-white'}`}
      style={{ height: compact ? '100%' : contentHeight }}
    >
      <div aria-hidden="true">{connectors}</div>

      {WORLD_CUP_ROUNDS.map((round, roundIndex) => {
        const visible = visibleRounds.includes(roundIndex as never)
        return (
          <div key={round.name}>
            <div
              aria-hidden={!visible}
              className={`kb-move absolute flex items-center justify-center text-center text-[10px] font-medium ${light ? 'text-[var(--text-secondary)]' : 'text-white/55'}`}
              style={{ left: leftForRound(roundIndex), top: topOffset, width: cardWidth, height: headerHeight, opacity: visible ? 1 : 0 }}
            >
              {round.name}
            </div>
            {round.matches.map((match, matchIndex) => (
              <div
                key={match.id}
                data-round={round.name}
                data-match={match.id}
                aria-hidden={!visible}
                className="kb-move absolute"
                style={{
                  left: leftForRound(roundIndex),
                  top: topOffset + headerHeight + y[roundIndex][matchIndex],
                  width: cardWidth,
                  height: cardHeight,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.96)',
                  pointerEvents: visible ? 'auto' : 'none',
                }}
              >
                <MatchCard match={match} dense={dense} light={light} />
              </div>
            ))}
          </div>
        )
      })}

      {showNavigation && (
        <>
          <button
            type="button"
            aria-label="Previous round"
            disabled={page === 0}
            onClick={(event) => stopCardNavigation(event, Math.max(0, page - 1))}
            className={`absolute left-2 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition-[opacity,background-color,border-color,color,transform] duration-200 active:scale-95 ${light ? 'border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-ring)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]' : 'border-white/10 bg-black/65 text-white/70 backdrop-blur-sm hover:bg-white/10'} ${page === 0 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next round"
            disabled={page === WINDOWS.length - 1}
            onClick={(event) => stopCardNavigation(event, Math.min(WINDOWS.length - 1, page + 1))}
            className={`absolute right-2 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border text-lg transition-[opacity,background-color,border-color,color,transform] duration-200 active:scale-95 ${light ? 'border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-ring)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]' : 'border-white/10 bg-black/65 text-white/70 backdrop-blur-sm hover:bg-white/10'} ${page === WINDOWS.length - 1 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          >
            ›
          </button>
        </>
      )}

      {!compact && (
        <p className={`absolute bottom-0 left-0 right-0 h-[22px] text-center font-mono text-[8px] leading-[22px] ${light ? 'text-[var(--text-tertiary)]' : 'text-white/25'}`}>
          A completely unbiased bracket · Pacific Time
        </p>
      )}
    </div>
  )
}
