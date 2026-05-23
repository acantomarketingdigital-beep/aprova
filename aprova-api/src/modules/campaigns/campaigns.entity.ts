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

export enum CampaignType {
  BANNER_PREMIUM = 'banner_premium',
  PUSH_NOTIFICATION = 'push_notification',
  FLASH_SALE = 'flash_sale',
}

export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  SCHEDULED = 'scheduled',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Partner, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ type: 'uuid', name: 'partner_id' })
  partner_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: CampaignType })
  type: CampaignType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number | null;

  @Column({ type: 'timestamptz', name: 'starts_at' })
  starts_at: Date;

  @Column({ type: 'timestamptz', name: 'ends_at' })
  ends_at: Date;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.SCHEDULED,
  })
  status: CampaignStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
