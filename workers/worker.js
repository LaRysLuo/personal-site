const ALLOWED_ORIGINS = [
  'https://larysluo.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const GITHUB_CLIENT_ID = 'Ov23liAn7Bq0xtywqQZK'
const GITHUB_CLIENT_SECRET = 'fd4f2956dfafc80ccb6f880efe336b54b2764d17'
const GITHUB_REDIRECT_URI = 'https://personal-site-messages.larysword.workers.dev/auth/github/callback'
const FRONTEND_URL = 'https://larysluo.github.io/personal-site'
const OWNER_LOGIN = 'LaRysLuo'
const NOTIFY_EMAIL = 'larysword@gmail.com'
// API Key 在 Cloudflare 端已配置，公开仓库不包含
const SENDGRID_API_KEY = ''

const SESSION_TTL = 60 * 60 * 24 * 30
const KV_KEY = 'messages'

function cors(origin) {
  const o = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://larysluo.github.io'
  return {
    'Access-Control-Allow-Origin': o,
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

function respond(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  })
}

async function sendEmailNotification(name, login, content, createdAt) {
  if (!SENDGRID_API_KEY) return

  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: NOTIFY_EMAIL }],
          subject: `💬 留言板新消息 - ${name}`,
        }],
        from: { email: NOTIFY_EMAIL, name: '悠月的小世界 · 留言板' },
        content: [{
          type: 'text/plain',
          value: [
            `收到一条新的留言 ✨`,
            ``,
            `留言者：${name} (${login})`,
            `时间：${new Date(createdAt).toLocaleString('zh-CN')}`,
            ``,
            `内容：`,
            content,
            ``,
            `---`,
            `来自 悠月的小世界 留言板`,
            `https://larysluo.github.io/personal-site/#/messages`,
          ].join('\n'),
        }],
      }),
    })
  } catch (e) {
    console.error('Send email failed:', e.message)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) })
    }

    try {
      // OAuth: 跳转 GitHub
      if (url.pathname === '/auth/github') {
        const a = new URL('https://github.com/login/oauth/authorize')
        a.searchParams.set('client_id', GITHUB_CLIENT_ID)
        a.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
        a.searchParams.set('scope', 'read:user')
        a.searchParams.set('state', uuid())
        return Response.redirect(a.toString(), 302)
      }

      // OAuth: 回调
      if (url.pathname === '/auth/github/callback') {
        const code = url.searchParams.get('code')
        if (!code) return new Response('Missing code', { status: 400 })

        const r1 = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: GITHUB_REDIRECT_URI }),
        })
        const d1 = await r1.json()
        if (!d1.access_token) return new Response('No token', { status: 400 })

        const r2 = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `Bearer ${d1.access_token}`, 'User-Agent': 'cf-worker' },
        })
        const d2 = await r2.json()
        if (!d2.login) return new Response('No user', { status: 500 })

        const st = uuid()
        const session = { login: d2.login, name: d2.name || d2.login, avatar_url: d2.avatar_url, html_url: d2.html_url }
        if (env.MESSAGES_KV) await env.MESSAGES_KV.put(`session:${st}`, JSON.stringify(session), { expirationTtl: SESSION_TTL })

        return Response.redirect(`${FRONTEND_URL}/?token=${st}#/messages`, 302)
      }

      // API: 当前用户
      if (url.pathname === '/api/me') {
        const token = (request.headers.get('Authorization') || '').replace('Bearer ', '')
        if (!token) return respond({ ok: false, error: '未登录' }, 401, origin)
        if (!env.MESSAGES_KV) return respond({ ok: false, error: 'KV 不可用' }, 500, origin)

        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) return respond({ ok: false, error: '会话已过期' }, 401, origin)

        return respond({ ok: true, user: JSON.parse(raw) }, 200, origin)
      }

      // API: 留言列表
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        let raw = '[]'
        if (env.MESSAGES_KV) {
          const v = await env.MESSAGES_KV.get(KV_KEY, 'text')
          if (v) raw = v
        }
        const msgs = JSON.parse(raw)
        msgs.reverse()
        return respond({ ok: true, messages: msgs }, 200, origin)
      }

      // API: 发布留言
      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const token = (request.headers.get('Authorization') || '').replace('Bearer ', '')
        if (!token) return respond({ ok: false, error: '请先登录' }, 401, origin)
        if (!env.MESSAGES_KV) return respond({ ok: false, error: 'KV 不可用' }, 500, origin)

        const raw = await env.MESSAGES_KV.get(`session:${token}`, 'text')
        if (!raw) return respond({ ok: false, error: '会话已过期' }, 401, origin)
        const session = JSON.parse(raw)

        const body = await request.json()
        if (!body.content || !body.content.trim() || body.content.trim().length > 2000) {
          return respond({ ok: false, error: '内容无效' }, 400, origin)
        }

        const msRaw = await env.MESSAGES_KV.get(KV_KEY, 'text')
        const msgs = msRaw ? JSON.parse(msRaw) : []
        const isOwner = session.login === OWNER_LOGIN
        const msg = {
          id: uuid(),
          name: session.name,
          github: session.login,
          avatar: session.avatar_url,
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
          isOwner,
        }
        msgs.push(msg)
        await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(msgs))

        // 不是站长留言时发邮件通知
        if (!isOwner) {
          sendEmailNotification(msg.name, msg.github, msg.content, msg.createdAt)
        }

        return respond({ ok: true, message: msg }, 201, origin)
      }

      return respond({ ok: false, error: 'Not Found' }, 404, origin)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return respond({ ok: false, error: msg }, 500, origin)
    }
  },
}
