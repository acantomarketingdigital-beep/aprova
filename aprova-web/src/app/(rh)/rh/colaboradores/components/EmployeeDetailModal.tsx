'use client';

import { X, ShieldOff, Shield, Pencil, AlertTriangle, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Status enriquecido com os 3 cenários do motor de risco APROVA:
 *
 * carencia       — Cenário A (<90 dias): margem bloqueada, risco de inadimplência
 * ativo_com_teto — Cenário B (90–365 d): margem 30%, teto de dívida = 1x salário
 * active         — Cenário C (>365 dias): margem 30%, sem teto de dívida
 * blocked        — Bloqueio manual pelo RH
 * dismissed      — Desligado (histórico para auditoria)
 * on_leave       — Afastado
 */
export type EmployeeStatus =
  | 'active'
  | 'ativo_com_teto'
  | 'carencia'
  | 'blocked'
  | 'dismissed'
  | 'on_leave';

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  department: string;
  netSalary: number;
  marginCap: number;
  usedMargin: number;
  availableMargin: number;
  maxDebtLimit: number | null;   // null = sem teto; 0 = bloqueado; >0 = teto em R$
  status: EmployeeStatus;
  admissionDate: string;         // Formatted for display (e.g., "15/03/2023")
  admissionDateRaw: string;      // DD/MM/YYYY for risk calculation
  riskTier: 'A' | 'B' | 'C' | null;
  daysSinceAdmission: number;
}

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onBlock: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskCPF(cpf: string) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '•••.$2.•••-••');
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<EmployeeStatus, { label: string; cls: string }> = {
  active:        { label: 'Ativo',                cls: 'text-green-400   bg-green-400/10   border-green-400/20'   },
  ativo_com_teto:{ label: 'Ativo com Teto',       cls: 'text-amber-300   bg-amber-400/10   border-amber-400/20'   },
  carencia:      { label: 'Em Experiência',        cls: 'text-rose-300    bg-rose-900/40    border-rose-700/40'    },
  blocked:       { label: 'Bloqueado',             cls: 'text-red-400    bg-red-400/10     border-red-400/20'     },
  dismissed:     { label: 'Desligado',             cls: 'text-[#666]     bg-[#1A1A1A]      border-[#2A2A2A]'      },
  on_leave:      { label: 'Afastado',              cls: 'text-orange-400 bg-orange-400/10  border-orange-400/20'  },
};

// ─── Risk tier explanation ────────────────────────────────────────────────────

const RISK_EXPLANATION: Record<'A' | 'B' | 'C', { title: string; desc: string; color: string; bg: string; border: string }> = {
  A: {
    title: 'Cenário A — Risco Extremo (< 90 dias)',
    desc:  'Margem bloqueada automaticamente. Em caso de demissão no período de experiência, a rescisão não cobre a dívida consignada.',
    color: 'text-rose-300',
    bg:    'bg-rose-950/40',
    border:'border-rose-800/40',
  },
  B: {
    title: 'Cenário B — Risco Médio (3–12 meses)',
    desc:  'Margem disponível em 30% do salário líquido. Teto de dívida total limitado a 1× o salário líquido para reduzir exposição ao crédito.',
    color: 'text-amber-300',
    bg:    'bg-amber-950/30',
    border:'border-amber-700/30',
  },
  C: {
    title: 'Cenário C — Risco Baixo (> 12 meses)',
    desc:  'Colaborador elegível para uso pleno da margem. Sem teto de dívida — pode parcelar em até 12x dentro do limite de 30% do salário.',
    color: 'text-emerald-400',
    bg:    'bg-emerald-950/25',
    border:'border-emerald-700/25',
  },
};

