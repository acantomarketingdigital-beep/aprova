import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: QR Code Token Display Fields
 *
 * Adds three new nullable columns to the qr_codes table so that the partner's
 * validation screen can display reservation details without additional joins:
 *
 *  - installments_count  SMALLINT NOT NULL DEFAULT 1
 *  - product_name        VARCHAR(255) NULL  — procedure/service display name
 *  - patient_name        VARCHAR(255) NULL  — worker's full name at generation time
 *
 * The existing `amount` column is interpreted as the TOTAL gross value.
 * Installment amount is derived: amount / installments_count.
 */
export class QrCodeTokenFields1716500000001 implements MigrationInterface {
  name = 'QrCodeTokenFields1716500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── installments_count ───────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "qr_codes"
        ADD COLUMN IF NOT EXISTS "installments_count" SMALLINT NOT NULL DEFAULT 1
    `);

    // ── product_name ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "qr_codes"
        ADD COLUMN IF NOT EXISTS "product_name" VARCHAR(255) NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "qr_codes"."product_name" IS
        'Display name of the reserved procedure/service. Stored at token-generation time.'
    `);

    // ── patient_name ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "qr_codes"
        ADD COLUMN IF NOT EXISTS "patient_name" VARCHAR(255) NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "qr_codes"."patient_name" IS
        'Worker full name at generation time — shown to receptionist for identity confirmation.'
    `);

    // ── Performance index: look up by token code (already unique, covers equality) ──
    // Already covered by the unique index on `token` column.

    // ── Index: active tokens by partner for dashboard queries ─────────────────
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_qr_codes_partner_status"
        ON "qr_codes" ("partner_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_qr_codes_partner_status"`);
    await queryRunner.query(`ALTER TABLE "qr_codes" DROP COLUMN IF EXISTS "patient_name"`);
    await queryRunner.query(`ALTER TABLE "qr_codes" DROP COLUMN IF EXISTS "product_name"`);
    await queryRunner.query(`ALTER TABLE "qr_codes" DROP COLUMN IF EXISTS "installments_count"`);
  }
}
