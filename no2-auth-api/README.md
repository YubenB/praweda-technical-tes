# No 2 - Auth API

OAuth 2.0 token API, access token nya JWT dibawa via httpOnly cookie. Express 5 + TypeScript, data in memory.

## Run

```
npm install
cp .env.example .env   # optional, tanpa .env pake dev JWT secret
npm run dev            # or: npm run build && npm start
```

Port 3002. Test users `budi / budi123`, `siti / siti123`, `andi / andi123`, client `web-app / web-secret-123`.
Endpoints: `POST /oauth/token` (login / refresh), `POST /oauth/revoke` (logout), `GET /me`, `POST /register`.

Example (bash):

```
curl -c jar.txt -X POST http://localhost:3002/oauth/token -H "Content-Type: application/json" -d '{"grant_type":"password","client_id":"web-app","client_secret":"web-secret-123","username":"budi","password":"budi123"}'
curl -b jar.txt http://localhost:3002/me
```

## Assumptions

"Oauth dengan menggunakan Cookie dan jwt" in soal itu mix 3 konsep beda, jadi di-interpret gini:
- OAuth 2.0 = the protocol / flow: `POST /oauth/token` with `grant_type`, client auth, error format RFC 6749.
- JWT = format access token nya. Payload ikut context in soal: `id` (uuid v4), `username` (unique), `iat` / `exp` bawaan jsonwebtoken.
- Cookie = cara browser bawa token: httpOnly + SameSite=Lax (Secure di prod), refresh cookie scoped ke `/oauth`.
  Token juga di-return di JSON buat non-browser client (`Authorization: Bearer`).
- Grant `password` + `refresh_token` karena client nya first-party. Third-party client harusnya `authorization_code` + PKCE.
- Users static in memory pake test creds di atas, `/register` buat nambah (username unique, hilang kalo restart).

## Design decisions

- 1 login = 1 session, lifetime fix 7 hari dari login. Refresh ga nambahin umur session.
- Refresh token rotated tiap dipake + reuse detection: token lama dipake lagi = anggap bocor, whole session revoked.
  Trade-off: 2 tab refresh barengan bisa ke-logout.
- Access token (15 min) juga di-cek ke session. Ga full stateless, tapi logout / revoke langsung berlaku.
- JWT pake `iss` / `aud` / `sub`, algorithm di-pin HS256 waktu verify. `JWT_SECRET` wajib di production.
- Basic client auth di-parse sesuai RFC 6749 2.3.1: split di `:` pertama + url-decode.
- Cross-site POST di-block via `Sec-Fetch-Site`, buat cegah login CSRF yg ga ke-cover SameSite=Lax.
- Password grant throttle: 5x salah per username + IP, lock 15 menit (429 + `Retry-After`).
- Password disimpen scrypt hash, refresh token yg disimpen cuma sha256 dari secret nya.

## Test

```
npm test
```
