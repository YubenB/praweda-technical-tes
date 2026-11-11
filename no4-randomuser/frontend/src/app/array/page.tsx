'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Flex, Input, Space, Tag } from 'antd'
import { colors as defaultColors, items, labels, combine } from '@/lib/arr'

export default function ArrayPage() {
  const [colors, setColors] = useState(defaultColors)
  const [val, setVal] = useState('')

  const result = combine(colors, items, labels)

  const add = () => {
    const c = val.trim()
    if (!c) return
    setColors([...colors, c])
    setVal('')
  }

  return (
    <main className="wrap" style={{ maxWidth: 820 }}>
      <div className="card">
        <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
          <h1 className="title">Manipulate Array</h1>
          <Link href="/" style={{ fontSize: 13, color: '#1677ff' }}>
            Back to List
          </Link>
        </Flex>

        <p style={{ marginTop: 0 }}>Colors (click x to remove, or add new color e.g. &quot;maroon&quot;):</p>
        <Flex gap={6} wrap style={{ marginBottom: 12 }}>
          {colors.map((c, i) => (
            <Tag
              key={i + c}
              closable
              onClose={(e) => {
                e.preventDefault()
                setColors(colors.filter((_, idx) => idx !== i))
              }}
            >
              {c}
            </Tag>
          ))}
        </Flex>
        <Space.Compact style={{ maxWidth: 360, width: '100%', marginBottom: 8 }}>
          <Input placeholder="maroon" value={val} onChange={(e) => setVal(e.target.value)} onPressEnter={add} />
          <Button type="primary" onClick={add}>
            Add
          </Button>
        </Space.Compact>
        <div style={{ marginBottom: 20 }}>
          <Button size="small" type="link" style={{ padding: 0 }} onClick={() => setColors(defaultColors)}>
            Reset
          </Button>
        </div>

        <p>Input:</p>
        <pre className="code">
          {JSON.stringify(colors) + '\n' + JSON.stringify(items) + '\n' + JSON.stringify(labels)}
        </pre>

        <p>Result ({result.length}):</p>
        <ol className="result-list">
          {result.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
        <pre className="code" style={{ marginTop: 12 }}>
          {JSON.stringify(result)}
        </pre>
      </div>
    </main>
  )
}
