import { useEffect, useRef, useState } from 'react'

/* Micro buttons — nine pills matching Amicro's interaction catalogue 1:1
   (amicro.vercel.app, Syed Subhan), rebuilt from scratch on the vault's
   light surfaces. Everything is HOVER-driven, like the original: icon swaps
   ride a stiff spring-feel curve (≈ stiffness 600 / damping 25), and only
   Copy Hash carries state (its label reads "Copied" and lingers 500ms after
   the pointer leaves).
   A `.hot` class stands in for hover so touch, the idle loop, and Play-all
   drive the exact same states. */

export interface MicroButtonsControls {
  playAll?: () => void
  reset?: () => void
}

export interface MicroButtonsDemoProps {
  speed?: number // duration multiplier, 1 = shipped values
  pop?: number // extra pulse peak, 0..0.3
  ambient?: boolean
  controls?: MicroButtonsControls
}

const NAMES = ['account', 'sparkle', 'deploy', 'copy', 'pulse', 'rotate', 'shake', 'ring', 'theme'] as const
type Name = (typeof NAMES)[number]

export function MicroButtonsDemo({
  speed = 1,
  pop = 0.12,
  ambient = true,
  controls,
}: MicroButtonsDemoProps) {
  const [hot, setHot] = useState<ReadonlySet<Name>>(new Set())
  const timers = useRef<Set<number>>(new Set())
  const lastInteraction = useRef(-1e9)
  const speedRef = useRef(speed)
  speedRef.current = speed

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => { timers.current.delete(id); fn() }, ms / speedRef.current)
    timers.current.add(id)
    return id
  }
  const add = (n: Name) => setHot((s) => (s.has(n) ? s : new Set(s).add(n)))
  const remove = (n: Name) => setHot((s) => { if (!s.has(n)) return s; const next = new Set(s); next.delete(n); return next })

  const enter = (n: Name) => {
    lastInteraction.current = performance.now()
    add(n)
  }
  const leave = (n: Name) => {
    lastInteraction.current = performance.now()
    // Copy's "Copied" state lingers half a second after the pointer leaves
    if (n === 'copy') later(() => remove(n), 500)
    else remove(n)
  }
  const touch = (n: Name) => {
    enter(n)
    later(() => leave(n), 700)
  }

  useEffect(() => {
    if (controls) {
      controls.playAll = () => {
        lastInteraction.current = performance.now()
        setHot(new Set(NAMES))
        later(() => setHot(new Set()), 1400)
      }
      controls.reset = () => {
        lastInteraction.current = performance.now()
        setHot(new Set())
      }
    }
    // idle: ghost-hover one button at a time so the card reads alive
    let i = 0
    const tick = window.setInterval(() => {
      if (!ambient) return
      if (performance.now() - lastInteraction.current < 6000) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const n = NAMES[i % NAMES.length]
      i += 1
      add(n)
      later(() => remove(n), 1400)
    }, 2600)
    const t = timers.current
    return () => {
      window.clearInterval(tick)
      t.forEach((id) => window.clearTimeout(id))
      t.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient, controls])

  const btnProps = (name: Name, cls: string) => ({
    type: 'button' as const,
    className: `bt ${cls} ${hot.has(name) ? 'hot' : ''}`,
    onMouseEnter: () => { if (window.matchMedia('(hover: hover)').matches) enter(name) },
    onMouseLeave: () => { if (window.matchMedia('(hover: hover)').matches) leave(name) },
    onFocus: () => enter(name),
    onBlur: () => leave(name),
    onTouchStart: () => touch(name),
    onClick: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() },
  })

  return (
    <div
      className="bt-box"
      style={{ ['--bt-speed' as string]: speed, ['--bt-pop' as string]: pop }}
    >
      <div className="bt-grid">
        {/* morph: user crossfades to user-with-check (emerald) */}
        <button {...btnProps('account', 'bt-morph')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.6" /><path d="M2.8 13.6a5.2 5.2 0 0110.4 0" /></svg>
            </span>
            <span className="i2" style={{ color: '#10b981' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="5" r="2.4" /><path d="M1.6 13.6a4.6 4.6 0 019 0" /><path d="M10.3 8.7l1.8 1.8L15 7.2" /></svg>
            </span>
          </span>
          <span className="bt-label">Account</span>
        </button>

        {/* sparkle: star drops in from below, mini stars pop at offset delays */}
        <button {...btnProps('sparkle', 'bt-sparkle')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="4.5" cy="3.5" r="1.7" /><circle cx="4.5" cy="12.5" r="1.7" /><circle cx="11.5" cy="4.5" r="1.7" /><path d="M4.5 5.2v5.6M11.5 6.2c0 3.3-7 2.2-7 4.8" /></svg>
            </span>
            <span className="i2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.2L8 11.5l-3.8 2 .7-4.2-3.1-3 4.3-.6z" /></svg>
              <svg className="bt-mini m1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /></svg>
              <svg className="bt-mini m2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" /></svg>
            </span>
          </span>
          <span className="bt-label">Star on GitHub</span>
        </button>

        {/* morph: cloud crossfades to cloud-upload (blue) */}
        <button {...btnProps('deploy', 'bt-morph')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5a3.5 3.5 0 01-.6-6.95 4.5 4.5 0 018.8 1.1 3 3 0 01-.7 5.85z" /></svg>
            </span>
            <span className="i2" style={{ color: '#60a5fa' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 11.5a3.5 3.5 0 01-.6-6.95 4.5 4.5 0 018.8 1.1 3 3 0 01-.7 5.85" /><path d="M8 14v-4.5M6 11l2-2 2 2" /></svg>
            </span>
          </span>
          <span className="bt-label">Deploy App</span>
        </button>

        {/* morph + label swap: copy → check, "Copy Hash" → "Copied" */}
        <button {...btnProps('copy', 'bt-morph')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M3 10.5A1.5 1.5 0 011.8 9V3.3A1.5 1.5 0 013.3 1.8H9a1.5 1.5 0 011.4 1.2" /></svg>
            </span>
            <span className="i2" style={{ color: '#10b981' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.5 3.5L13 4.5" /></svg>
            </span>
          </span>
          <span className="bt-lswap">
            <span className="bt-label l1">Copy Hash</span>
            <span className="bt-label l2">Copied</span>
          </span>
        </button>

        {/* pulse: one heartbeat, heart fills pink while hovered */}
        <button {...btnProps('pulse', 'bt-pulse')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M8 13.6S2 9.9 2 5.9a3.1 3.1 0 016-1.2 3.1 3.1 0 016 1.2c0 4-6 7.7-6 7.7z" /></svg>
            </span>
          </span>
          <span className="bt-label">Sponsor</span>
        </button>

        {/* rotate: half turn while hovered, springs back */}
        <button {...btnProps('rotate', 'bt-rotate')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.2" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" /></svg>
            </span>
          </span>
          <span className="bt-label">Settings</span>
        </button>

        {/* shake: the trash bobs and wiggles once, reads red while hovered */}
        <button {...btnProps('shake', 'bt-shake')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4h11M6.5 4V2.8a.8.8 0 01.8-.8h1.4a.8.8 0 01.8.8V4M4 4l.7 9a1.3 1.3 0 001.3 1.2h4a1.3 1.3 0 001.3-1.2L12 4" /></svg>
            </span>
          </span>
          <span className="bt-label">Delete</span>
        </button>

        {/* ring: bell swaps to a ringing bell (orange) with a red dot */}
        <button {...btnProps('ring', 'bt-ring')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 00-4 4c0 3.2-1.2 4.2-1.2 4.2h10.4S12 9.2 12 6a4 4 0 00-4-4zM6.7 13.5a1.4 1.4 0 002.6 0" /></svg>
            </span>
            <span className="i2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 00-4 4c0 3.2-1.2 4.2-1.2 4.2h10.4S12 9.2 12 6a4 4 0 00-4-4zM6.7 13.5a1.4 1.4 0 002.6 0" /><path d="M13.6 2.2c.7.8 1.1 1.7 1.2 2.8M2.4 2.2c-.7.8-1.1 1.7-1.2 2.8" /></svg>
              <span className="bt-dot" />
            </span>
          </span>
          <span className="bt-label">Subscribe</span>
        </button>

        {/* morph: moon crossfades to sun (yellow) */}
        <button {...btnProps('theme', 'bt-morph')}>
          <span className="bt-ic">
            <span className="i1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 9.5A5.5 5.5 0 116.5 2.5a4.3 4.3 0 007 7z" /></svg>
            </span>
            <span className="i2" style={{ color: '#eab308' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="3" /><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M13 3l-1.1 1.1M4.1 11.9L3 13" /></svg>
            </span>
          </span>
          <span className="bt-label">Theme</span>
        </button>
      </div>
    </div>
  )
}
