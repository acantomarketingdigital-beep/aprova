import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partner } from '../partners/partners.entity';
import { Installment } from '../installments/installments.entity';

export enum ReceivableStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ON_HOLD = 'on_hold',
}

@Entity('receivables')
export class Receivable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Partner, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ type: 'uuid', name: 'partner_id' })
  partner_id: string;

  @ManyToOne(() => Installment, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'installment_id' })
  installment: Installment;

  @Column({ type: 'uuid', name: 'installment_id' })
  installment_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'expected_date' })
  expected_date: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paid_at: Date | null;

  @Column({
    type: 'enum',
    enum: ReceivableStatus,
    default: ReceivableStatus.PENDING,
  })
  status: ReceivableStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
