const VIEWS_KEY = 'site-views'

interface ViewData {
  total: number
  pages: Record<string, number>
}

function load(): ViewData {
  try {
    const raw = localStorage.getItem(VIEWS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { total: 0, pages: {} }
}

function save(data: ViewData) {
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export function recordView(pageKey: string): { total: number; page: number } {
  const data = load()
  data.total = (data.total || 0) + 1
  data.pages[pageKey] = (data.pages[pageKey] || 0) + 1
  save(data)
  return { total: data.total, page: data.pages[pageKey] }
}

export function getViews(): ViewData {
  return load()
}

export function getPageView(pageKey: string): number {
  return load().pages[pageKey] || 0
}

export function getTotalView(): number {
  return load().total || 0
}

export function pageKeyFromPath(path: string): string {
  return path || '/'
}
