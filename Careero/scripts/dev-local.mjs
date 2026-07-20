import { createServer as createHttpServer } from 'node:http'
import process from 'node:process'
import { createServer as createViteServer, loadEnv } from 'vite'

const host = '127.0.0.1'
const port = Number.parseInt(process.env.CAREERO_LOCAL_PORT || '5173', 10)
const maximumBodyBytes = 32_768

const localEnvironment = loadEnv('development', process.cwd(), '')
for (const [name, value] of Object.entries(localEnvironment)) {
  if (process.env[name] === undefined) process.env[name] = value
}

const [{ default: recommendationsHandler }, vite] = await Promise.all([
  import('../api/v1/recommendations.js'),
  createViteServer({
    appType: 'spa',
    server: { middlewareMode: true },
  }),
])

async function readBody(request) {
  const chunks = []
  let received = 0
  for await (const chunk of request) {
    received += chunk.length
    if (received > maximumBodyBytes) throw new Error('Local request body is too large.')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function runRecommendationRequest(request, response) {
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await readBody(request)
  const webRequest = new Request(`http://${host}:${port}${request.url}`, {
    method: request.method,
    headers: request.headers,
    body,
  })
  const webResponse = await recommendationsHandler(webRequest)
  response.statusCode = webResponse.status
  webResponse.headers.forEach((value, name) => response.setHeader(name, value))
  response.end(Buffer.from(await webResponse.arrayBuffer()))
}

const server = createHttpServer((request, response) => {
  const pathname = new URL(request.url, `http://${host}:${port}`).pathname
  if (pathname === '/api/v1/recommendations') {
    runRecommendationRequest(request, response).catch(() => {
      response.statusCode = 500
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ status: 'error', error: 'Local API request failed.' }))
    })
    return
  }
  vite.middlewares(request, response, (error) => {
    if (!error) return
    response.statusCode = 500
    response.end('Local development server error.')
  })
})

server.listen(port, host, () => {
  const geminiKeys = Array.from({ length: 5 }, (_, index) => process.env[`GEMINI_API_KEY_${index + 1}`])
    .filter(Boolean).length
  const deepSeek = Boolean(process.env.DEEPSEEK_API_KEY_1)
  console.log(`Careero local: http://${host}:${port}`)
  console.log(`Providers loaded: Gemini=${geminiKeys}, DeepSeek=${deepSeek ? 1 : 0}`)
})

async function shutdown() {
  await vite.close()
  server.close(() => process.exit(0))
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
