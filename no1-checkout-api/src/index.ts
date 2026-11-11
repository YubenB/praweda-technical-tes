import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { products, users } from './data.js'
import { checkout, CheckoutError } from './checkout.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(express.json())

app.get('/products', (req, res) => {
  res.json(products)
})

app.get('/users/:id', (req, res) => {
  const u = users.find((x) => x.id === req.params.id)
  if (!u) {
    res.status(404).json({ message: 'user not found' })
    return
  }
  res.json(u)
})

app.post('/checkout', (req, res) => {
  const key = req.get('Idempotency-Key')
  // userId dari body aja, harusnya dari auth token
  const { userId, items, voucher } = req.body ?? {}

  if (!key) {
    res.status(400).json({ message: 'Idempotency-Key header is required' })
    return
  }
  if (typeof userId !== 'string' || !userId) {
    res.status(400).json({ message: 'userId is required' })
    return
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'items cannot be empty' })
    return
  }
  for (const it of items) {
    if (!it || typeof it.productId !== 'string') {
      res.status(400).json({ message: 'productId is required' })
      return
    }
    if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 100) {
      res.status(400).json({ message: 'qty must be integer between 1-100' })
      return
    }
  }
  if (voucher !== undefined && voucher !== null && typeof voucher !== 'string') {
    res.status(400).json({ message: 'voucher is not valid' })
    return
  }

  try {
    const order = checkout(
      {
        userId,
        items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
        voucher: typeof voucher === 'string' ? voucher.trim().toUpperCase() : null,
      },
      key,
    )
    res.status(201).json(order)
  } catch (e) {
    if (e instanceof CheckoutError) {
      res.status(e.status).json({ message: e.message })
      return
    }
    throw e
  }
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // error from express.json(), e.g. json body nya rusak
  if (err.status && err.status < 500) {
    res.status(err.status).json({ message: err.type === 'entity.parse.failed' ? 'body is not a valid json' : err.message })
    return
  }
  console.error(err)
  res.status(500).json({ message: 'server error' })
})

app.listen(PORT, () => {
  console.log('server running on port ' + PORT)
})
