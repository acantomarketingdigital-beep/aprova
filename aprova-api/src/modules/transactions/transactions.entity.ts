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
import { ProductService } from '../products/products-services.entity';
import { Coupon } from '../coupons/coupons.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid', name: 'employee_id' })
  employee_id: string;

  @ManyToOne(() => Partner, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ type: 'uuid', name: 'partner_id' })
  partner_id: string;

  @ManyToOne(() => ProductService, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: ProductService | null;

  @Column({ type: 'uuid', nullable: true, name: 'product_id' })
  product_id: string | null;

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @Column({ type: 'uuid', nullable: true, name: 'coupon_id' })
  coupon_id: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'gross_amount' })
  gross_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'take_rate_pct' })
  take_rate_pct: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'take_rate_amount' })
  take_rate_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'net_to_partner' })
  net_to_partner: number;

  @Column({ type: 'smallint', name: 'installments_count' })
  installments_count: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'installment_amount' })
  installment_amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejection_reason: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'contract_id' })
  contract_id: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'approved_at' })
  approved_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
