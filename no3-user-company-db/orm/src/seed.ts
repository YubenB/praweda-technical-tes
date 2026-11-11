import { AppDataSource } from './data-source'
import { User } from './entity/User'
import { Company } from './entity/Company'

// nickname in soal -> the real uuid v4 (same as sql/02_staging.sql)
const ids: Record<string, string> = {
  '12qwer': 'd12312a0-290a-44fd-bcde-53a4697604b9',
  '321rewq': '31cf38f0-1747-432b-ae7c-3c81597b0073',
  trew098: '0505e8eb-516a-41be-82a4-b9287e57750f',
  poiuyt1234: '21e131c0-502e-4e46-9323-9511b4ecd197',
}

// data exactly from soal, including the broken rows (Gajah Mada, Samudera)
const rawUsers = [
  { id: 'Uuidv4(12qwer)', nama: 'Imron', email: '', telp: '081234567890' },
  { id: 'Uuidv4(321rewq)', nama: 'Juli', email: 'Sammy@mail.com', telp: '0987654321' },
  { id: '', nama: 'Gajah Mada', email: '', telp: '' },
]

const rawCompanies = [
  { id: 'Uuidv4(trew098)', userId: '12qwer', code: 'SPI', name: '' },
  { id: '', userId: '', code: '', name: 'Samudera' },
  { id: 'Uuidv4(poiuyt1234)', userId: '321rewq', code: 'PIC', name: 'Samudera' },
]

const clean = (v: string) => v.trim() || null

function resolveId(raw: string) {
  const nick = raw.trim().replace(/^uuidv4\((.+)\)$/i, '$1')
  return ids[nick] ?? null
}

async function main() {
  await AppDataSource.initialize()

  await AppDataSource.transaction(async (m) => {
    const users = rawUsers
      .filter((r) => resolveId(r.id))
      .map((r) => ({ id: resolveId(r.id)!, nama: r.nama.trim(), email: clean(r.email), telp: clean(r.telp) }))

    // conflict target id aja, sama kaya 03_migrate. orIgnore() itu do nothing buat semua conflict,
    // jadi email dobel bakal ke-skip diem2
    const u = await m.createQueryBuilder().insert().into(User).values(users).onConflict('("id") DO NOTHING').execute()

    // company only inserted kalo user nya beneran exist di db
    const existing = new Set((await m.find(User, { select: { id: true } })).map((x) => x.id))
    const companies = rawCompanies
      .filter((r) => resolveId(r.id) && existing.has(resolveId(r.userId) ?? ''))
      .map((r) => ({
        id: resolveId(r.id)!,
        userId: resolveId(r.userId)!,
        companyCode: r.code.trim(),
        companyName: clean(r.name),
      }))

    const c = await m.createQueryBuilder().insert().into(Company).values(companies).onConflict('("id") DO NOTHING').execute()

    console.log(`users: ${u.raw.length} new, companies: ${c.raw.length} new`)
    console.log(`skipped: ${rawUsers.length - users.length} user, ${rawCompanies.length - companies.length} company`)
  })

  await AppDataSource.destroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
