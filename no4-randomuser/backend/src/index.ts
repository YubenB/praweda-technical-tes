import express from 'express'
import cors from 'cors'
import { getUsers } from './randomuser'

const app = express()
const PORT = Number(process.env.PORT) || 4000

// without seed, tiap request hasilnya random lagi so page 2 jadi ga consistent
const SEED = 'praweda'

app.use(cors())

function toInt(val: unknown, def: number) {
  if (val === undefined || val === '') return def
  if (typeof val !== 'string' || !/^\d+$/.test(val)) return NaN
  return Number(val)
}

app.get('/users', async (req, res) => {
  const results = toInt(req.query.results, 10)
  const page = toInt(req.query.page, 1)
  const seed = req.query.seed === undefined ? SEED : req.query.seed

  if (!(results >= 1 && results <= 5000)) {
    res.status(400).json({ message: 'results must be a number 1 - 5000' })
    return
  }
  if (!(page >= 1 && page <= 10000)) {
    res.status(400).json({ message: 'page must be a number 1 - 10000' })
    return
  }
  if (typeof seed !== 'string' || !/^\w{1,30}$/.test(seed)) {
    res.status(400).json({ message: 'seed only letters/numbers, max 30 chars' })
    return
  }

  try {
    const { users, cached } = await getUsers(results, page, seed)
    res.set('X-Cache', cached ? 'HIT' : 'MISS')
    res.json({ page, results, seed, data: users })
  } catch (err) {
    console.log('failed fetch randomuser:', err)
    // timeout -> 504, sisanya (network error, randomuser down / balikin error) -> 502
    if (err instanceof Error && err.name === 'TimeoutError') {
      res.status(504).json({ message: 'randomuser.me is too slow, try again' })
      return
    }
    res.status(502).json({ message: 'failed to get data from randomuser.me' })
  }
})

app.listen(PORT, () => {
  console.log('backend running on http://localhost:' + PORT)
})
