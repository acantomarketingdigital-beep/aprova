/** Response shape for GET /qr-codes/validate/:code */
export interface ValidateTokenResponse {
  valid: true;
  tokenCode: string;
  patientName: string | null;
  productName: string | null;
  /** Total gross value in BRL. */
  grossAmount: number;
  installmentsCount: number;
  /** Per-installment amount = grossAmount / installmentsCount. */
  installmentAmount: number;
  /** Employee's current available margin before this transaction. */
  marginAvailable: number;
  expiresAt: string; // ISO 8601
  employeeId: string;
}

/** Response shape for POST /transactions/process */
export interface ProcessTransactionResponse {
  transactionId: string;
  tokenCode: string;
  patientName: string | null;
  productName: string | null;
  grossAmount: number;
  /** APROVA platform fee (12% of grossAmount). */
  takeRateAmount: number;
  /** Net amount to be transferred to the partner (88% of grossAmount). */
  netToPartner: number;
  installmentsCount: number;
  installmentAmount: number;
  status: 'approved';
  processedAt: string; // ISO 8601
}
