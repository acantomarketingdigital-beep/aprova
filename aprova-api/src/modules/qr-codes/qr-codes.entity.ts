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
  ACTIVE    = 'active',
  USED      = 'used',
  EXPIRED   = 'expired',
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

  /**
   * Total gross value of the transaction in BRL.
   * Installment amount = amount / installments_count.
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number | null;

  /**
   * Number of installments the worker chose when generating the token.
   * Used to compute the per-installment margin deduction.
   */
  @Column({ type: 'smallint', default: 1, name: 'installments_count' })
  installments_count: number;

  /**
   * Display name of the procedure/service reserved by the worker.
   * Stored at token-generation time for display on the partner's validation screen.
   */
  @Column({ length: 255, nullable: true, name: 'product_name' })
  product_name: string | null;

  /**
   * Patient's full name — stored at generation time so the receptionist can
   * confirm identity without querying the employee record.
   */
  @Column({ length: 255, nullable: true, name: 'patient_name' })
  patient_name: string | null;

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
