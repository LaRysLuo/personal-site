import type { GameMeta, BlogMeta, GameData, BlogData } from '../types'

async function fetchText(path: string): Promise<string> {
  const resp = await fetch(path)
  if (!resp.ok) throw new Error(`Failed to load ${path}`)
  return resp.text()
}

function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const data: Record<string, any> = {}
  let content = raw

  if (raw.startsWith('---')) {
    const end = raw.indexOf('---', 3)
    if (end !== -1) {
      const fm = raw.slice(3, end).trim()
      content = raw.slice(end + 3).trim()

      for (const line of fm.split('\n')) {
        const colonIdx = line.indexOf(':')
        if (colonIdx === -1) continue
        const key = line.slice(0, colonIdx).trim()
        let val: any = line.slice(colonIdx + 1).trim()

        if (val === 'true') val = true
        else if (val === 'false') val = false
        else if (val.startsWith('[') && val.endsWith(']')) {
          val = JSON.parse(val.replace(/'/g, '"'))
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1)
        } else if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1)
        }

        data[key] = val
      }
    }
  }

  return { data, content }
}

function parseGameMeta(slug: string, raw: string): GameMeta {
  const { data } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '2025-01-01',
    tags: data.tags || [],
    cover: data.cover,
    cardCover: data.cardCover || data.card_cover,
    featuredCover: data.featuredCover || data.featured_cover,
    summary: data.summary || '',
    status: data.status || 'released',
    steamUrl: data.steamUrl || data.steam_url,
  }
}

function parseBlogMeta(slug: string, raw: string): BlogMeta {
  const { data } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '2025-01-01',
    tags: data.tags || [],
    cover: data.cover,
    summary: data.summary || '',
  }
}

export async function loadGameList(): Promise<GameMeta[]> {
  const resp = await fetch(`/content/games/index.json?t=${Date.now()}`)
  const slugs: string[] = await resp.json()
  const metas: GameMeta[] = []

  for (const slug of slugs) {
    try {
      const raw = await fetchText(`/content/games/${slug}.md?t=${Date.now()}`)
      metas.push(parseGameMeta(slug, raw))
    } catch {
      console.warn(`Failed to load game: ${slug}`)
    }
  }

  return metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function loadGame(slug: string): Promise<GameData | null> {
  try {
    const raw = await fetchText(`/content/games/${slug}.md?t=${Date.now()}`)
    const { data, content } = parseFrontmatter(raw)
    return {
      meta: {
        slug,
        title: data.title || slug,
        date: data.date || '2025-01-01',
        tags: data.tags || [],
        cover: data.cover,
        cardCover: data.cardCover || data.card_cover,
        featuredCover: data.featuredCover || data.featured_cover,
        summary: data.summary || '',
        status: data.status || 'released',
        steamUrl: data.steamUrl || data.steam_url,
      },
      content,
    }
  } catch {
    return null
  }
}

export async function loadBlogList(): Promise<BlogMeta[]> {
  const resp = await fetch(`/content/blog/index.json?t=${Date.now()}`)
  const slugs: string[] = await resp.json()
  const metas: BlogMeta[] = []

  for (const slug of slugs) {
    try {
      const raw = await fetchText(`/content/blog/${slug}.md?t=${Date.now()}`)
      metas.push(parseBlogMeta(slug, raw))
    } catch {
      console.warn(`Failed to load blog: ${slug}`)
    }
  }

  return metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function loadBlogPost(slug: string): Promise<BlogData | null> {
  try {
    const raw = await fetchText(`/content/blog/${slug}.md?t=${Date.now()}`)
    const { data, content } = parseFrontmatter(raw)
    return {
      meta: {
        slug,
        title: data.title || slug,
        date: data.date || '2025-01-01',
        tags: data.tags || [],
        cover: data.cover,
        summary: data.summary || '',
      },
      content,
    }
  } catch {
    return null
  }
}
