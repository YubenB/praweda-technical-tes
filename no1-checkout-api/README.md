# No 1 - Checkout API

Checkout API with voucher 50% & point, Express + TypeScript, data in memory aja (no db).

## Run
```
npm install
cp .env.example .env   # optional, default port 3001
npm run dev            # or: npm run build && npm start
```

Example (bash):
```
curl -X POST http://localhost:3001/checkout -H "Content-Type: application/json" -H "Idempotency-Key: order-1" -d '{"userId":"U001","items":[{"productId":"P001","qty":1}],"voucher":"DISKON50"}'
```

Expected `201`: subtotal 5000000, discount 2500000, total 2500000, point 50000. Saldo point user: `GET /users/U001`.

## Assumptions
- "Rp.5000.000" in soal titik nya salah tempat (typo), dibaca Rp 5.000.000 (titik = thousand separator), jadi Laptop `P001` = 5000000.
- "2% dari voucher yang digunakan" = 2% of the voucher nominal yang kepake (the discount), not 2% of total bayar and not 2% of the 50% rate: 2% x 2.500.000 = 50.000 point.
- No voucher = no point.
- Rounding: floor to whole rupiah / whole point.
- Voucher 50% = code `DISKON50` (quota 100), 1 voucher per checkout, no max cap karena in soal ga disebut.
- No payment step, so order dianggap paid langsung and point langsung masuk ke saldo user.
- `userId` dikirim di body, harusnya dari auth token (auth di luar scope no 1).
- `Idempotency-Key` header is required for every checkout (e.g. cart / order id from client).

## Design decisions
- Money is integer rupiah everywhere, never float.
- Business rule in `src/checkout.ts`, plain TS tanpa express jadi gampang di-unit test. `src/index.ts` cuma HTTP layer.
- `Idempotency-Key`: retry with the same key returns the same order, point ga ke-credit 2x. Same key beda body -> 422.
- Voucher quota cuma kepake kalo order sukses: validate everything first, baru commit (order, quota, point).
- Price only from the server catalog, client cuma kirim `productId` + `qty`.
- Validation at the boundary, error jelas: 400 bad input (qty integer 1-100) / voucher invalid, 404 user or product not found, 422 key reused.

## Test
```
npm test
```
