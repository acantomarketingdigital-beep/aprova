import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Campaign } from '../campaigns/campaigns.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum TriggerEvent {
  PRE_PAYDAY = 'pre_payday',
  MANUAL = 'manual',
  UPSELL = 'upsell',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Campaign, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'uuid', name: 'campaign_id' })
  campaign_id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'enum', enum: DiscountType, name: 'discount_type' })
  discount_type: DiscountType;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'discount_value' })
  discount_value: number;

  @Column({ type: 'int', nullable: true, name: 'max_uses' })
  max_uses: number | null;

  @Column({ type: 'int', default: 0, name: 'uses_count' })
  uses_count: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'min_amount' })
  min_amount: number | null;

  @Column({ type: 'timestamptz', name: 'valid_from' })
  valid_from: Date;

  @Column({ type: 'timestamptz', name: 'valid_until' })
  valid_until: Date;

  @Column({ type: 'enum', enum: TriggerEvent, name: 'trigger_event' })
  trigger_event: TriggerEvent;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
