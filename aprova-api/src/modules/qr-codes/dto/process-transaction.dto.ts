import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class ProcessTransactionDto {
  /** Alphanumeric token code in XXX-XXX format (e.g. "RXD-6YD"). */
  @IsString()
  @Length(7, 7)
  @Matches(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/, {
    message: 'tokenCode must be in XXX-XXX format (uppercase alphanumeric).',
  })
  tokenCode: string;

  /**
   * UUID of the authenticated partner executing the sale.
   * TODO: replace with extraction from JWT (@CurrentUser().partnerId).
   */
  @IsUUID()
  partnerId: string;
}
