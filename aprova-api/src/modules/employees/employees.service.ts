import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from './employees.entity';
import { type PayrollCsvRow, type ImportPayrollResult } from './dto/import-payroll.dto';

// ─── Risk-tier thresholds ─────────────────────────────────────────────────────
const DAYS_RISK_EXTREME = 90;  // Cenário A: < 90 dias → CARENCIA
const DAYS_RISK_MEDIUM  = 365; // Cenário B: 90–365 dias → ATIVO_COM_TETO

// ─── CSV column aliases (normalised lowercase, accent-stripped) ───────────────
const COL_NAME        = ['nome', 'name', 'funcionario', 'colaborador'];
const COL_CPF         = ['cpf'];
const COL_DEPT        = ['departamento', 'department', 'setor', 'area'];
const COL_SALARY      = ['salario liquido', 'salario_liquido', 'saláriolíquido', 'net salary', 'net_salary', 'salario'];
const COL_ADMISSION   = ['data de admissao', 'data_de_admissao', 'admissao', 'admission date', 'admission_date', 'dtadmissao'];

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normaliseKey(s: string): string {
  return stripAccents(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

function findColumn(headers: string[], aliases: string[]): string | undefined {
  return headers.find((h) => aliases.includes(normaliseKey(h)));
}

// ─── Date parser ─────────────────────────────────────────────────────────────

/**
 * Parse "DD/MM/AAAA" (or "DD/MM/YYYY") into a UTC midnight Date.
 * Returns null if the string is invalid.
 */
export function parseAdmissionDate(raw: string): Date | null {
  const cleaned = raw.trim();
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd), month = Number(mm), year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  return isNaN(d.getTime()) ? null : d;
}

// ─── Risk-tier algorithm ──────────────────────────────────────────────────────

export interface RiskResult {
  status: EmployeeStatus;
  available_margin: number;
  max_debt_limit: number | null;
  days_since_admission: number;
}

/**
 * Motor de crédito baseado em tempo de casa:
 *
 * Cenário A (<90 dias)  → CARENCIA       — margem R$0,00, teto R$0,00
 * Cenário B (90–365 d)  → ATIVO_COM_TETO — margem 30%, teto 1x salário
 * Cenário C (>365 dias) → ACTIVE         — margem 30%, sem teto de dívida
 */
export function applyRiskTier(admissionDate: Date, netSalary: number): RiskResult {
  const msDay   = 86_400_000;
  const daysSince = Math.floor((Date.now() - admissionDate.getTime()) / msDay);

  if (daysSince < DAYS_RISK_EXTREME) {
    return {
      status: EmployeeStatus.CARENCIA,
      available_margin: 0,
      max_debt_limit: 0,
      days_since_admission: daysSince,
    };
  }

  if (daysSince < DAYS_RISK_MEDIUM) {
    return {
      status: EmployeeStatus.ATIVO_COM_TETO,
      available_margin: +(netSalary * 0.30).toFixed(2),
      max_debt_limit: +netSalary.toFixed(2), // 1× salário
      days_since_admission: daysSince,
    };
  }

  return {
    status: EmployeeStatus.ACTIVE,
    available_margin: +(netSalary * 0.30).toFixed(2),
    max_debt_limit: null, // sem teto
    days_since_admission: daysSince,
  };
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseBRLNumber(raw: string): number | null {
  // Handles: "3.500,00" → 3500, "3500.00" → 3500, "3500" → 3500
  const stripped = raw.trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(stripped);
  return isNaN(n) ? null : n;
}

function parseCSVRows(buffer: Buffer): Array<Record<string, string>> {
  // Remove UTF-8 BOM if present
  let raw = buffer.toString('utf-8').replace(/^﻿/, '');

  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect delimiter: prefer ';' (Brazilian Excel default), fall back to ','
  const headerLine = lines[0];
  const delimiter  = headerLine.includes(';') ? ';' : ',';

  const splitLine = (line: string): string[] =>
    line.split(delimiter).map((v) => v.trim().replace(/^"(.*)"$/, '$1'));

  const headers = splitLine(headerLine);

  return lines.slice(1).map((line) => {
    const values = splitLine(line);
    return headers.reduce<Record<string, string>>((obj, h, i) => {
      obj[h] = values[i] ?? '';
      return obj;
    }, {});
  });
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  // ── CSV import ──────────────────────────────────────────────────────────────

  async importPayroll(
    fileBuffer: Buffer,
    companyId: string, // TODO: extrair do JWT do usuário autenticado
  ): Promise<ImportPayrollResult> {
    const rawRows = parseCSVRows(fileBuffer);
    if (rawRows.length === 0) {
      throw new BadRequestException('O arquivo CSV está vazio ou sem dados após o cabeçalho.');
    }

    const headers = Object.keys(rawRows[0]);

    // Locate required columns (by alias)
    const colNome      = findColumn(headers, COL_NAME);
    const colCPF       = findColumn(headers, COL_CPF);
    const colDept      = findColumn(headers, COL_DEPT);
    const colSalary    = findColumn(headers, COL_SALARY);
    const colAdmissao  = findColumn(headers, COL_ADMISSION);

    const missing: string[] = [];
    if (!colNome)     missing.push('Nome');
    if (!colCPF)      missing.push('CPF');
    if (!colSalary)   missing.push('Salario Liquido');
    if (!colAdmissao) missing.push('Data de Admissao');
    if (missing.length) {
      throw new BadRequestException(
        `Colunas obrigatórias ausentes no CSV: ${missing.join(', ')}. ` +
        `Baixe o modelo atualizado em /templates/folha-modelo.csv`,
      );
    }

    let created = 0;
    let updated = 0;
    const errors: { cpf: string; error: string }[] = [];

    for (const row of rawRows) {
      const cpf         = (row[colCPF!] ?? '').replace(/\D/g, ''); // strip punctuation
      const nome        = row[colNome!]?.trim() ?? '';
      const departamento = colDept ? (row[colDept] ?? '').trim() : '';
      const rawSalary   = row[colSalary!] ?? '';
      const rawDate     = row[colAdmissao!] ?? '';

      // ── Validate row ────────────────────────────────────────────────────────
      if (!cpf || cpf.length !== 11) {
        errors.push({ cpf: cpf || '?', error: `CPF inválido: "${row[colCPF!]}"` });
        continue;
      }

      const netSalary = parseBRLNumber(rawSalary);
      if (netSalary === null || netSalary <= 0) {
        errors.push({ cpf, error: `Salário inválido: "${rawSalary}"` });
        continue;
      }

      const admissionDate = parseAdmissionDate(rawDate);
      if (!admissionDate) {
        errors.push({ cpf, error: `Data de admissão inválida: "${rawDate}" — use DD/MM/AAAA` });
        continue;
      }

      // ── Apply risk-tier algorithm ────────────────────────────────────────────
      const risk = applyRiskTier(admissionDate, netSalary);

      // ── Upsert (simplified: look up by CPF substring in registration or future user lookup)
      // TODO: join via users.cpf when User entity has CPF field; for now we use
      //       employee.registration as CPF proxy.
      try {
        const existing = await this.repo.findOne({
          where: { company_id: companyId, registration: cpf },
        });

        if (existing) {
          // Preserve DISMISSED / ON_LEAVE status — only recalculate risk for active employees
          const shouldRecalculate = ![
            EmployeeStatus.DISMISSED,
            EmployeeStatus.ON_LEAVE,
          ].includes(existing.status as EmployeeStatus);

          await this.repo.save({
            ...existing,
            net_salary:      netSalary,
            admission_date:  admissionDate.toISOString().split('T')[0],
            ...(shouldRecalculate
              ? {
                  status:           risk.status,
                  available_margin: risk.available_margin,
                  max_debt_limit:   risk.max_debt_limit,
                }
              : {}),
          });
          updated++;
        } else {
          // Create stub employee (user_id required in prod — TODO: resolve via CPF lookup)
          this.logger.warn(
            `CPF ${cpf} (${nome}) não encontrado como colaborador existente. ` +
            `Criação automática requer user_id — pulando. TODO: implementar criação via CPF.`,
          );
          errors.push({
            cpf,
            error:
              'Colaborador não cadastrado. Adicione manualmente antes de importar via CSV.',
          });
        }
      } catch (err: any) {
        this.logger.error(`Erro ao processar CPF ${cpf}: ${err.message}`);
        errors.push({ cpf, error: err.message ?? 'Erro interno' });
      }
    }

    const message =
      `Processado: ${rawRows.length} linhas — ` +
      `${updated} atualizados · ${created} criados · ${errors.length} erros`;

    this.logger.log(message);
    return { created, updated, errors: errors.length, details: errors, message };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Recalculate all active employees' risk tiers (run via cron or on-demand). */
  async recalculateAllRiskTiers(companyId: string): Promise<number> {
    const employees = await this.repo.find({
      where: { company_id: companyId },
    });

    let recalculated = 0;
    for (const emp of employees) {
      if (!emp.admission_date) continue;
      if ([EmployeeStatus.DISMISSED, EmployeeStatus.ON_LEAVE].includes(emp.status)) continue;

      const admissionDate = new Date(emp.admission_date);
      const risk = applyRiskTier(admissionDate, Number(emp.net_salary));

      await this.repo.update(emp.id, {
        status:           risk.status,
        available_margin: risk.available_margin,
        max_debt_limit:   risk.max_debt_limit,
      });
      recalculated++;
    }
    return recalculated;
  }

  async findAll(companyId: string): Promise<Employee[]> {
    return this.repo.find({ where: { company_id: companyId } });
  }

  async findById(id: string): Promise<Employee | null> {
    return this.repo.findOne({ where: { id } });
  }
}
