import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employees/employees.entity';
import { Partner } from '../partners/partners.entity';
import { Transaction } from '../transactions/transactions.entity';

export enum QrCodeStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid', name: 'employee_id' })
  employee_id: string;

  @ManyToOne(() => Partner, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner | null;

  @Column({ type: 'uuid', nullable: true, name: 'partner_id' })
  partner_id: string | null;

  @Column({ unique: true, length: 255 })
  token: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'used_at' })
  used_at: Date | null;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction | null;

  @Column({ type: 'uuid', nullable: true, name: 'transaction_id' })
  transaction_id: string | null;

  @Column({ type: 'enum', enum: QrCodeStatus, default: QrCodeStatus.ACTIVE })
  status: QrCodeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
