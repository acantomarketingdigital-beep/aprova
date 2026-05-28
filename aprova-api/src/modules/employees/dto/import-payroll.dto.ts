/**
 * Shape of one parsed row from the payroll CSV.
 *
 * Expected CSV columns (case-insensitive, delimiter: comma or semicolon):
 *   Nome | CPF | Departamento | Salario Liquido | Data de Admissao
 *
 * Example row:
 *   João Silva;000.111.222-33;TI;3500,00;15/03/2023
 */
export interface PayrollCsvRow {
  nome: string;
  cpf: string;
  departamento: string;
  salarioLiquido: number;
  dataDeAdmissao: Date;
}

export interface ImportPayrollResult {
  created: number;
  updated: number;
  errors: number;
  details: Array<{ cpf: string; error: string }>;
  message: string;
}
