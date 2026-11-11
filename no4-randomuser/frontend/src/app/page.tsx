import { Suspense } from 'react'
import Link from 'next/link'
import { Flex } from 'antd'
import UserList from '@/components/UserList'

export default function Home() {
  return (
    <main className="wrap">
      <div className="card">
        <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
          <h1 className="title">List</h1>
          <Link href="/array" style={{ fontSize: 13, color: '#1677ff' }}>
            Array manipulation
          </Link>
        </Flex>

        {/* UserList pake useSearchParams, harus di dalem Suspense biar / tetep bisa di-prerender */}
        <Suspense>
          <UserList />
        </Suspense>
      </div>
    </main>
  )
}
