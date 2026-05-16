export interface Message {
  id: string
  name: string
  content: string
  website?: string
  createdAt: string
}

const API_BASE = 'https://personal-site-messages.larysword.workers.dev'

export async function fetchMessages(): Promise<Message[]> {
  const resp = await fetch(`${API_BASE}/api/messages`)
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '获取留言失败')
  return data.messages
}

export async function postMessage(params: {
  name: string
  content: string
  website?: string
}): Promise<Message> {
  const resp = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '发布留言失败')
  return data.message
}
