import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';

/**
 * QrCodesController — partner-facing token validation and sale processing.
 *
 * Base path: /api/v1/qr-codes  (configured in main.ts global prefix + module path)
 *
 * GET  /qr-codes/validate/:code   → read-only token lookup (no side effects)
 * POST /transactions/process       → confirm sale, deduct margin, record split
 *
 * Note: the process endpoint lives at /transactions/process (separate logical
 * resource) but is implemented here since it is the only mutation that touches
 * both QrCode and Transaction atomically.
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  /**
   * GET /api/v1/qr-codes/validate/:code
   *
   * Looks up a token and returns reservation details.
   * Safe to call multiple times — no state changes occur.
   *
   * @param code  Alphanumeric token string, e.g. "RXD-6YD" (case-insensitive).
   *
   * Responses:
   *  200 → { valid: true, patientName, productName, grossAmount, ... }
   *  404 → token not found
   *  409 → token already used
   *  422 → token expired or cancelled
   */
  @Get('qr-codes/validate/:code')
  @Roles(UserRole.PARTNER, UserRole.MASTER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async validate(@Param('code') code: string) {
    return this.qrCodesService.validateToken(code);
  }

  /**
   * POST /api/v1/transactions/process
   *
   * Confirms the sale within a serialisable DB transaction:
   *  1. Re-validates the token (pessimistic lock — double-spend prevention).
   *  2. Checks employee margin ≥ installment amount.
   *  3. Applies 12/88 split (APROVA fee / partner receivable).
   *  4. Deducts installment amount from employee available_margin.
   *  5. Marks token as USED and creates the Transaction record.
   *
   * Body: { tokenCode: "RXD-6YD", partnerId: "<uuid>" }
   * TODO: extract partnerId from JWT (@CurrentUser().partnerId) instead of body.
   *
   * Responses:
   *  201 → { transactionId, grossAmount, takeRateAmount, netToPartner, ... }
   *  404 → token not found
   *  409 → token already used / expired / cancelled
   *  422 → insufficient margin
   */
  @Post('transactions/process')
  @Roles(UserRole.PARTNER, UserRole.MASTER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async process(@Body() dto: ProcessTransactionDto) {
    return this.qrCodesService.processTransaction(dto.tokenCode, dto.partnerId);
  }
}
