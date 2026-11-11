import express, { type Request, type Response, type NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import { v4 as uuidv4 } from 'uuid'
import { users, clients, findUser, hashPassword, checkPassword, safeEqual } from './data.js'
import { auth, newSession, rotate, revoke, parseBasic, setTokenCookies, clearTokenCookies, ACCESS_TTL, type Tokens } from './auth.js'

const app = express()
const PORT = Number(process.env.PORT) || 3002

app.disable('x-powered-by')

// csrf guard. SameSite=Lax doang ga cukup, form POST dari site lain ke /oauth/token masih bisa nge-set cookie (login csrf).
// browser selalu kirim Sec-Fetch-Site, curl / server-to-server ga kirim jadi ga kena
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({ error: 'invalid_request', error_description: 'cross-site request not allowed' })
    return
  }
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

function oauthError(res: Response, status: number, error: string, desc: string) {
  res.status(status).json({ error, error_description: desc })
}

function sendTokens(res: Response, t: Tokens) {
  setTokenCookies(res, t)
  res.json({ access_token: t.access, token_type: 'Bearer', expires_in: ACCESS_TTL, refresh_token: t.refresh })
}

// brute force guard password grant (RFC 6749 4.3.2): max 5x salah per username+ip, abis itu lock 15 menit
const fails = new Map<string, { n: number; until: number }>()
setInterval(() => {
  for (const [k, f] of fails) if (f.until < Date.now()) fails.delete(k)
}, 10 * 60 * 1000).unref()

app.post('/oauth/token', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.set('Pragma', 'no-cache')

  const b = req.body ?? {}
  const p = (k: string): string | undefined => (typeof b[k] === 'string' ? b[k] : undefined)

  // client auth bisa via body (client_id + client_secret) or Basic header
  let clientId = p('client_id')
  let clientSecret = p('client_secret')
  const h = req.headers.authorization
  if (h?.startsWith('Basic ')) {
    const c = parseBasic(h.slice(6))
    clientId = c?.id
    clientSecret = c?.secret
  }

  const client = clients.find((c) => c.id === clientId)
  if (!client || !clientSecret || !safeEqual(client.secret, clientSecret)) {
    res.set('WWW-Authenticate', 'Basic realm="oauth"')
    return oauthError(res, 401, 'invalid_client', 'wrong client_id or client_secret')
  }

  const grant = p('grant_type')
  if (!grant) return oauthError(res, 400, 'invalid_request', 'grant_type is required')

  if (grant === 'password') {
    const username = p('username')
    const password = p('password')
    if (!username || !password) return oauthError(res, 400, 'invalid_request', 'username and password is required')

    const key = username.toLowerCase() + '|' + req.ip
    let f = fails.get(key)
    if (!f || f.until < Date.now()) f = { n: 0, until: 0 }
    if (f.n >= 5) {
      res.set('Retry-After', String(Math.ceil((f.until - Date.now()) / 1000)))
      return oauthError(res, 429, 'too_many_attempts', 'too many failed login, try again later')
    }
    // dihitung sebelum await, biar request paralel juga ke-count
    fails.set(key, { n: f.n + 1, until: Date.now() + 15 * 60 * 1000 })

    const u = findUser(username)
    if (!u || !(await checkPassword(password, u.password))) {
      return oauthError(res, 400, 'invalid_grant', 'wrong username or password')
    }
    fails.delete(key)
    return sendTokens(res, newSession(u, client.id))
  }

  if (grant === 'refresh_token') {
    const fromCookie = req.cookies?.refresh_token
    const rt = p('refresh_token') || (typeof fromCookie === 'string' ? fromCookie : undefined)
    if (!rt) return oauthError(res, 400, 'invalid_request', 'refresh_token is missing')

    const t = rotate(rt, client.id)
    if (!t) return oauthError(res, 400, 'invalid_grant', 'refresh token not valid')
    return sendTokens(res, t)
  }

  oauthError(res, 400, 'unsupported_grant_type', 'supported grant_type: password, refresh_token')
})

// dipake for logout juga. yg di-revoke 1 session, jadi refresh + access token nya mati barengan
app.post('/oauth/revoke', (req, res) => {
  const t = req.body?.token ?? req.cookies?.refresh_token
  if (typeof t === 'string') revoke(t)

  clearTokenCookies(res)
  res.json({ message: 'logout success' })
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
    return res.status(400).json({ message: 'username must be 3-20 chars, only letters, numbers, _ and .' })
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
    return res.status(400).json({ message: 'password must be 6-100 chars' })
  }

  const hashed = await hashPassword(password)
  // check duplicate after the await, so check + push nya ga kepisah (race condition kalo request barengan)
  if (findUser(username)) return res.status(409).json({ message: 'username already taken' })

  const u = { id: uuidv4(), username, password: hashed }
  users.push(u)
  res.status(201).json({ id: u.id, username: u.username })
})

app.get('/me', auth, (req, res) => {
  const { id, username, iat, exp } = res.locals.user
  res.json({ id, username, iat, exp })
})

app.use((req, res) => {
  res.status(404).json({ message: 'not found' })
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // error dari body parser (json rusak, body kegedean, charset aneh) itu salah client, bukan 500
  if (err?.expose && err.status < 500) {
    const desc = err.type === 'entity.parse.failed' ? 'invalid JSON body' : err.message
    return res.status(err.status).json({ error: 'invalid_request', error_description: desc })
  }
  console.error(err)
  res.status(500).json({ message: 'server error' })
})

app.listen(PORT, () => {
  console.log('auth api running on http://localhost:' + PORT)
})
