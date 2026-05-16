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
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

const KV_KEY = 'messages'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        const raw = await env.MESSAGES_KV.get(KV_KEY, 'text')
        const messages = raw ? JSON.parse(raw) : []
        messages.reverse()
        return new Response(JSON.stringify({ ok: true, messages }), {
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
        if (body.website && body.website.length > 200) {
          return new Response(JSON.stringify({ ok: false, error: '网站地址过长' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          })
        }

        const raw = await env.MESSAGES_KV.get(KV_KEY, 'text')
        const messages = raw ? JSON.parse(raw) : []
        const message = {
          id: crypto.randomUUID(),
          name: body.name,
          github: body.github,
          avatar: body.avatar || '',
          website: body.website || undefined,
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
        }
        messages.push(message)
        await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(messages))

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
