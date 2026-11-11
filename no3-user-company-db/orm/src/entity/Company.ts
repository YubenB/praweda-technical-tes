import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { User } from './User'

// 1 user many company, tapi company_code ga boleh dobel per user. index nya ke-pake juga buat lookup by user_id
@Entity('companies')
@Unique('companies_user_id_company_code_key', ['userId', 'companyCode'])
export class Company {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'companies_pkey' })
  id: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @Column({ name: 'company_code', type: 'varchar', length: 20 })
  companyCode: string

  @Column({ name: 'company_name', type: 'varchar', length: 150, nullable: true })
  companyName: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  // company ga ada artinya tanpa user nya, so ikut kehapus
  @ManyToOne(() => User, (u) => u.companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'companies_user_id_fkey' })
  user: User
}
