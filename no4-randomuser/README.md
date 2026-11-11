# No 4 - Randomuser & manipulate array

Backend Express + TS buat fetch & manipulate data randomuser.me, frontend Next.js + antd (list + search) dan page array.

## Run

```
docker compose up --build
```

Atau manual (Node 24), 2 terminal:

```
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

- Frontend http://localhost:3000, array di http://localhost:3000/array (atau `npm run array` di folder frontend).
- Backend port 4000: `curl "http://localhost:4000/users?results=10&page=1"`
- `.env.example` ada di tiap folder (`PORT`, `NEXT_PUBLIC_API_URL`), optional karena default nya udah sama.

## Assumptions

- `age` = `registered.age`: expected output in soal 21, padahal `dob.age` nya 40. Bisa trap atau typo di soal, I follow the example; ganti ke `dob.age` cuma 1 line di `backend/src/user.ts`.
- `location` spacing in soal ga konsisten, dinormalize jadi `number, street, city, state, country`.
- Pagination randomuser cuma stable kalo pake seed, so backend selalu kirim default seed (`praweda`, bisa override `?seed=`).
- Total data dianggap 1000 buat pagination, karena randomuser ga ngasih total.
- Array bukan zip by index (zip -> "Celana Kuning", "Topi Hijau"...). Panjang output ikut colors, item & label ikut index `i` dan muter pake modulo (`i % 5`), makanya maroon (i=5) dapet `items[0]` baju + `labels[0]` Diskon.
- Colors nya dipermute: index 0 stay, terus pair sebelahan di-swap (1<->2, 3<->4, 5<->6, ...), index tanpa pair stay. 5 colors -> merah, hijau, kuning, ungu, pink; maroon (i=5, partner 6 ga ada) stay.
- Casing in soal ga konsisten, output dibikin Title Case.

## Design decisions

- Backend dipisah: route + validation (`index.ts`), upstream client (`randomuser.ts`), transform (`user.ts`).
- In-memory TTL cache 10 menit keyed `seed:page:results`, dibatesin by total rows (20k) bukan jumlah entry. Cek header `X-Cache`.
- 400 kalo query ga valid, 502 kalo randomuser error / down, 504 kalo timeout (15s).
- Frontend: `lib/api.ts` (fetch), `useUsers` hook (request lama di-abort pas ganti page biar ga race) + components.
- `page` & `results` disimpen di URL, refresh / share link tetep di page yg sama.
- Search di client over rows yg udah ke-load (randomuser ga punya search), debounce 300ms.
- New Data cuma di client (randomuser read only), ditaro paling atas.
- Docker: `NEXT_PUBLIC_API_URL` di-bake pas build (build arg), browser manggil backend lewat port 4000 yg ke-publish.

## Test

```
cd backend && npm test
cd frontend && npm test
```
