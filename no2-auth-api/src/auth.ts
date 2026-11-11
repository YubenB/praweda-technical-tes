import jwt, { type JwtPayload } from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import { v4 as uuidv4 } from 'uuid'
import type { Request, Response, NextFunction, CookieOptions } from 'express'
import { findUserById, sha256, safeEqual, type User } from './data.js'

const isProd = process.env.NODE_ENV === 'production'

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-dont-use-in-prod'
const claims = { issuer: 'no2-auth', audience: 'no2-api' }

export const ACCESS_TTL = 15 * 60 // seconds
const SESSION_TTL = 7 * 24 * 60 * 60

// 1 login = 1 session. exp nya fix 7 hari dari login, refresh ga nambahin umur session
type Session = { userId: string; clientId: string; exp: number; refresh: string }
const sessions = new Map<string, Session>()

setInterval(() => {
  for (const [sid, s] of sessions) if (s.exp < Date.now()) sessions.delete(sid)
}, 10 * 60 * 1000).unref()

export type Tokens = { access: string; refresh: string; refreshExp: number }

function issue(sid: string, s: Session, u: User): Tokens {
  // refresh token = sid.secret, yg disimpen cuma sha256 dari secret yg paling baru
  const secret = randomBytes(32).toString('base64url')
  s.refresh = sha256(secret)
  // id & username sesuai soal, iat & exp auto dari jsonwebtoken
  const access = jwt.sign({ id: u.id, username: u.username, sid }, JWT_SECRET, {
    ...claims,
    subject: u.id,
    expiresIn: ACCESS_TTL,
  })
  return { access, refresh: sid + '.' + secret, refreshExp: s.exp }
}

export function newSession(u: User, clientId: string) {
  const sid = uuidv4()
  const s = { userId: u.id, clientId, exp: Date.now() + SESSION_TTL * 1000, refresh: '' }
  sessions.set(sid, s)
  return issue(sid, s, u)
}

// refresh token di-rotate tiap dipake. sid valid tapi secret nya bukan yg terakhir = token lama dipake lagi,
// anggap bocor -> kill session nya, token terbaru (entah punya user / attacker) ikut mati
export function rotate(token: string, clientId: string) {
  const [sid, secret] = token.split('.')
  const s = sessions.get(sid)
  if (!s || !secret || s.clientId !== clientId || s.exp < Date.now()) return null
  if (!safeEqual(s.refresh, sha256(secret))) {
    sessions.delete(sid)
    console.log('refresh token reuse, session ' + sid + ' revoked')
    return null
  }
  const u = findUserById(s.userId)
  return u ? issue(sid, s, u) : null
}

export const revoke = (token: string) => sessions.delete(token.split('.')[0])

// sesuai spec oauth: id & secret di-urlencode dulu baru base64, split di ':' pertama aja (secret boleh ada ':')
export function parseBasic(b64: string) {
  const raw = Buffer.from(b64, 'base64').toString()
  const i = raw.indexOf(':')
  if (i < 0) return null
  const dec = (s: string) => decodeURIComponent(s.replace(/\+/g, ' '))
  try {
    return { id: dec(raw.slice(0, i)), secret: dec(raw.slice(i + 1)) }
  } catch {
    return null
  }
}

function verifyAccess(token: string) {
  try {
    const p = jwt.verify(token, JWT_SECRET, { ...claims, algorithms: ['HS256'] }) as JwtPayload
    // cek session nya juga, biar logout / reuse detection langsung matiin access token (ga nunggu exp).
    // jadi ga full stateless, tapi cuma 1 Map lookup
    const s = sessions.get(p.sid)
    return s && s.exp > Date.now() ? p : null
  } catch {
    return null
  }
}

const base: CookieOptions = { httpOnly: true, sameSite: 'lax', secure: isProd }

export function setTokenCookies(res: Response, t: Tokens) {
  res.cookie('access_token', t.access, { ...base, maxAge: ACCESS_TTL * 1000 })
  // refresh token only sent to /oauth/*, ga ikut ke endpoint lain
  res.cookie('refresh_token', t.refresh, { ...base, path: '/oauth', expires: new Date(t.refreshExp) })
}

export function clearTokenCookies(res: Response) {
  res.clearCookie('access_token', base)
  res.clearCookie('refresh_token', { ...base, path: '/oauth' })
}

export function auth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.access_token
  const h = req.headers.authorization
  if (!token && h?.startsWith('Bearer ')) token = h.slice(7)

  if (!token) {
    res.set('WWW-Authenticate', 'Bearer')
    res.status(401).json({ error: 'invalid_token', error_description: 'access token not found' })
    return
  }

  const p = verifyAccess(token)
  if (!p) {
    res.set('WWW-Authenticate', 'Bearer error="invalid_token"')
    res.status(401).json({ error: 'invalid_token', error_description: 'access token invalid, expired or revoked' })
    return
  }
  res.locals.user = p
  next()
}
