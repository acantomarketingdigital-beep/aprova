import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Employee Risk Tiers (Compliance Financeiro APROVA)
 *
 * Adds:
 *  1. Two new values to employee_status_enum:
 *     - 'carencia'       — Cenário A: < 90 dias de casa, margem bloqueada
 *     - 'ativo_com_teto' — Cenário B: 90–365 dias, teto de dívida = 1× salário
 *
 *  2. Column max_debt_limit DECIMAL(12,2) NULLABLE on employees table:
 *     NULL   = sem teto (Cenário C, ACTIVE)
 *     > 0    = teto em reais (Cenário B, ATIVO_COM_TETO)
 *     0      = bloqueado (Cenário A, CARENCIA)
 */
export class EmployeeRiskTiers1716400000001 implements MigrationInterface {
  name = 'EmployeeRiskTiers1716400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Add new enum values ────────────────────────────────────────────────
    // PostgreSQL doesn't allow removing enum values, but adding is safe.
    await queryRunner.query(
      `ALTER TYPE "employee_status_enum" ADD VALUE IF NOT EXISTS 'carencia'`,
    );
    await queryRunner.query(
      `ALTER TYPE "employee_status_enum" ADD VALUE IF NOT EXISTS 'ativo_com_teto'`,
    );

    // ── 2. Add max_debt_limit column ──────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "employees"
        ADD COLUMN IF NOT EXISTS "max_debt_limit" DECIMAL(12, 2) NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "employees"."max_debt_limit" IS
        'Motor de crédito — teto de dívida total:
         NULL = sem teto (Cenário C: ACTIVE, >365 dias),
         1× net_salary (Cenário B: ATIVO_COM_TETO, 90–365 dias),
         0 = bloqueado (Cenário A: CARENCIA, <90 dias)'
    `);

    // ── 3. Backfill existing active employees ─────────────────────────────────
    // Employees already in DB without admission_date → keep ACTIVE, no debt cap.
    // Employees with admission_date → recalculate on next /employees/recalculate-risk call.
    await queryRunner.query(`
      UPDATE "employees"
        SET "max_debt_limit" = NULL
      WHERE "status" = 'active'
        AND "max_debt_limit" IS NULL
    `);

    // ── 4. Index for risk-tier queries ────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employees_status_company"
        ON "employees" ("company_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_status_company"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "max_debt_limit"`);
    // NOTE: PostgreSQL does not support DROP VALUE from enum.
    // To fully roll back, recreate the enum without the new values.
    // This is intentionally omitted to avoid data loss in production.
  }
}
