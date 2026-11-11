import { toUser, type RandomUser } from './user'

type User = ReturnType<typeof toUser>

// data randomuser deterministic per seed + page + results, so aman di-cache (page bolak balik jadi instant).
// limit nya by total rows, bukan jumlah entry, karena 1 entry bisa sampe 5000 users
const TTL = 10 * 60 * 1000
const MAX_ROWS = 20000
const cache = new Map<string, { at: number; users: User[] }>()
let rows = 0

function drop(key: string) {
  const c = cache.get(key)
  if (!c) return
  cache.delete(key)
  rows -= c.users.length
}

export async function getUsers(results: number, page: number, seed: string) {
  const key = `${seed}:${page}:${results}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return { users: hit.users, cached: true }

  const qs = new URLSearchParams({ results: String(results), page: String(page), seed })
  const r = await fetch('https://randomuser.me/api/?' + qs, { signal: AbortSignal.timeout(15000) })
  const json = await r.json()
  if (!r.ok || !Array.isArray(json.results)) {
    throw new Error(json.error || 'status ' + r.status)
  }
  const users = (json.results as RandomUser[]).map(toUser)

  drop(key)
  // Map urut by insert, so yg pertama = paling lama
  while (cache.size && rows + users.length > MAX_ROWS) drop(cache.keys().next().value!)
  cache.set(key, { at: Date.now(), users })
  rows += users.length
  return { users, cached: false }
}
