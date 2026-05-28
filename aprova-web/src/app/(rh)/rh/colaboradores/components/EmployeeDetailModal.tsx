'use client';

import { X, ShieldOff, Shield, Pencil } from 'lucide-react';

type EmployeeStatus = 'active' | 'dismissed' | 'on_leave' | 'blocked';

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  department: string;
  netSalary: number;
  marginCap: number;
  usedMargin: number;
  availableMargin: number;
  status: EmployeeStatus;
  admissionDate: string;
}

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onBlock: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskCPF(cpf: string) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '•••.$2.•••-••');
}

const STATUS_CFG: Record<EmployeeStatus, { label: string; cls: string }> = {
  active:    { label: 'Ativo',     cls: 'text-green-400 bg-green-400/10 border-green-400/20'   },
  dismissed: { label: 'Desligado', cls: 'text-[#666] bg-[#1A1A1A] border-[#2A2A2A]'            },
  on_leave:  { label: 'Afastado',  cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  blocked:   { label: 'Bloqueado', cls: 'text-red-400 bg-red-400/10 border-red-400/20'           },
};

// Mock de histórico recente — TODO: GET /api/v1/employees/:id/contracts
const MOCK_HISTORY = [
  { id: 'h1', description: 'Contrato Plano de Saúde Plus assinado', date: '12/05/2026', amount: 1200 },
  { id: 'h2', description: 'Margem ajustada manualmente pelo RH',  date: '03/04/2026', amount: null },
  { id: 'h3', description: 'Importação de folha — abr/2026',       date: '01/04/2026', amount: null },
];

export default function EmployeeDetailModal({
  employee: emp,
  onClose,
  onBlock,
  onEdit,
}: EmployeeDetailModalProps) {
  const st = STATUS_CFG[emp.status];
  const marginPct = emp.marginCap > 0 ? (emp.usedMargin / emp.marginCap) * 100 : 0;
  const barColor = marginPct < 50 ? '#22c55e' : marginPct < 80 ? '#FFD700' : '#ef4444';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer — right panel on desktop, full screen on mobile */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-[#111] border-l border-[#1A1A1A] sm:w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4 flex-shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Detalhe do Colaborador</p>
            <h2 className="mt-0.5 text-lg font-black text-white">{emp.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A2A] text-[#555] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 flex flex-col gap-6">

          {/* Identificação */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Identificação</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'CPF', value: maskCPF(emp.cpf) },
                { label: 'Departamento', value: emp.department },
                { label: 'Admissão', value: emp.admissionDate },
                { label: 'Status', value: (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                    {st.label}
                  </span>
                )},
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#444]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{value as any}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Margem */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Consignado</p>
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0F0F0F] p-4">
              <div className="grid grid-cols-3 divide-x divide-[#1A1A1A] mb-4">
                <div className="pr-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Salário Líquido</p>
                  <p className="mt-1 text-base font-black text-white">{formatBRL(emp.netSalary)}</p>
                </div>
                <div className="px-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Margem Total</p>
                  <p className="mt-1 text-base font-black text-white">{formatBRL(emp.marginCap)}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#444]">Disponível</p>
                  <p className="mt-1 text-base font-black text-[#FFD700]">{formatBRL(emp.availableMargin)}</p>
                </div>
              </div>
              {/* Barra de uso */}
              <div>
                <div className="mb-1.5 flex justify-between text-[10px] text-[#555]">
                  <span>Uso da margem</span>
                  <span className="font-black" style={{ color: barColor }}>{marginPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(marginPct, 100)}%`, backgroundColor: barColor }} />
                </div>
                <p className="mt-1.5 text-[10px] text-[#444]">
                  {formatBRL(emp.usedMargin)} utilizados · A margem é calculada com base no salário líquido informado na folha.
                </p>
              </div>
            </div>
          </section>

          {/* Contratos ativos — TODO: GET /api/v1/employees/:id/contracts?status=active */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Contratos Ativos</p>
            <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#888]">Contratos em andamento</span>
              <span className="text-2xl font-black text-[#FFD700]">2</span>
            </div>
          </section>

          {/* Histórico recente */}
          <section>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Histórico Recente</p>
            <div className="rounded-2xl border border-[#1A1A1A] bg-[#0F0F0F] overflow-hidden">
              {MOCK_HISTORY.map((h, i) => (
                <div key={h.id} className={`flex items-start gap-3 px-4 py-3 ${i < MOCK_HISTORY.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#333] flex-shrink-0 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#CCC] leading-snug">{h.description}</p>
                    <p className="text-[10px] text-[#444] mt-0.5">{h.date}</p>
                  </div>
                  {h.amount && (
                    <span className="flex-shrink-0 text-sm font-black text-[#FFD700]">{formatBRL(h.amount)}</span>
                  )}
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
            {emp.status === 'blocked' ? 'Desbloquear benefício' : 'Bloquear benefício'}
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
