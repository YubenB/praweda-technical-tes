import { test } from 'node:test'
import assert from 'node:assert/strict'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { newSession, rotate, revoke, parseBasic, auth, ACCESS_TTL } from './auth.js'
import { users } from './data.js'

const u = users[0]

// jalanin middleware auth pake req/res palsu, return status nya (200 = lolos)
function callAuth(token: string) {
  let status = 200
  const req: any = { cookies: { access_token: token }, headers: {} }
  const res: any = {
    locals: {},
    set() { return this },
    status(s: number) { status = s; return this },
    json() { return this },
  }
  auth(req, res, () => {})
  return status
}

test('access token payload sesuai soal', () => {
  const t = newSession(u, 'web-app')
  const p = jwt.decode(t.access) as JwtPayload
  assert.equal(p.id, u.id)
  assert.equal(p.username, 'budi')
  assert.equal(p.exp! - p.iat!, ACCESS_TTL)
  assert.equal(p.sub, u.id)
  assert.equal(p.iss, 'no2-auth')
  assert.equal(p.aud, 'no2-api')
  assert.equal(callAuth(t.access), 200)
})

test('rotate gives new refresh token', () => {
  const t1 = newSession(u, 'web-app')
  const t2 = rotate(t1.refresh, 'web-app')
  assert.ok(t2)
  assert.notEqual(t2.refresh, t1.refresh)
  assert.equal(t2.refreshExp, t1.refreshExp) // umur session ga nambah
  assert.ok(rotate(t2.refresh, 'web-app'))
})

test('reuse old refresh token kills the session', () => {
  const t1 = newSession(u, 'web-app')
  const t2 = rotate(t1.refresh, 'web-app')!
  assert.equal(rotate(t1.refresh, 'web-app'), null)
  // token terbaru + access token nya ikut mati
  assert.equal(rotate(t2.refresh, 'web-app'), null)
  assert.equal(callAuth(t2.access), 401)
})

test('refresh token from other client rejected', () => {
  const t = newSession(u, 'web-app')
  assert.equal(rotate(t.refresh, 'other-app'), null)
  assert.ok(rotate(t.refresh, 'web-app'))
})

test('revoke = logout, refresh & access langsung mati', () => {
  const t = newSession(u, 'web-app')
  revoke(t.refresh)
  assert.equal(rotate(t.refresh, 'web-app'), null)
  assert.equal(callAuth(t.access), 401)
})

test('parseBasic', () => {
  const b64 = (s: string) => Buffer.from(s).toString('base64')
  assert.deepEqual(parseBasic(b64('web-app:web-secret-123')), { id: 'web-app', secret: 'web-secret-123' })
  // split di ':' pertama, sisanya masuk secret
  assert.deepEqual(parseBasic(b64('a:b:c')), { id: 'a', secret: 'b:c' })
  assert.deepEqual(parseBasic(b64('my%20app:s%3Acret+x')), { id: 'my app', secret: 's:cret x' })
  assert.equal(parseBasic(b64('no-colon')), null)
  assert.equal(parseBasic(b64('a:%E0%A4%A')), null)
})
