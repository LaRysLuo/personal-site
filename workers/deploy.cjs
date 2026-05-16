const https = require('https')
const fs = require('fs')

const TOKEN = process.env.CF_TOKEN
const ACCOUNT = '93ce4be7ac532df40c4882d6b0ed9b98'

function api(method, path, data) {
  return new Promise((ok, no) => {
    const opts = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: '/client/v4' + path,
      method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'User-Agent': 'node',
      },
    }
    if (data) {
      opts.headers['Content-Type'] = 'application/json'
      opts.headers['Content-Length'] = Buffer.byteLength(data)
    }
    const r = https.request(opts, (res) => {
      let b = ''
      res.on('data', (c) => (b += c))
      res.on('end', () => {
        try {
          ok(JSON.parse(b))
        } catch (e) {
          no(e.message + ': ' + b.slice(0, 300))
        }
      })
    })
    r.on('error', no)
    if (data) r.write(data)
    r.end()
  })
}

async function main() {
  // Read the pre-bundled JS file
  const script = fs.readFileSync(__dirname + '/dist/worker.js', 'utf8')

  console.log('Script length:', script.length)

  // Upload the worker via metadata + script multipart
  const metadata = JSON.stringify({
    body_part: 'script',
    compatibility_date: '2025-05-16',
    compatibility_flags: ['nodejs_compat'],
    kv_namespaces: [
      { binding: 'MESSAGES_KV', id: '39cdffdcb03747b4a5051704b93cbcad' },
    ],
  })

  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
  const body =
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="metadata"\r\n' +
    'Content-Type: application/json\r\n\r\n' +
    metadata + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="script"; filename="index.js"\r\n' +
    'Content-Type: application/javascript+module\r\n\r\n' +
    script + '\r\n' +
    '--' + boundary + '--\r\n'

  const r = await new Promise((ok, no) => {
    const opts = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: '/client/v4/accounts/' + ACCOUNT + '/workers/scripts/personal-site-messages',
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(opts, (res) => {
      let b = ''
      res.on('data', (c) => (b += c))
      res.on('end', () => {
        try {
          ok(JSON.parse(b))
        } catch (e) {
          no(e.message + ': ' + b.slice(0, 300))
        }
      })
    })
    req.on('error', no)
    req.write(body)
    req.end()
  })

  if (r.success) {
    console.log('Worker deployed successfully!')
    console.log('Worker URL: https://personal-site-messages.larysluo.workers.dev')
  } else {
    console.log('Upload failed:', JSON.stringify(r.errors || r).slice(0, 600))
  }
}

main().catch((e) => console.error(e.message))
