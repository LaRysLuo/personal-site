import { Cors } from './cors'

interface Message {
  id: string
  name: string
  content: string
  website?: string
  createdAt: string
}

const KV_KEY = 'messages'

async function getMessages(env: Env): Promise<Message[]> {
  const raw = await env.MESSAGES_KV.get(KV_KEY, 'text')
  return raw ? JSON.parse(raw) : []
}

async function saveMessages(env: Env, messages: Message[]) {
  await env.MESSAGES_KV.put(KV_KEY, JSON.stringify(messages))
}

function validate(body: Partial<Message>): string | null {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return '请填写昵称'
  }
  if (body.name.trim().length > 50) {
    return '昵称不能超过 50 个字符'
  }
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    return '请填写留言内容'
  }
  if (body.content.trim().length > 2000) {
    return '留言内容不能超过 2000 个字符'
  }
  if (body.website && body.website.length > 200) {
    return '网站地址不能超过 200 个字符'
  }
  if (body.website && !/^https?:\/\/.+/.test(body.website)) {
    return '网站地址格式不正确（需以 http:// 或 https:// 开头）'
  }
  return null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || '*'

    if (request.method === 'OPTIONS') {
      return Cors.handler(origin)
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/messages') {
        const messages = await getMessages(env)
        messages.reverse()
        return Cors.json(origin, { ok: true, messages })
      }

      if (request.method === 'POST' && url.pathname === '/api/messages') {
        const body: Partial<Message> = await request.json()
        const error = validate(body)
        if (error) {
          return Cors.json(origin, { ok: false, error }, { status: 400 })
        }

        const messages = await getMessages(env)
        const message: Message = {
          id: crypto.randomUUID(),
          name: body.name!.trim(),
          content: body.content!.trim(),
          website: body.website?.trim() || undefined,
          createdAt: new Date().toISOString(),
        }

        messages.push(message)
        await saveMessages(env, messages)

        return Cors.json(origin, { ok: true, message }, { status: 201 })
      }

      return Cors.json(origin, { ok: false, error: 'Not Found' }, { status: 404 })
    } catch (e: any) {
      return Cors.json(origin, { ok: false, error: e.message || 'Internal Error' }, { status: 500 })
    }
  },
}

export interface Env {
  MESSAGES_KV: KVNamespace
}
