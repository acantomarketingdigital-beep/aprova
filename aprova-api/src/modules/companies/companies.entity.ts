import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 18 })
  cnpj: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 30,
    name: 'margin_cap_pct',
  })
  margin_cap_pct: number;

  @Column({ type: 'smallint', nullable: true })
  payroll_day: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rh_admin_id' })
  rh_admin: User | null;

  @Column({ type: 'uuid', nullable: true, name: 'rh_admin_id' })
  rh_admin_id: string | null;

  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
