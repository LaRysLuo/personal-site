import type { AIConfig } from '../types'

export interface ContentItem {
  title: string
  type: 'game' | 'blog'
  slug: string
  summary: string
  body: string
}

const STORAGE_KEY = 'animal-island-ai-config'

const MAX_BODY_LENGTH = 3000

export function getAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function clearAIConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function trimBody(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '\n...（内容已截断）'
}

export function buildSiteContext(items: ContentItem[]): string {
  let ctx = '以下是个人网站的全部内容：\n\n'
  items.forEach((item, i) => {
    ctx += `【${i + 1}】类型：${item.type === 'game' ? '游戏作品' : '博客文章'}\n`
    ctx += `标题：${item.title}\n`
    ctx += `简介：${item.summary}\n`
    ctx += `完整内容：\n${trimBody(item.body, MAX_BODY_LENGTH)}\n`
    ctx += `链接：#/${item.type === 'game' ? 'games' : 'blog'}/${item.slug}\n\n`
    ctx += '---\n\n'
  })
  return ctx
}

export async function searchWithAI(
  query: string,
  context: string,
  config: AIConfig,
): Promise<string> {
  const { apiKey, baseUrl, model } = config

  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `你是一个个人网站的内容助手，名字叫"悠月的小世界助手"。请基于以下网站全部内容来回答用户的问题。

回答要求：
1. 回答要简洁、友好、热情，自然地使用表情符号
2. 如果找到相关内容，请给出详细信息并附上页面链接（格式如 #/games/xxx 或 #/blog/xxx）
3. 如果找不到相关信息，请诚实地告诉用户你的知识库中没有相关信息
4. 如果有多个相关内容，请全部列举出来
5. 回答使用中文`,
        },
        {
          role: 'user',
          content: `${context}\n\n---\n\n用户的问题是：${query}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '')
    throw new Error(`AI 请求失败 (${resp.status}): ${errBody || resp.statusText}`)
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content || '抱歉，没有获取到回答。'
}
