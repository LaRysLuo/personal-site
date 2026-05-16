const ALLOWED_ORIGINS = [
  'https://larysluo.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const GITHUB_CLIENT_ID = 'Ov23liAn7Bq0xtywqQZK'
const GITHUB_CLIENT_SECRET = 'fd4f2956dfafc80ccb6f880efe336b54b2764d17'
const GITHUB_REDIRECT_URI = 'https://personal-site-messages.larysword.workers.dev/auth/github/callback'
const FRONTEND_URL = 'https://larysluo.github.io/personal-site'

const SESSION_TTL = 60 * 60 * 24 * 30
const KV_KEY = 'messages'

function corsHeaders(origin) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://larysluo.github.io'
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function extractToken(request) {
  const auth = request.headers.get('Authorization')
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

function json(data, status, origin) {
  const h = { 'Content-Type': 'application/json' }
  if (origin) Object.assign(h, corsHeaders(origin))
  return new Response(JSON.stringify(data), { status, headers: h })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      // ---- OAuth: 跳转到 GitHub 授权页 ----
      if (url.pathname === '/auth/github') {
        const state = uuid()
        const a = new URL('https://github.com/login/oauth/authorize')
        a.searchParams.set('client_id', GITHUB_CLIENT_ID)
        a.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
        a.searchParams.set('scope', 'read:user')
        a.searchParams.set('state', state)
        return Response.redirect(a.toString(), 302)
      }

      // ---- OAuth: GitHub 回调 ----
      if (url.pathname === '/auth/github/callback') {
        const code = url.searchParams.get('code')
        if (!code) return new Response('Missing code', { status: 400 })

        const tokResp = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
          }),
        })
        const tokData = await tokResp.json()
        const accessToken = tokData.access_token
        if (!accessToken) return new Response('Failed to get token', { status: 400 })

        const userResp = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'User-Agent': 'cloudflare-worker' },
        })
        const userData = await userResp.json()
        if (!userData.login) return new Response('Failed to get user', { status: 500 })

        const sessionToken = uuid()
        const session = {
          login: userData.login,
          name: userData.name || userData.login,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
        }
        if (env.MESSAGES_KV) {
          await env.MESSAGES_KV.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl: SESSION_TTL })
        }

        return Response.redirect(`${FRONTEND_URL}/?token=${sessionToken}#/messages`, 302)
      }

      // ---- API: 获取当前登录用户 ----
      if (url.pathname === '/api/me') {
        const token = extractToken(request)
        if (!token) return json({ ok: false, error: '未登录' }, 401, origin)

        if (!env.MESSAGES_KV) return json({ ok: false, error: 'KV 不可用' }, 500, origin)

        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) return json({ ok: false, error: '登录已过期' }, 401, origin)

        return json({ ok: true, user: JSON.parse(raw) }, 200, origin)
      }

      // ---- API: 获取留言列表 ----
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        let raw = '[]'
        if (env.MESSAGES_KV) {
          const val = await env.MESSAGES_KV.get(KV_KEY, 'text')
          if (val) raw = val
        }
        const msgs = JSON.parse(raw)
        msgs.reverse()
        return json({ ok: true, messages: msgs }, 200, origin)
      }

      // ---- API: 发布留言（需登录）----
      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const token = extractToken(request)
        if (!token) return json({ ok: false, error: '请先登录' }, 401, origin)
        if (!env.MESSAGES_KV) return json({ ok: false, error: 'KV 不可用' }, 500, origin)

        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) return json({ ok: false, error: '登录已过期' }, 401, origin)
        const session = JSON.parse(raw)

        const body = await request.json()
        if (!body.content || !body.content.trim() || body.content.trim().length > 2000) {
          return json({ ok: false, error: '留言内容无效' }, 400, origin)
        }

        const msRaw = await env.MESSAGES_KV.get(KV_KEY, 'text')
        const msgs = msRaw ? JSON.parse(msRaw) : []
        const msg = {
          id: uuid(),
          name: session.name,
          github: session.login,
          avatar: session.avatar_url,
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
        }
        msgs.push(msg)
        await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(msgs))

        return json({ ok: true, message: msg }, 201, origin)
      }

      return json({ ok: false, error: 'Not Found' }, 404, origin)
    } catch (e) {
      const errorInfo = e instanceof Error ? e.message : String(e)
      return json({ ok: false, error: errorInfo }, 500, origin)
    }
  },
}
