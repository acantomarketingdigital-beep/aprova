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

export enum PartnerCategory {
  HEALTH = 'health',
  EDUCATION = 'education',
  RETAIL = 'retail',
  FOOD = 'food',
  SERVICES = 'services',
  TECH = 'tech',
  FINANCE = 'finance',
  OTHER = 'other',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum PartnerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @Column({ length: 255, name: 'trade_name' })
  trade_name: string;

  @Column({ unique: true, length: 18 })
  cnpj: string;

  @Column({ type: 'enum', enum: PartnerCategory, default: PartnerCategory.OTHER })
  category: PartnerCategory;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 5,
    name: 'take_rate_pct',
  })
  take_rate_pct: number;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
    name: 'subscription_plan',
  })
  subscription_plan: SubscriptionPlan;

  @Column({ type: 'jsonb', nullable: true, name: 'bank_account' })
  bank_account: Record<string, any> | null;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.PENDING })
  status: PartnerStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
