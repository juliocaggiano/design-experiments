import { LinkCard, Caption } from './Card'

interface Props {
  href: string
  title: string
  category: string
  poster: string
  sources: { src: string; type: string }[]
  mediaBg?: string
  scale?: boolean
}

export function VideoCard({ href, title, category, poster, sources, mediaBg, scale }: Props) {
  return (
    <LinkCard href={href}>
      <div
        className="relative aspect-video overflow-hidden rounded-[12px] border border-[var(--border-line)]"
        style={{ background: mediaBg ?? '#fff' }}
      >
        <video
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          className="h-full w-full object-cover"
          style={scale ? { transform: 'scale(1.02)' } : undefined}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      </div>
      <Caption title={title} category={category} />
    </LinkCard>
  )
}
