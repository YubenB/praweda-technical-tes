import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export type User = { id: string; username: string; password: string }

// plain password nya ada di README, yg disimpen cuma scrypt hash (salt:hash)
export const users: User[] = [
  {
    id: '558aaadb-5511-4944-b79f-5ce35b13b05f',
    username: 'budi',
    password: '9205acc8afebe5d73e920fe661b7c5b2:784995a7c67a20c951a14570951c9439dd08543cb81fdff40116fbcf225d4938a65419e7cb366c165bf7c80c5dfe945eaa53115029f5773755bb0d63980a0199',
  },
  {
    id: 'ec4dd325-b81a-4702-9c0b-4f2617c95aef',
    username: 'siti',
    password: '1afdc35b376f42d344a9475bc47d7737:0bc01b68a655686e919037013f4ef75b2fd9919fa621a9411b1d6d68ea9e3861c6f2a8ac62edc342a935240f3a6542c2a1208d01266ee65cd006160dd32b86c1',
  },
  {
    id: '62841fdb-7dc5-4f91-b386-a46eba57067a',
    username: 'andi',
    password: '3b369798c57e680e20926380df06417d:7b0b975016f88a3ee4b8d627fbfd64665a95e51a94d68a6e24848fa8bd6886e4df0b13bcfe8b7fcf719c2eaa42f884190f76c70d7e8201637c012542b10e1140',
  },
]

export const clients = [{ id: 'web-app', secret: 'web-secret-123' }]

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

export function safeEqual(a: string, b: string) {
  return timingSafeEqual(Buffer.from(sha256(a)), Buffer.from(sha256(b)))
}

export const findUser = (username: string) =>
  users.find((u) => u.username.toLowerCase() === username.toLowerCase())

export const findUserById = (id: string) => users.find((u) => u.id === id)

export async function hashPassword(pw: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(pw, salt, 64)) as Buffer
  return salt + ':' + hash.toString('hex')
}

export async function checkPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const buf = (await scryptAsync(pw, salt, 64)) as Buffer
  return timingSafeEqual(buf, Buffer.from(hash, 'hex'))
}
