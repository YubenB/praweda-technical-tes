import 'reflect-metadata'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Company } from './entity/Company'

config({ quiet: true })

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 55432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'soal3_orm',
  uuidExtension: 'pgcrypto', // so the default is gen_random_uuid(), bukan uuid-ossp
  entities: [User, Company],
  migrations: [__dirname + '/migration/*.{ts,js}'],
  synchronize: false,
})
