export interface GameMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  cover?: string
  cardCover?: string
  featuredCover?: string
  summary: string
  status: 'released' | 'developing' | 'prototype'
  steamUrl?: string
}

export interface GameData {
  meta: GameMeta
  content: string
}

export interface BlogMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  cover?: string
}

export interface BlogData {
  meta: BlogMeta
  content: string
}

export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export interface SearchResult {
  title: string
  type: 'game' | 'blog'
  slug: string
  summary: string
}
