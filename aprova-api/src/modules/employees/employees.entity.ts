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
import { Company } from '../companies/companies.entity';

export enum EmployeeStatus {
  // ── Produção ──────────────────────────────────────────────────────────────
  ACTIVE = 'active',           // Cenário C: > 12 meses — margem 30%, sem teto de dívida
  ATIVO_COM_TETO = 'ativo_com_teto', // Cenário B: 3–12 meses — margem 30%, teto = 1x salário
  CARENCIA = 'carencia',       // Cenário A: < 90 dias — margem R$0 (demissão sem cobertura)
  // ── Administrativos ───────────────────────────────────────────────────────
  DISMISSED = 'dismissed',
  ON_LEAVE = 'on_leave',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'company_id' })
  company_id: string;

  @Column({ length: 100, nullable: true })
  registration: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'net_salary' })
  net_salary: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'available_margin',
    comment: 'Calculado pelo motor de risco: 30% do salário líquido (0 se CARENCIA).',
  })
  available_margin: number;

  /**
   * Teto máximo de dívida total que este colaborador pode assumir no sistema.
   *
   * Cenário A (CARENCIA)    → 0
   * Cenário B (ATIVO_COM_TETO) → 1× net_salary
   * Cenário C (ACTIVE)      → NULL (sem teto — pode parcelar livremente)
   */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'max_debt_limit',
    comment: 'Teto de dívida total. NULL = sem teto (Cenário C). 0 = bloqueado (Cenário A).',
  })
  max_debt_limit: number | null;

  @Column({ type: 'date', nullable: true, name: 'admission_date' })
  admission_date: string | null;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
