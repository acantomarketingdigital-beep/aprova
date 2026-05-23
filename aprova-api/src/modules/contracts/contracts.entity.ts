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

@Entity('contracts')
export class Contract {
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

  @Column({ length: 64, name: 'content_hash' })
  content_hash: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'signed_at' })
  signed_at: Date | null;

  @Column({ length: 45, nullable: true, name: 'ip_address' })
  ip_address: string | null;

  @Column({ length: 255, nullable: true, name: 'device_fingerprint' })
  device_fingerprint: string | null;

  @Column({ unique: true, length: 255, name: 'signature_token' })
  signature_token: string;

  @Column({ length: 500, nullable: true, name: 'pdf_url' })
  pdf_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
