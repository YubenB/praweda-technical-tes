import { products, vouchers, users, orders, idem } from './data.js'
import type { Order } from './data.js'

export class CheckoutError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

type Input = {
  userId: string
  items: { productId: string; qty: number }[]
  voucher: string | null
}

// point is 2% from the voucher discount, not from total bayar
function calc(subtotal: number, percent: number) {
  const discount = Math.floor((subtotal * percent) / 100)
  const point = Math.floor((discount * 2) / 100)
  return { discount, total: subtotal - discount, point }
}

export function checkout(input: Input, key: string): Order {
  // retry pake key yang sama dapet order yang sama, point ga ke-credit 2x
  const k = input.userId + ':' + key
  const req = JSON.stringify(input)
  const prev = idem.get(k)
  if (prev) {
    if (prev.req !== req) throw new CheckoutError(422, 'Idempotency-Key already used for another request')
    return prev.order
  }

  const u = users.find((x) => x.id === input.userId)
  if (!u) throw new CheckoutError(404, 'user not found')

  const items = input.items.map((it) => {
    const p = products.find((x) => x.id === it.productId)
    if (!p) throw new CheckoutError(404, `product ${it.productId} not found`)
    return { productId: p.id, name: p.name, price: p.price, qty: it.qty, subtotal: p.price * it.qty }
  })
  const subtotal = items.reduce((sum, l) => sum + l.subtotal, 0)

  let v: (typeof vouchers)[number] | undefined
  if (input.voucher !== null) {
    v = vouchers.find((x) => x.code === input.voucher)
    if (!v) throw new CheckoutError(400, 'voucher is not valid')
    if (v.used >= v.quota) throw new CheckoutError(400, 'voucher quota is used up')
  }

  const { discount, total, point } = calc(subtotal, v ? v.percent : 0)
  const order = {
    id: 'ORD-' + (orders.length + 1),
    userId: u.id,
    items,
    subtotal,
    voucher: v ? v.code : null,
    discount,
    total,
    point,
    createdAt: new Date().toISOString(),
  }

  // commit cuma kalo semua udah valid. belum ada payment, jadi order dianggap paid dan point langsung masuk.
  // semua sync jadi ga ke-interleave request lain, kalo pake db ini harus 1 transaction
  orders.push(order)
  if (v) v.used++
  u.point += point
  idem.set(k, { req, order })
  return order
}
