import { useState, useEffect } from 'react'
import { useViewCounts } from '../utils/usePageView'
import { getPageView } from '../utils/viewCounter'

export function PageViewCounter({ pageKey }: { pageKey?: string }) {
  const counts = useViewCounts(pageKey)

  if (counts.total === 0) return null

  return (
    <span style={{
      fontSize: 12,
      color: '#a0936e',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      👁 {counts.page}
    </span>
  )
}

export function SiteViewCounter() {
  const counts = useViewCounts()

  if (counts.total === 0) return null

  return (
    <span style={{
      fontSize: 11,
      color: 'var(--text-muted)',
      opacity: 0.6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      👁 全站 {counts.total} · 本页 {counts.page}
    </span>
  )
}

export function ViewCountBadge({ pageKey }: { pageKey: string }) {
  const [count, setCount] = useState(getPageView(pageKey))

  useEffect(() => {
    setCount(getPageView(pageKey))
  }, [pageKey])

  if (count === 0) return null

  return (
    <span style={{
      fontSize: 11,
      color: 'inherit',
      opacity: 0.65,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
    }}>
      浏览数：{count}
    </span>
  )
}
