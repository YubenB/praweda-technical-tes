export const products = [
  { id: 'P001', name: 'Laptop', price: 5000000 },
  { id: 'P002', name: 'Mouse Wireless', price: 150000 },
  { id: 'P003', name: 'Keyboard Mechanical', price: 450000 },
]

export const vouchers = [
  { code: 'DISKON50', percent: 50, quota: 100, used: 0 },
]

export const users = [
  { id: 'U001', name: 'Budi', point: 0 },
  { id: 'U002', name: 'Sari', point: 0 },
]

export type Order = {
  id: string
  userId: string
  items: { productId: string; name: string; price: number; qty: number; subtotal: number }[]
  subtotal: number
  voucher: string | null
  discount: number
  total: number
  point: number
  createdAt: string
}

export const orders: Order[] = []

// key nya userId:Idempotency-Key, req disimpen buat cek key nya ga dipake ulang buat request lain
export const idem = new Map<string, { req: string; order: Order }>()