// Mock histórico — TODO: GET /api/v1/employees/:id/contracts
const MOCK_HISTORY = [
  { id: 'h1', description: 'Contrato Plano de Saúde Plus assinado', date: '12/05/2026', amount: 1200 },
  { id: 'h2', description: 'Margem recalculada — importação de folha mai/2026', date: '01/05/2026', amount: null },
  { id: 'h3', description: 'Motor de risco — tier recalculado automaticamente', date: '01/04/2026', amount: null },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeDetailModal({
  employee: emp,
  onClose,
  onBlock,
  onEdit,
}: EmployeeDetailModalProps) {
  const st = STATUS_CFG[emp.status];
  const marginPct = emp.marginCap > 0 ? (emp.usedMargin / emp.marginCap) * 100 : 0;
  const barColor = marginPct < 50 ? '#22c55e' : marginPct < 80 ? '#FFD700' : '#ef4444';
  const riskInfo = emp.riskTier ? RISK_EXPLANATION[emp.riskTier] : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-[#111] border-l border-[#1A1A1A] sm:w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4 flex-shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Detalhe do Colaborador</p>
            <h2 className="mt-0.5 text-lg font-black text-white">{emp.name}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A2A] text-[#555] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 flex flex-col gap-5">

          {/* ── Risk tier alert ── */}
          {riskInfo && (
            <div className={`rounded-2xl border p-4 ${riskInfo.bg} ${riskInfo.border}`}>
              <div className={`flex items-start gap-2.5 mb-2 ${riskInfo.color}`}>
                {emp.riskTier === 'A' ? <AlertTriangle size={15} strokeWidth={2.5} /> : <Info size={15} strokeWidth={2.5} />}
                <p className="text-sm font-black">{riskInfo.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-[#888]">{riskInfo.desc}</p>
              <p className="mt-2 text-[10px] font-bold text-[#555]">
                {emp.daysSinceAdmission} dias de casa · Admissão: {emp.admissionDate}
              </p>
            </div>
          )}

          {/* ── Identificação ── */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Identificação</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'CPF',         value: maskCPF(emp.cpf)    },
                { label: 'Departamento',value: emp.department       },
                { label: 'Admissão',    value: emp.admissionDate    },
                { label: 'Status', value: (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                    {st.label}
                  </span>
                )},
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#444]">{label}</p>
                  <div className="mt-1 text-sm font-semibold text-white">{value as any}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Margem e limites ── */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Consignado</p>
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0F0F0F] p-4">
              <div className="grid grid-cols-3 divide-x divide-[#1A1A1A] mb-4">
                <div className="pr-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Salário Líquido</p>
                  <p className="mt-1 text-base font-black text-white">{formatBRL(emp.netSalary)}</p>
                </div>
                <div className="px-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Margem (30%)</p>
                  <p className="mt-1 text-base font-black text-white">{formatBRL(emp.marginCap)}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Disponível</p>
                  <p className={`mt-1 text-base font-black ${emp.availableMargin === 0 ? 'text-red-400' : 'text-[#FFD700]'}`}>
                    {formatBRL(emp.availableMargin)}
                  </p>
                </div>
              </div>

              {/* Debt limit row */}
              <div className="mb-3 rounded-xl border border-[#1A1A1A] bg-[#161616] px-3 py-2.5 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Teto de dívida total</p>
                <p className={`text-sm font-black ${
                  emp.maxDebtLimit === null ? 'text-emerald-400' :
                  emp.maxDebtLimit === 0    ? 'text-red-400'     :
                                              'text-amber-300'
                }`}>
                  {emp.maxDebtLimit === null ? 'Sem teto (Cenário C)' :
                   emp.maxDebtLimit === 0    ? 'Bloqueado (Cenário A)' :
                   formatBRL(emp.maxDebtLimit) + ' (Cenário B)'}
                </p>
              </div>

              {/* Progress bar */}
              {emp.status !== 'carencia' && emp.marginCap > 0 && (
                <div>
                  <div className="mb-1.5 flex justify-between text-[10px] text-[#555]">
                    <span>Uso da margem</span>
                    <span className="font-black" style={{ color: barColor }}>{marginPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(marginPct, 100)}%`, backgroundColor: barColor }} />
                  </div>
                  <p className="mt-1.5 text-[10px] text-[#444]">
                    {formatBRL(emp.usedMargin)} utilizados
                  </p>
                </div>
              )}

              {emp.status === 'carencia' && (
                <div className="mt-2 rounded-xl border border-rose-800/30 bg-rose-950/30 px-3 py-2.5">
                  <p className="text-xs font-bold text-rose-300">
                    🔒 Margem bloqueada automaticamente pelo motor de risco.
                  </p>
                  <p className="text-[10px] text-[#666] mt-0.5">
                    A compra será desbloqueada após {90 - emp.daysSinceAdmission} dias (quando completar 90 dias de casa).
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Contratos ativos ── */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Contratos Ativos</p>
            <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#888]">Contratos em andamento</span>
              <span className="text-2xl font-black text-[#FFD700]">
                {emp.status === 'carencia' ? '0' : '2'}
              </span>
            </div>
          </section>

          {/* ── Histórico recente ── */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Histórico Recente</p>
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0F0F0F] overflow-hidden">
              {MOCK_HISTORY.map((h, i) => (
                <div key={h.id} className={`flex items-start gap-3 px-4 py-3 ${i < MOCK_HISTORY.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#333] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#CCC] leading-snug">{h.description}</p>
                    <p className="text-[10px] text-[#444] mt-0.5">{h.date}</p>
                  </div>
                  {h.amount && <span className="flex-shrink-0 text-sm font-black text-[#FFD700]">{formatBRL(h.amount)}</span>}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer actions */}
        <div className="border-t border-[#1A1A1A] px-6 py-4 flex gap-3 flex-shrink-0">
          <button
            onClick={() => onBlock(emp)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${
              emp.status === 'blocked'
                ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {emp.status === 'blocked' ? <Shield size={15} /> : <ShieldOff size={15} />}
            {emp.status === 'blocked' ? 'Desbloquear' : 'Bloquear benefício'}
          </button>
          <button
            onClick={() => onEdit(emp)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] py-3 text-sm font-bold text-white transition-all hover:bg-[#252525]"
          >
            <Pencil size={15} />
            Editar dados
          </button>
        </div>
      </div>
    </>
  );
}
