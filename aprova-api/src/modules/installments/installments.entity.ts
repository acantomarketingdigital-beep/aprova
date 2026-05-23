import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from '../transactions/transactions.entity';

export enum InstallmentStatus {
  SCHEDULED = 'scheduled',
  DEDUCTED = 'deducted',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('installments')
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'uuid', name: 'transaction_id' })
  transaction_id: string;

  @Column({ type: 'smallint', name: 'installment_number' })
  installment_number: number;

  @Column({ type: 'date', name: 'due_date' })
  due_date: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.SCHEDULED,
  })
  status: InstallmentStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'deducted_at' })
  deducted_at: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'payroll_import_id' })
  payroll_import_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
