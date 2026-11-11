import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkout } from './checkout.js'
import { users, vouchers, orders, idem } from './data.js'

// store nya module-level, jadi tiap test pake key sendiri & cek selisih before/after
const budi = users.find((x) => x.id === 'U001')!
const v = vouchers.find((x) => x.code === 'DISKON50')!
const laptop = [{ productId: 'P001', qty: 1 }]

test('soal case: 5jt pake DISKON50', () => {
  const before = budi.point
  const o = checkout({ userId: 'U001', items: laptop, voucher: 'DISKON50' }, 'soal')
  assert.equal(o.subtotal, 5000000)
  assert.equal(o.discount, 2500000)
  assert.equal(o.total, 2500000)
  assert.equal(o.point, 50000)
  assert.equal(budi.point, before + 50000)
})

test('no voucher, no point', () => {
  const o = checkout({ userId: 'U002', items: laptop, voucher: null }, 'no-voucher')
  assert.equal(o.discount, 0)
  assert.equal(o.total, 5000000)
  assert.equal(o.point, 0)
})

test('retry same key, point ga double', () => {
  const before = budi.point
  const input = { userId: 'U001', items: laptop, voucher: 'DISKON50' }
  const first = checkout(input, 'retry')
  const n = orders.length
  const used = v.used
  const again = checkout({ ...input }, 'retry')
  assert.equal(again, first)
  assert.equal(orders.length, n)
  assert.equal(v.used, used)
  assert.equal(budi.point, before + 50000)
})

test('same key beda body -> 422', () => {
  checkout({ userId: 'U001', items: laptop, voucher: null }, 'reuse')
  assert.throws(
    () => checkout({ userId: 'U001', items: [{ productId: 'P001', qty: 2 }], voucher: null }, 'reuse'),
    { status: 422 },
  )
})

test('invalid voucher, nothing changes', () => {
  const snap = () => ({ point: budi.point, used: v.used, orders: orders.length, idem: idem.size })
  const before = snap()
  assert.throws(() => checkout({ userId: 'U001', items: laptop, voucher: 'NGASAL' }, 'invalid'), {
    status: 400,
    message: 'voucher is not valid',
  })
  assert.deepEqual(snap(), before)
})

test('quota abis', () => {
  const used = v.used
  v.used = v.quota
  try {
    assert.throws(() => checkout({ userId: 'U002', items: laptop, voucher: 'DISKON50' }, 'quota'), {
      status: 400,
      message: 'voucher quota is used up',
    })
  } finally {
    v.used = used
  }
})
