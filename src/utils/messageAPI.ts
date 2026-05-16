export interface Message {
  id: string
  name: string
  github: string
  avatar: string
  content: string
  website?: string
  createdAt: string
}

export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  html_url: string
  blog: string
}

const API_BASE = 'https://personal-site-messages.larysword.workers.dev'

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { 'User-Agent': 'personal-site' },
  })
  if (!res.ok) throw new Error('用户不存在')
  return res.json()
}

export async function loadMessages(): Promise<Message[]> {
  const resp = await fetch(`${API_BASE}/api/messages`, {
    headers: { 'Cache-Control': 'no-cache' },
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '获取留言失败')
  return data.messages
}

export async function postMessage(params: {
  name: string
  github: string
  avatar: string
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
