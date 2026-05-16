export class Cors {
  static headers(origin: string): Record<string, string> {
    const allowed = [
      'https://larysluo.github.io',
      'http://localhost:5173',
      'http://localhost:4173',
    ]
    const corsOrigin = allowed.includes(origin) ? origin : 'https://larysluo.github.io'
    return {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  }

  static handler(origin: string): Response {
    return new Response(null, {
      status: 204,
      headers: { ...Cors.headers(origin) },
    })
  }

  static json(origin: string, data: any, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...Cors.headers(origin),
      },
    })
  }
}
