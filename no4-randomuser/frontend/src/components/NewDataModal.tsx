import { Form, Input, InputNumber, Modal } from 'antd'
import type { User } from '@/lib/api'

type FormValues = {
  name: string
  age: number
  location: string
  email: string
  phone: string
  cell?: string
  picture?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (u: User) => void
}

export default function NewDataModal({ open, onClose, onAdd }: Props) {
  const [form] = Form.useForm<FormValues>()

  const close = () => {
    form.resetFields()
    onClose()
  }

  const save = (v: FormValues) => {
    const pic = v.picture?.trim()
    onAdd({
      name: v.name.trim(),
      age: v.age,
      location: v.location.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      cell: v.cell?.trim() || '-',
      picture: pic ? [pic, pic, pic] : [],
    })
    close()
  }

  return (
    <Modal title="New Data" open={open} okText="Save" cancelText="Cancel" onOk={() => form.submit()} onCancel={close}>
      <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Nama" rules={[{ required: true, whitespace: true, message: 'Nama is required' }]}>
          <Input placeholder="Mr, John Doe" />
        </Form.Item>
        <Form.Item name="age" label="Umur" rules={[{ required: true, message: 'Umur is required' }]}>
          <InputNumber min={0} max={150} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="location" label="Alamat" rules={[{ required: true, whitespace: true, message: 'Alamat is required' }]}>
          <Input.TextArea rows={2} placeholder="No, street, city, state, country" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Email format is wrong' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="No. Telepon 1" rules={[{ required: true, whitespace: true, message: 'Phone number is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="cell" label="No. Telepon 2">
          <Input />
        </Form.Item>
        <Form.Item name="picture" label="Gambar (URL)" rules={[{ type: 'url', message: 'URL is not valid' }]}>
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
