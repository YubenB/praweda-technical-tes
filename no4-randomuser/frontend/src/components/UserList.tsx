'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, Button, Flex, Input, Pagination, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { User } from '@/lib/api'
import { useUsers } from '@/lib/useUsers'
import UserTable, { type Row } from './UserTable'
import NewDataModal from './NewDataModal'

// randomuser ga provide total data, so anggep aja 1000 biar pagination nya works
const TOTAL = 1000
const SIZES = [10, 20, 50, 100]

export default function UserList() {
  // page & size disimpen di URL (?page=2&results=20) biar refresh / share link tetep di page yg sama
  const sp = useSearchParams()
  const size = SIZES.includes(Number(sp.get('results'))) ? Number(sp.get('results')) : 10
  const n = Number(sp.get('page'))
  const page = Number.isInteger(n) && n >= 1 && n <= Math.ceil(TOTAL / size) ? n : 1

  const { data, loading, error } = useUsers(page, size)
  const [added, setAdded] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [open, setOpen] = useState(false)
  const [msg, holder] = message.useMessage()

  // input nya tetep langsung update, filter nya nunggu user berhenti ngetik 300ms
  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // randomuser ga punya search, so search nya di client: data page ini + data baru
  const rows = useMemo(() => {
    const all = [...added, ...data.map((u, i) => ({ ...u, key: 'u' + i }))]
    const s = dq.trim().toLowerCase()
    if (!s) return all
    return all.filter((r) => [r.name, r.email, r.phone, r.cell, r.location].some((v) => v.toLowerCase().includes(s)))
  }, [added, data, dq])

  // pushState cukup buat update URL + useSearchParams, ga perlu round trip ke server Next kayak router.push
  const changePage = (p: number, s: number) => {
    window.history.pushState(null, '', `?page=${s === size ? p : 1}&results=${s}`)
  }

  // new data cuma di client (randomuser read only), ditaro paling atas di tiap page
  const addData = (u: User) => {
    setAdded((prev) => [{ ...u, key: 'new-' + Date.now() }, ...prev])
    msg.success('Data added')
  }

  return (
    <>
      {holder}
      <Flex justify="space-between" gap={12} wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search"
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={(v) => {
            // enter / clear langsung filter, skip debounce
            setQ(v)
            setDq(v)
          }}
          style={{ maxWidth: 420 }}
        />
        <Button icon={<PlusOutlined />} onClick={() => setOpen(true)} style={{ borderColor: '#434343' }}>
          New Data
        </Button>
      </Flex>

      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <UserTable rows={rows} loading={loading} />

      <Flex justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={page}
          pageSize={size}
          total={TOTAL}
          showSizeChanger
          pageSizeOptions={SIZES}
          onChange={changePage}
          disabled={loading}
        />
      </Flex>

      <NewDataModal open={open} onClose={() => setOpen(false)} onAdd={addData} />
    </>
  )
}
