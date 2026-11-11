# No 4 - randomuser

`backend` = Express + TS (fetch & manipulate data randomuser), `frontend` = Next.js + antd.

```
cd backend
npm install
npm run dev
```

```
cd frontend
npm install
npm run dev
```

- backend port 4000, `GET /users?results=10&page=1`
- frontend http://localhost:3000, page array di http://localhost:3000/array (or `npm run array` di folder frontend)

## Notes

- Pake seed biar pagination nya consistent, jadi response randomuser bisa di-cache juga di backend (in-memory 10 menit, cek header `X-Cache`).
- `age` pake `registered.age` biar sama kayak contoh di soal (21).
- Hasil array dibikin Title Case.
