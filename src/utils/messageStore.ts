export interface Message {
  id: string
  name: string
  github?: string
  email?: string
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
}

export interface EmailUser {
  email: string
  name: string
  avatar: string
}

const OWNER = 'LaRysLuo'
const REPO = 'personal-site'
const MESSAGES_DIR = 'src/content/messages'
const INDEX_FILE = 'src/content/messages/index.json'
const PAT = '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'

function githubApi(path: string, options?: RequestInit): Promise<any> {
  return fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'personal-site',
      ...options?.headers,
    },
  }).then(res => {
    if (!res.ok) return res.json().then(e => Promise.reject(new Error(e.message || 'GitHub API error')))
    return res.json()
  })
}

function base64Encode(str: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function md5Hash(str: string): Promise<string> {
  const data = new TextEncoder().encode(str.toLowerCase().trim())
  const hash = await crypto.subtle.digest('MD5', data)
  return hex(hash)
}

export function gravatarUrl(email: string, size = 100): string {
  const hash = email.toLowerCase().trim()
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}

export function gravatarUrlHash(emailHash: string, size = 100): string {
  return `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=${size}`
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { 'User-Agent': 'personal-site' },
  })
  if (!res.ok) throw new Error('用户不存在')
  return res.json()
}

export async function loadMessages(): Promise<Message[]> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${INDEX_FILE}?_t=${Date.now()}`,
      { headers: { 'Cache-Control': 'no-cache' } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.reverse() : []
  } catch {
    return []
  }
}

export async function postMessage(params: {
  name: string
  github?: string
  email?: string
  emailHash?: string
  avatar: string
  content: string
  website?: string
}): Promise<Message> {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const now = new Date().toISOString()

  const message: Message = {
    id,
    name: params.name,
    avatar: params.avatar || '',
    website: params.website || undefined,
    content: params.content.trim(),
    createdAt: now,
  }

  if (params.github) message.github = params.github
  if (params.emailHash) message.email = params.emailHash

  const mdLines = [
    '---',
    `id: "${message.id}"`,
    `name: "${message.name}"`,
    message.github ? `github: "${message.github}"` : '',
    message.email ? `email: "${message.email}"` : '',
    `avatar: "${message.avatar}"`,
    message.website ? `website: "${message.website}"` : '',
    `createdAt: "${message.createdAt}"`,
    '---',
    '',
    message.content,
  ].filter(Boolean).join('\n')

  // Commit the .md file
  const mdFile = `${MESSAGES_DIR}/${id}.md`
  await githubApi(`/repos/${OWNER}/${REPO}/contents/${mdFile}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `feat: new message from ${message.name}`,
      content: base64Encode(mdLines),
    }),
  })

  // Update index.json
  const indexResult = await githubApi(`/repos/${OWNER}/${REPO}/contents/${INDEX_FILE}`)
  const existingMessages: Message[] = JSON.parse(atob(indexResult.content))
  existingMessages.push(message)

  await githubApi(`/repos/${OWNER}/${REPO}/contents/${INDEX_FILE}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `feat: update messages index (${message.name})`,
      content: base64Encode(JSON.stringify(existingMessages, null, 2)),
      sha: indexResult.sha,
    }),
  })

  return message
}
