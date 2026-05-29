import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QrCode, QrCodeStatus } from './qr-codes.entity';
import { Employee } from '../employees/employees.entity';
import { Transaction, TransactionStatus } from '../transactions/transactions.entity';
import type {
  ValidateTokenResponse,
  ProcessTransactionResponse,
} from './dto/validate-token.dto';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * APROVA platform take rate.
 * 12% stays with APROVA; 88% is registered as future payable to the partner.
 */
const PLATFORM_TAKE_RATE_PCT = 12;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class QrCodesService {
  private readonly logger = new Logger(QrCodesService.name);

  constructor(
    @InjectRepository(QrCode)
    private readonly qrRepo: Repository<QrCode>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,

    private readonly dataSource: DataSource,
  ) {}

  // ── Token validation (read-only) ────────────────────────────────────────────

  /**
   * Validates a QR code token and returns the reservation details for the
   * partner's receptionist to review before confirming the sale.
   *
   * Throws:
   *  - NotFoundException          → token does not exist
   *  - ConflictException          → token already used
   *  - UnprocessableEntityException → token expired or cancelled
   */
  async validateToken(code: string): Promise<ValidateTokenResponse> {
    const normalised = code.trim().toUpperCase();

    const qr = await this.qrRepo.findOne({
      where: { token: normalised },
      relations: ['employee'],
    });

    if (!qr) {
      throw new NotFoundException(
        `Token "${normalised}" não encontrado. Verifique o código e tente novamente.`,
      );
    }

    if (qr.status === QrCodeStatus.USED) {
      throw new ConflictException(
        'Este token já foi utilizado em uma venda anterior. Cada token é de uso único — solicite ao paciente que gere um novo código.',
      );
    }

    if (qr.status === QrCodeStatus.CANCELLED) {
      throw new UnprocessableEntityException(
        'Este token foi cancelado pelo paciente.',
      );
    }

    // Auto-expire tokens that are past their expiry date
    const now = new Date();
    if (qr.status === QrCodeStatus.EXPIRED || qr.expires_at < now) {
      if (qr.status === QrCodeStatus.ACTIVE) {
        await this.qrRepo.update(qr.id, { status: QrCodeStatus.EXPIRED });
      }
      throw new UnprocessableEntityException(
        'Token expirado. Solicite ao paciente que gere um novo token pelo aplicativo APROVA.',
      );
    }

    const grossAmount      = Number(qr.amount ?? 0);
    const installmentsCount = qr.installments_count ?? 1;
    const installmentAmount = installmentsCount > 0
      ? +(grossAmount / installmentsCount).toFixed(2)
      : grossAmount;

    return {
      valid:            true,
      tokenCode:        normalised,
      patientName:      qr.patient_name  ?? null,
      productName:      qr.product_name  ?? null,
      grossAmount,
      installmentsCount,
      installmentAmount,
      marginAvailable:  Number(qr.employee?.available_margin ?? 0),
      expiresAt:        qr.expires_at.toISOString(),
      employeeId:       qr.employee_id,
    };
  }

  // ── Transaction processing (write) ─────────────────────────────────────────

  /**
   * Confirms the sale and executes the financial split within a single
   * serialisable DB transaction to prevent double-spend.
   *
   * Business rules applied:
   *  1. Pessimistic write lock on the QrCode row (double-spend prevention).
   *  2. Margin lock: employee.available_margin >= installment_amount.
   *  3. Split 12 / 88: APROVA takes 12%, partner receives 88%.
   *  4. Margin deduction: subtract installment_amount from employee.available_margin.
   *  5. Token lifecycle: status → USED, used_at = now, transaction_id = savedTx.id.
   *
   * @param tokenCode  Alphanumeric code in XXX-XXX format.
   * @param partnerId  UUID of the authenticated partner. TODO: extract from JWT.
   */
  async processTransaction(
    tokenCode: string,
    partnerId: string,
  ): Promise<ProcessTransactionResponse> {
    const normalised = tokenCode.trim().toUpperCase();

    return this.dataSource.transaction(async (manager) => {
      // ── Re-validate inside transaction with row-level write lock ──────────
      const qr = await manager.findOne(QrCode, {
        where: { token: normalised },
        relations: ['employee'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!qr) {
        throw new NotFoundException(`Token "${normalised}" não encontrado.`);
      }

      if (qr.status !== QrCodeStatus.ACTIVE) {
        const reason =
          qr.status === QrCodeStatus.USED      ? 'já foi utilizado'  :
          qr.status === QrCodeStatus.EXPIRED   ? 'expirou'           :
                                                 'foi cancelado';
        throw new ConflictException(
          `Token ${reason}. Solicite ao paciente que gere um novo código.`,
        );
      }

      const now = new Date();
      if (qr.expires_at < now) {
        await manager.update(QrCode, qr.id, { status: QrCodeStatus.EXPIRED });
        throw new UnprocessableEntityException(
          'Token expirou durante o processamento. Solicite um novo token ao paciente.',
        );
      }

      const emp               = qr.employee;
      const grossAmount       = Number(qr.amount ?? 0);
      const installmentsCount = qr.installments_count ?? 1;
      const installmentAmount = +(grossAmount / installmentsCount).toFixed(2);
      const marginAvailable   = Number(emp.available_margin ?? 0);

      // ── Rule 1: Margin lock ───────────────────────────────────────────────
      if (marginAvailable < installmentAmount) {
        throw new UnprocessableEntityException(
          `Margem insuficiente. Disponível: R$ ${marginAvailable.toFixed(2)}, ` +
          `necessário por parcela: R$ ${installmentAmount.toFixed(2)}.`,
        );
      }

      // ── Rule 2: Split 12 % APROVA / 88 % Partner ─────────────────────────
      const takeRateAmount = +(grossAmount * PLATFORM_TAKE_RATE_PCT / 100).toFixed(2);
      const netToPartner   = +(grossAmount - takeRateAmount).toFixed(2);

      // ── Create transaction record ─────────────────────────────────────────
      const tx = manager.create(Transaction, {
        employee_id:       emp.id,
        partner_id:        partnerId,
        gross_amount:      grossAmount,
        take_rate_pct:     PLATFORM_TAKE_RATE_PCT,
        take_rate_amount:  takeRateAmount,
        net_to_partner:    netToPartner,
        installments_count: installmentsCount,
        installment_amount: installmentAmount,
        status:            TransactionStatus.APPROVED,
        approved_at:       now,
      });
      const savedTx = await manager.save(Transaction, tx);

      // ── Deduct installment from employee's available margin ───────────────
      await manager.update(Employee, emp.id, {
        available_margin: +(marginAvailable - installmentAmount).toFixed(2),
      });

      // ── Mark token as USED and link to transaction ────────────────────────
      await manager.update(QrCode, qr.id, {
        status:         QrCodeStatus.USED,
        used_at:        now,
        transaction_id: savedTx.id,
        partner_id:     partnerId,   // associate partner if token was partner-agnostic
      });

      this.logger.log(
        `[TRANSACTION APPROVED] id=${savedTx.id} token=${normalised} ` +
        `partner=${partnerId} gross=R$${grossAmount} net=R$${netToPartner}`,
      );

      return {
        transactionId:    savedTx.id,
        tokenCode:        normalised,
        patientName:      qr.patient_name  ?? null,
        productName:      qr.product_name  ?? null,
        grossAmount,
        takeRateAmount,
        netToPartner,
        installmentsCount,
        installmentAmount,
        status:           'approved' as const,
        processedAt:      now.toISOString(),
      };
    });
  }
}
