import { useEffect, useState } from 'react'
import { getUsers, type User } from './api'

export function useUsers(page: number, results: number) {
  const key = page + '-' + results
  // hasil disimpen bareng key request nya, so loading = hasil terakhir bukan buat page/size ini
  const [res, setRes] = useState<{ key: string; data: User[]; error: string }>()

  useEffect(() => {
    // pindah page sebelum response balik -> request lama di-abort, response nya ga dipake
    const ac = new AbortController()
    getUsers(page, results, ac.signal)
      .then((r) => {
        if (!ac.signal.aborted) setRes({ key, data: r.data, error: '' })
      })
      .catch((err) => {
        if (!ac.signal.aborted) setRes({ key, data: [], error: err.message })
      })
    return () => ac.abort()
  }, [key, page, results])

  return {
    data: res?.data ?? [],
    loading: res?.key !== key,
    error: res?.key === key ? res.error : '',
  }
}
