import { useEffect, useState } from 'react'
import { recordView, getPageView, getTotalView, pageKeyFromPath } from './viewCounter'

export function usePageView(pageKey?: string) {
  const [counts, setCounts] = useState({ total: 0, page: 0 })

  useEffect(() => {
    const key = pageKey || pageKeyFromPath(window.location.pathname.replace(/\/personal-site/, '') || '/')
    const result = recordView(key)
    setCounts(result)
  }, [pageKey])

  return counts
}

export function useViewCounts(pageKey?: string) {
  const [counts, setCounts] = useState({ total: 0, page: 0 })

  useEffect(() => {
    const key = pageKey || pageKeyFromPath(window.location.pathname.replace(/\/personal-site/, '') || '/')
    setCounts({
      total: getTotalView(),
      page: getPageView(key),
    })
  }, [pageKey])

  return counts
}
