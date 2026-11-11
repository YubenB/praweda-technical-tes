# No 2 - Auth API

Express + TS, OAuth (password & refresh_token grant), JWT disimpen di httpOnly cookie. Users static in memory.

```
npm install
npm run dev
```

Running di port 3002. Test user `budi / budi123`, client `web-app / web-secret-123`.

- `POST /oauth/token` - login / refresh token
- `GET /me` - returns `{ id, username, iat, exp }`
- `POST /oauth/revoke` - logout
- `POST /register` - add user, username must be unique

Refresh token one time use, kalo token lama dipake lagi session nya langsung di-revoke. Access token juga di-cek ke session, jadi abis logout langsung ga valid.

```
curl -c jar.txt -X POST http://localhost:3002/oauth/token -H "Content-Type: application/json" -d '{"grant_type":"password","client_id":"web-app","client_secret":"web-secret-123","username":"budi","password":"budi123"}'
curl -b jar.txt http://localhost:3002/me
```
