import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1716400000000 implements MigrationInterface {
  name = 'InitialSchema1716400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- ENUM TYPES ----------
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('worker', 'partner', 'rh_admin', 'master_admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TYPE "company_status_enum" AS ENUM ('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TYPE "employee_status_enum" AS ENUM ('active', 'dismissed', 'on_leave')`,
    );
    await queryRunner.query(
      `CREATE TYPE "partner_category_enum" AS ENUM ('health', 'education', 'retail', 'food', 'services', 'tech', 'finance', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_plan_enum" AS ENUM ('free', 'premium')`,
    );
    await queryRunner.query(
      `CREATE TYPE "partner_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TYPE "product_status_enum" AS ENUM ('active', 'inactive', 'draft')`,
    );
    await queryRunner.query(
      `CREATE TYPE "campaign_type_enum" AS ENUM ('banner_premium', 'push_notification', 'flash_sale')`,
    );
    await queryRunner.query(
      `CREATE TYPE "campaign_status_enum" AS ENUM ('active', 'paused', 'ended', 'scheduled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "discount_type_enum" AS ENUM ('percentage', 'fixed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "trigger_event_enum" AS ENUM ('pre_payday', 'manual', 'upsell')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "installment_status_enum" AS ENUM ('scheduled', 'deducted', 'overdue', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "qr_code_status_enum" AS ENUM ('active', 'used', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "receivable_status_enum" AS ENUM ('pending', 'paid', 'on_hold')`,
    );

    // ---------- USERS ----------
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
        "email"         VARCHAR(255) NOT NULL,
        "phone"         VARCHAR(20),
        "password_hash" VARCHAR(255) NOT NULL,
        "role"          "user_role_enum" NOT NULL DEFAULT 'worker',
        "status"        "user_status_enum" NOT NULL DEFAULT 'active',
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // ---------- COMPANIES ----------
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
        "name"           VARCHAR(255) NOT NULL,
        "cnpj"           VARCHAR(18) NOT NULL,
        "margin_cap_pct" NUMERIC(5,2) NOT NULL DEFAULT 30,
        "payroll_day"    SMALLINT,
        "rh_admin_id"    UUID,
        "status"         "company_status_enum" NOT NULL DEFAULT 'active',
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_companies_cnpj" UNIQUE ("cnpj"),
        CONSTRAINT "FK_companies_rh_admin" FOREIGN KEY ("rh_admin_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ---------- PARTNERS ----------
    await queryRunner.query(`
      CREATE TABLE "partners" (
        "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID NOT NULL,
        "trade_name"        VARCHAR(255) NOT NULL,
        "cnpj"              VARCHAR(18) NOT NULL,
        "category"          "partner_category_enum" NOT NULL DEFAULT 'other',
        "take_rate_pct"     NUMERIC(5,2) NOT NULL DEFAULT 5,
        "subscription_plan" "subscription_plan_enum" NOT NULL DEFAULT 'free',
        "bank_account"      JSONB,
        "status"            "partner_status_enum" NOT NULL DEFAULT 'pending',
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partners" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_partners_cnpj" UNIQUE ("cnpj"),
        CONSTRAINT "FK_partners_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- EMPLOYEES ----------
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"          UUID NOT NULL,
        "company_id"       UUID NOT NULL,
        "registration"     VARCHAR(100),
        "net_salary"       NUMERIC(12,2) NOT NULL,
        "available_margin" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "admission_date"   DATE,
        "status"           "employee_status_enum" NOT NULL DEFAULT 'active',
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employees" PRIMARY KEY ("id"),
        CONSTRAINT "FK_employees_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_employees_company" FOREIGN KEY ("company_id")
          REFERENCES "companies"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- PRODUCTS_SERVICES ----------
    await queryRunner.query(`
      CREATE TABLE "products_services" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "partner_id"       UUID NOT NULL,
        "name"             VARCHAR(255) NOT NULL,
        "description"      TEXT,
        "price"            NUMERIC(12,2) NOT NULL,
        "max_installments" SMALLINT NOT NULL DEFAULT 12,
        "category"         VARCHAR(100),
        "image_url"        VARCHAR(500),
        "is_featured"      BOOLEAN NOT NULL DEFAULT false,
        "status"           "product_status_enum" NOT NULL DEFAULT 'active',
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_services" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- CAMPAIGNS ----------
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "partner_id" UUID NOT NULL,
        "name"       VARCHAR(255) NOT NULL,
        "type"       "campaign_type_enum" NOT NULL,
        "budget"     NUMERIC(12,2),
        "starts_at"  TIMESTAMPTZ NOT NULL,
        "ends_at"    TIMESTAMPTZ NOT NULL,
        "status"     "campaign_status_enum" NOT NULL DEFAULT 'scheduled',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id"),
        CONSTRAINT "FK_campaigns_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- COUPONS ----------
    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
        "campaign_id"    UUID NOT NULL,
        "code"           VARCHAR(50) NOT NULL,
        "discount_type"  "discount_type_enum" NOT NULL,
        "discount_value" NUMERIC(12,2) NOT NULL,
        "max_uses"       INT,
        "uses_count"     INT NOT NULL DEFAULT 0,
        "min_amount"     NUMERIC(12,2),
        "valid_from"     TIMESTAMPTZ NOT NULL,
        "valid_until"    TIMESTAMPTZ NOT NULL,
        "trigger_event"  "trigger_event_enum" NOT NULL,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupons" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code"),
        CONSTRAINT "FK_coupons_campaign" FOREIGN KEY ("campaign_id")
          REFERENCES "campaigns"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- CONTRACTS ----------
    await queryRunner.query(`
      CREATE TABLE "contracts" (
        "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
        "employee_id"        UUID NOT NULL,
        "partner_id"         UUID NOT NULL,
        "content_hash"       VARCHAR(64) NOT NULL,
        "signed_at"          TIMESTAMPTZ,
        "ip_address"         VARCHAR(45),
        "device_fingerprint" VARCHAR(255),
        "signature_token"    VARCHAR(255) NOT NULL,
        "pdf_url"            VARCHAR(500),
        "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contracts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_contracts_signature_token" UNIQUE ("signature_token"),
        CONSTRAINT "FK_contracts_employee" FOREIGN KEY ("employee_id")
          REFERENCES "employees"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_contracts_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- TRANSACTIONS ----------
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
        "employee_id"        UUID NOT NULL,
        "partner_id"         UUID NOT NULL,
        "product_id"         UUID,
        "coupon_id"          UUID,
        "gross_amount"       NUMERIC(12,2) NOT NULL,
        "take_rate_pct"      NUMERIC(5,2) NOT NULL,
        "take_rate_amount"   NUMERIC(12,2) NOT NULL,
        "net_to_partner"     NUMERIC(12,2) NOT NULL,
        "installments_count" SMALLINT NOT NULL,
        "installment_amount" NUMERIC(12,2) NOT NULL,
        "status"             "transaction_status_enum" NOT NULL DEFAULT 'pending',
        "rejection_reason"   TEXT,
        "contract_id"        UUID,
        "approved_at"        TIMESTAMPTZ,
        "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_employee" FOREIGN KEY ("employee_id")
          REFERENCES "employees"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_transactions_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_transactions_product" FOREIGN KEY ("product_id")
          REFERENCES "products_services"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_transactions_coupon" FOREIGN KEY ("coupon_id")
          REFERENCES "coupons"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_transactions_contract" FOREIGN KEY ("contract_id")
          REFERENCES "contracts"("id") ON DELETE SET NULL
      )
    `);

    // ---------- INSTALLMENTS ----------
    await queryRunner.query(`
      CREATE TABLE "installments" (
        "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id"     UUID NOT NULL,
        "installment_number" SMALLINT NOT NULL,
        "due_date"           DATE NOT NULL,
        "amount"             NUMERIC(12,2) NOT NULL,
        "status"             "installment_status_enum" NOT NULL DEFAULT 'scheduled',
        "deducted_at"        TIMESTAMPTZ,
        "payroll_import_id"  UUID,
        "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_installments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_installments_transaction" FOREIGN KEY ("transaction_id")
          REFERENCES "transactions"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- QR_CODES ----------
    await queryRunner.query(`
      CREATE TABLE "qr_codes" (
        "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
        "employee_id"    UUID NOT NULL,
        "partner_id"     UUID,
        "token"          VARCHAR(255) NOT NULL,
        "amount"         NUMERIC(12,2),
        "expires_at"     TIMESTAMPTZ NOT NULL,
        "used_at"        TIMESTAMPTZ,
        "transaction_id" UUID,
        "status"         "qr_code_status_enum" NOT NULL DEFAULT 'active',
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_qr_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_qr_codes_token" UNIQUE ("token"),
        CONSTRAINT "FK_qr_codes_employee" FOREIGN KEY ("employee_id")
          REFERENCES "employees"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_qr_codes_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_qr_codes_transaction" FOREIGN KEY ("transaction_id")
          REFERENCES "transactions"("id") ON DELETE SET NULL
      )
    `);

    // ---------- RECEIVABLES ----------
    await queryRunner.query(`
      CREATE TABLE "receivables" (
        "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
        "partner_id"     UUID NOT NULL,
        "installment_id" UUID NOT NULL,
        "amount"         NUMERIC(12,2) NOT NULL,
        "expected_date"  DATE NOT NULL,
        "paid_at"        TIMESTAMPTZ,
        "status"         "receivable_status_enum" NOT NULL DEFAULT 'pending',
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_receivables" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receivables_partner" FOREIGN KEY ("partner_id")
          REFERENCES "partners"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_receivables_installment" FOREIGN KEY ("installment_id")
          REFERENCES "installments"("id") ON DELETE RESTRICT
      )
    `);

    // ---------- INDEXES ----------
    await queryRunner.query(`CREATE INDEX "IDX_employees_company" ON "employees"("company_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_employees_user" ON "employees"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_employee" ON "transactions"("employee_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_partner" ON "transactions"("partner_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_status" ON "transactions"("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_installments_transaction" ON "installments"("transaction_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_installments_due_date" ON "installments"("due_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_receivables_partner" ON "receivables"("partner_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_receivables_expected_date" ON "receivables"("expected_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_qr_codes_token" ON "qr_codes"("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_qr_codes_employee" ON "qr_codes"("employee_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "receivables"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "qr_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "installments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contracts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products_services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partners"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "receivable_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "qr_code_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "installment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "trigger_event_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "discount_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "campaign_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "campaign_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "product_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "partner_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "subscription_plan_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "partner_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "company_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
