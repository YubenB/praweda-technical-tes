# No 1 - Checkout API

Express + TS, product, voucher, user & order data in memory aja.

```
npm install
npm run dev
```

Running di port 3001.

```
curl -X POST http://localhost:3001/checkout -H "Content-Type: application/json" -H "Idempotency-Key: order-1" -d '{"userId":"U001","items":[{"productId":"P001","qty":1}],"voucher":"DISKON50"}'
```

Result: subtotal 5000000, discount 2500000, total 2500000, point 50000. Tanpa voucher point nya 0.

Point = 2% dari discount voucher nya, langsung masuk ke saldo point user (`GET /users/U001`).
Idempotency-Key wajib, retry pake key yang sama dapet order yang sama jadi point ga masuk 2x.
