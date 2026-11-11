import { Check, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Company } from './Company'

// constraint names sama kaya sql/01_schema.sql (default postgres), biar 2 answer schema nya identik
@Entity('users')
@Check('users_telp_check', `"telp" ~ '^\\+?[0-9]{8,15}$'`)
// unique lower(email) ga bisa di-generate typeorm, index nya ditulis manual di migration
@Index('uq_users_email', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'users_pkey' })
  id: string

  @Column({ type: 'varchar', length: 100 })
  nama: string

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null

  // varchar, kalo pake number the leading 0 bakal ilang
  @Column({ type: 'varchar', length: 20, nullable: true })
  telp: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @OneToMany(() => Company, (c) => c.user)
  companies: Company[]
}
