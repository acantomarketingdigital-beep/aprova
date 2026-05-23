import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Company } from '../companies/companies.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  DISMISSED = 'dismissed',
  ON_LEAVE = 'on_leave',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'company_id' })
  company_id: string;

  @Column({ length: 100, nullable: true })
  registration: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'net_salary' })
  net_salary: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'available_margin',
  })
  available_margin: number;

  @Column({ type: 'date', nullable: true, name: 'admission_date' })
  admission_date: string | null;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
