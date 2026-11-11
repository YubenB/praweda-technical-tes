import { Image, Popover, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import type { User } from '@/lib/api'

export type Row = User & { key: string }

const columns: TableColumnsType<Row> = [
  { title: 'Nama', dataIndex: 'name', width: 190 },
  { title: 'Umur', dataIndex: 'age', width: 80, align: 'center' },
  {
    title: 'Alamat',
    dataIndex: 'location',
    width: 140,
    render: (loc: string) => (
      <Popover title="Alamat" content={<div style={{ maxWidth: 280 }}>{loc}</div>} trigger={['hover', 'click']}>
        <span className="alamat">(Alamat Detail)</span>
      </Popover>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: 200,
    render: (email: string) => <span style={{ wordBreak: 'break-all' }}>{email}</span>,
  },
  { title: 'No. Telepon 1', dataIndex: 'phone', width: 150 },
  { title: 'No. Telepon 2', dataIndex: 'cell', width: 150 },
  {
    title: 'Gambar',
    dataIndex: 'picture',
    width: 100,
    render: (pic: string[]) =>
      pic.length ? (
        <Image
          src={pic[1]}
          alt="photo"
          width={64}
          height={48}
          preview={{ src: pic[0] }}
          styles={{ image: { objectFit: 'cover', borderRadius: 6 } }}
        />
      ) : (
        '-'
      ),
  },
]

export default function UserTable({ rows, loading }: { rows: Row[]; loading: boolean }) {
  return <Table<Row> columns={columns} dataSource={rows} loading={loading} pagination={false} scroll={{ x: 1000 }} />
}
