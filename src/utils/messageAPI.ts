export interface Message {
  id: string
  name: string
  github: string
  avatar: string
  content: string
  createdAt: string
}

export interface SessionUser {
  login: string
  name: string
  avatar_url: string
  html_url: string
}

const API_BASE = 'https://personal-site-messages.larysword.workers.dev'
const TOKEN_KEY = 'github_session_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function login(): void {
  window.location.href = `${API_BASE}/auth/github`
}

export function logout(): void {
  clearToken()
}

export async function me(): Promise<SessionUser> {
  const resp = await fetch(`${API_BASE}/api/me`, {
    headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' },
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '未登录')
  return data.user
}

export async function loadMessages(): Promise<Message[]> {
  const resp = await fetch(`${API_BASE}/api/messages`, {
    headers: { 'Cache-Control': 'no-cache' },
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '获取留言失败')
  return data.messages
}

export async function postMessage(content: string): Promise<Message> {
  const resp = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ content }),
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.error || '发布留言失败')
  return data.message
}
