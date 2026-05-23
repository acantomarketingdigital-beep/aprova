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

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('products_services')
export class ProductService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Partner, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ type: 'uuid', name: 'partner_id' })
  partner_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'smallint', default: 12, name: 'max_installments' })
  max_installments: number;

  @Column({ length: 100, nullable: true })
  category: string | null;

  @Column({ length: 500, nullable: true, name: 'image_url' })
  image_url: string | null;

  @Column({ default: false, name: 'is_featured' })
  is_featured: boolean;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
