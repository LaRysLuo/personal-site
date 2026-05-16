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

function jsonResponse(data, status, origin) {
  const headers = { 'Content-Type': 'application/json' }
  if (origin) Object.assign(headers, corsHeaders(origin))
  return new Response(JSON.stringify(data), { status, headers })
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
        const authUrl = new URL('https://github.com/login/oauth/authorize')
        authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
        authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
        authUrl.searchParams.set('scope', 'read:user')
        authUrl.searchParams.set('state', state)
        return Response.redirect(authUrl.toString(), 302)
      }

      // ---- OAuth: GitHub 回调 ----
      if (url.pathname === '/auth/github/callback') {
        const code = url.searchParams.get('code')
        if (!code) {
          return new Response('Missing authorization code', { status: 400 })
        }

        // 1. 用 code 换 access_token
        const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
          }),
        })
        const tokenData = await tokenResp.json()
        const accessToken = tokenData.access_token
        if (!accessToken) {
          return new Response('Failed to get access token', { status: 400 })
        }

        // 2. 用 access_token 获取用户信息
        const userResp = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'cloudflare-worker-personal-site',
          },
        })
        const userData = await userResp.json()
        if (!userData.login) {
          return new Response('Failed to get user info', { status: 500 })
        }

        // 3. 创建 session，存入 KV
        const sessionToken = uuid()
        const session = {
          login: userData.login,
          name: userData.name || userData.login,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
          created_at: new Date().toISOString(),
        }
        if (env.MESSAGES_KV) {
          await env.MESSAGES_KV.put(`session:${sessionToken}`, JSON.stringify(session), {
            expirationTtl: SESSION_TTL,
          })
        }

        // 4. 重定向回前端，附带 token
        const redirectUrl = `${FRONTEND_URL}/?token=${sessionToken}#/messages`
        return Response.redirect(redirectUrl, 302)
      }

      // ---- API: 获取当前登录用户 ----
      if (url.pathname === '/api/me') {
        const token = extractToken(request)
        if (!token) {
          return jsonResponse({ ok: false, error: '未登录' }, 401, origin)
        }
        if (!env.MESSAGES_KV) {
          return jsonResponse({ ok: false, error: 'Session 服务暂不可用' }, 500, origin)
        }
        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) {
          return jsonResponse({ ok: false, error: '登录已过期，请重新登录' }, 401, origin)
        }
        return jsonResponse({ ok: true, user: JSON.parse(raw) }, 200, origin)
      }

      // ---- API: 获取留言列表 ----
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        let raw = '[]'
        if (env.MESSAGES_KV) {
          const val = await env.MESSAGES_KV.get(KV_KEY, 'text')
          if (val) raw = val
        }
        const messages = JSON.parse(raw)
        messages.reverse()
        return jsonResponse({ ok: true, messages }, 200, origin)
      }

      // ---- API: 发布留言（需要登录）----
      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const token = extractToken(request)
        if (!token) {
          return jsonResponse({ ok: false, error: '请先登录后再发布留言' }, 401, origin)
        }
        if (!env.MESSAGES_KV) {
          return jsonResponse({ ok: false, error: '服务暂不可用' }, 500, origin)
        }
        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) {
          return jsonResponse({ ok: false, error: '登录已过期，请重新登录' }, 401, origin)
        }
        const session = JSON.parse(raw)

        const body = await request.json()
        if (!body.content || !body.content.trim() || body.content.trim().length > 2000) {
          return jsonResponse({ ok: false, error: '留言内容不能为空或超过 2000 字' }, 400, origin)
        }

        const messagesRaw = await env.MESSAGES_KV.get(KV_KEY, 'text')
        const messages = messagesRaw ? JSON.parse(messagesRaw) : []
        const message = {
          id: uuid(),
          name: session.name,
          github: session.login,
          avatar: session.avatar_url,
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
        }
        messages.push(message)
        await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(messages))

        return jsonResponse({ ok: true, message }, 201, origin)
      }

      return jsonResponse({ ok: false, error: 'Not Found' }, 404, origin)
    } catch (e) {
      return jsonResponse({ ok: false, error: e.message || 'Internal Error' }, 500, origin)
    }
  },
}
