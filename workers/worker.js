const ALLOWED_ORIGINS = [
  'https://larysluo.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsHeaders(origin) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://larysluo.github.io'
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    'Access-Control-Max-Age': '86400',
  }
}

const KV_KEY = 'messages'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        let raw = '[]'
        if (env.MESSAGES_KV) {
          const val = await env.MESSAGES_KV.get(KV_KEY, 'text')
          if (val) raw = val
        }
        const messages = JSON.parse(raw)
        messages.reverse()
        return new Response(JSON.stringify({ ok: true, messages }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      if (request.method === 'GET' && url.pathname.startsWith('/api/github-user/')) {
        const username = url.pathname.slice('/api/github-user/'.length)
        if (!username) throw new Error('用户名不能为空')
        const ghResp = await fetch(`https://api.github.com/users/${username}`, {
          headers: { 'User-Agent': 'cloudflare-worker-personal-site' },
        })
        if (ghResp.status === 404) {
          return new Response(JSON.stringify({
            ok: false,
            error: `GitHub 用户 "${username}" 不存在，请检查拼写是否正确`,
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          })
        }
        if (!ghResp.ok) {
          return new Response(JSON.stringify({
            ok: false,
            error: 'GitHub API 暂时不可用，请稍后重试',
          }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          })
        }
        const ghData = await ghResp.json()
        return new Response(JSON.stringify({
          ok: true,
          user: {
            login: ghData.login,
            name: ghData.name || ghData.login,
            avatar_url: ghData.avatar_url,
            html_url: ghData.html_url,
            blog: ghData.blog || '',
          },
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const body = await request.json()
        if (!body.name || !body.github) {
          return new Response(JSON.stringify({ ok: false, error: '缺少昵称或 GitHub 账号' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          })
        }
        if (!body.content || !body.content.trim() || body.content.trim().length > 2000) {
          return new Response(JSON.stringify({ ok: false, error: '留言内容不能为空或超过 2000 字' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          })
        }

        let raw = '[]'
        if (env.MESSAGES_KV) {
          const val = await env.MESSAGES_KV.get(KV_KEY, 'text')
          if (val) raw = val
        }
        const messages = JSON.parse(raw)
        const message = {
          id: uuid(),
          name: body.name,
          github: body.github,
          avatar: body.avatar || '',
          website: body.website || undefined,
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
        }
        messages.push(message)
        if (env.MESSAGES_KV) {
          await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(messages))
        }

        return new Response(JSON.stringify({ ok: true, message }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      return new Response(JSON.stringify({ ok: false, error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message || 'Internal Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }
  },
}
