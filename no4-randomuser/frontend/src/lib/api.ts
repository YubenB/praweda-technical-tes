const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// sama persis kayak response GET /users di backend
export type User = {
  name: string
  location: string
  email: string
  age: number
  phone: string
  cell: string
  picture: string[]
}

export type UsersRes = {
  page: number
  results: number
  seed: string
  data: User[]
}

export async function getUsers(page: number, results: number, signal?: AbortSignal): Promise<UsersRes> {
  const qs = new URLSearchParams({ page: String(page), results: String(results) })
  let res: Response
  try {
    res = await fetch(`${API}/users?${qs}`, { signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new Error(`Can't reach the backend (${API}), udah running belum?`)
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'failed to get data')
  return json
}
