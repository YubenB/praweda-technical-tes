import { AppDataSource } from './data-source'
import { Company } from './entity/Company'

async function main() {
  await AppDataSource.initialize()

  const rows = await AppDataSource.getRepository(Company)
    .createQueryBuilder('c')
    .innerJoin('c.user', 'u')
    .select('u.id', 'user_id')
    .addSelect('c.id', 'company_id')
    .addSelect('u.nama', 'nama')
    .addSelect('u.email', 'email')
    .addSelect('u.telp', 'telp')
    .addSelect('c.companyCode', 'company_code')
    .addSelect('c.companyName', 'company_name')
    .orderBy('u.nama')
    .addOrderBy('c.companyCode')
    .getRawMany()

  // column order from getRawMany ga sesuai select, so di-define ulang disini
  console.table(rows, ['user_id', 'company_id', 'nama', 'email', 'telp', 'company_code', 'company_name'])
  await AppDataSource.destroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
