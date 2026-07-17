import { useEffect, useState } from 'react'

/* Minimal history router — two views, no dependency needed. */

const listeners = new Set<() => void>()

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  listeners.forEach((l) => l())
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  return path
}
