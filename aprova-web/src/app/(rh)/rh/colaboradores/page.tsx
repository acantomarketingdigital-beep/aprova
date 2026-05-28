'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { UserPlus, Upload, Eye, Lock, Unlock, Pencil, MoreVertical, AlertTriangle } from 'lucide-react';
import RhNav from '../components/RhNav';
import ImportModal from './components/ImportModal';
import EmployeeDetailModal, { type Employee, type EmployeeStatus } from './components/EmployeeDetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = 'name' | 'netSalary' | 'availableMargin' | 'status' | 'admissionDate';
type SortDir   = 'asc' | 'desc';

// ─── Risk-tier calculation (mirrors backend applyRiskTier) ────────────────────

function daysSince(ddmmyyyy: string): number {
  const [dd, mm, yyyy] = ddmmyyyy.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function toDisplayDate(ddmmyyyy: string): string {
  return ddmmyyyy; // already DD/MM/YYYY
}

function applyRiskTier(admissionDateRaw: string, netSalary: number): {
  status: EmployeeStatus;
  marginCap: number;
  availableMargin: number;
  maxDebtLimit: number | null;
  riskTier: 'A' | 'B' | 'C';
  daysSinceAdmission: number;
} {
  const days = daysSince(admissionDateRaw);
  if (days < 90) {
    return { status: 'carencia', marginCap: 0, availableMargin: 0, maxDebtLimit: 0, riskTier: 'A', daysSinceAdmission: days };
  }
  if (days < 365) {
    const cap = Math.round(netSalary * 0.30);
    return { status: 'ativo_com_teto', marginCap: cap, availableMargin: cap, maxDebtLimit: netSalary, riskTier: 'B', daysSinceAdmission: days };
  }
  const cap = Math.round(netSalary * 0.30);
  return { status: 'active', marginCap: cap, availableMargin: cap, maxDebtLimit: null, riskTier: 'C', daysSinceAdmission: days };
}

// ─── Mock data (TODO: GET /api/v1/rh/employees) ───────────────────────────────

function daysAgoToDdMmYyyy(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getFullYear()),
  ].join('/');
}

function makeMockEmployee(i: number): Employee {
  const salary = 2000 + (i * 317.7) % 8000;
  const names  = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Lima', 'Fernanda Rocha', 'Lucas Mendes', 'Isabela Ferreira', 'Rafael Sousa', 'Camila Nunes'];
  const depts  = ['TI', 'Financeiro', 'Comercial', 'RH', 'Operações', 'Jurídico'];

  // Cenário A — < 90 dias (employees 0, 1): simula admissão recente
  const admissionDaysAgo =
    i < 2  ? 30 + i * 15 :           // 30d / 45d → CARENCIA
    i < 5  ? 120 + i * 40 :          // 120–280d  → ATIVO_COM_TETO
    i < 8  ? 400 + i * 50 :          // 400–750d  → ACTIVE (outros)
             (2018 + (i % 4)) > 2023
               ? 1200                  // histórico fixo para os demais
               : (2023 - (2018 + (i % 4))) * 365 + (i % 12) * 30;

  const admissionDateRaw = daysAgoToDdMmYyyy(Math.min(admissionDaysAgo, 3000));
  const risk = applyRiskTier(admissionDateRaw, Math.round(salary));

  // For dismissed / on_leave, override status but keep risk data
  const overrideStatus: EmployeeStatus | null =
    i === 12 ? 'dismissed' :
    i === 15 ? 'on_leave'  :
    i === 18 ? 'blocked'   :
    null;

  const usedMargin = overrideStatus === 'dismissed' || risk.status === 'carencia'
    ? 0
    : Math.round((i * 211.3) % (risk.marginCap * 0.9));

  return {
    id: `emp-${i}`,
    name: names[i % names.length],
    cpf: `${String((i * 37) % 999).padStart(3, '0')}.${String((i * 53) % 999).padStart(3, '0')}.${String((i * 71) % 999).padStart(3, '0')}-${String((i * 11) % 99).padStart(2, '0')}`,
    department: depts[i % depts.length],
    netSalary:     Math.round(salary),
    marginCap:     risk.marginCap,
    usedMargin,
    availableMargin: Math.max(0, risk.marginCap - usedMargin),
    maxDebtLimit:  risk.maxDebtLimit,
    status:        overrideStatus ?? risk.status,
    admissionDate: toDisplayDate(admissionDateRaw),
    admissionDateRaw,
    riskTier:      risk.riskTier,
    daysSinceAdmission: risk.daysSinceAdmission,
  };
}

const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 24 }, (_, i) => makeMockEmployee(i));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function maskCPF(cpf: string) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '•••.$2.•••-••');
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<EmployeeStatus, { label: string; cls: string; dot: string; rowCls: string }> = {
  active:        { label: 'Ativo',           cls: 'text-green-400   bg-green-400/10   border-green-400/20',   dot: 'bg-green-400',   rowCls: ''                         },
  ativo_com_teto:{ label: 'Ativo com Teto',  cls: 'text-amber-300   bg-amber-400/10   border-amber-400/20',   dot: 'bg-amber-400',   rowCls: 'bg-amber-950/[0.08]'      },
  carencia:      { label: 'Em Experiência',   cls: 'text-rose-300    bg-rose-900/40    border-rose-700/40',    dot: 'bg-rose-500',    rowCls: 'bg-rose-950/[0.18]'       },
  blocked:       { label: 'Bloqueado',        cls: 'text-red-400    bg-red-400/10     border-red-400/20',     dot: 'bg-red-400',     rowCls: ''                         },
  dismissed:     { label: 'Desligado',        cls: 'text-[#666]     bg-[#1A1A1A]      border-[#2A2A2A]',      dot: 'bg-[#444]',      rowCls: ''                         },
  on_leave:      { label: 'Afastado',         cls: 'text-orange-400 bg-orange-400/10  border-orange-400/20',  dot: 'bg-orange-400',  rowCls: ''                         },
};

// ─── RowActions dropdown ──────────────────────────────────────────────────────

function RowActions({ emp, onDetail, onEdit, onToggleBlock }: {
  emp: Employee; onDetail: () => void; onEdit: () => void; onToggleBlock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isBlocked = emp.status === 'blocked';

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#555] hover:border-[#2A2A2A] hover:bg-[#1A1A1A] hover:text-white transition-all">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-[#2A2A2A] bg-[#161616] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
            {[
              { icon: Eye,    label: 'Ver detalhes', fn: () => { onDetail();       setOpen(false); } },
              { icon: Pencil, label: 'Editar dados',  fn: () => { onEdit();         setOpen(false); } },
              { icon: isBlocked ? Unlock : Lock, label: isBlocked ? 'Desbloquear' : 'Bloquear benefício', fn: () => { onToggleBlock(); setOpen(false); } },
            ].map(({ icon: Icon, label, fn }) => (
              <button key={label} onClick={fn}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#888] hover:bg-[#1A1A1A] hover:text-white transition-colors">
                <Icon size={14} strokeWidth={2} /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function EmployeeRow({ emp, onDetail, onEdit, onToggleBlock }: {
  emp: Employee;
  onDetail: (e: Employee) => void;
  onEdit:   (e: Employee) => void;
  onToggleBlock: (e: Employee) => void;
}) {
  const st = STATUS_CFG[emp.status];
  const marginPct = emp.marginCap > 0 ? (emp.usedMargin / emp.marginCap) * 100 : 0;
  const barColor  = marginPct < 50 ? '#22c55e' : marginPct < 80 ? '#FFD700' : '#ef4444';
  const isCarencia = emp.status === 'carencia';

  return (
    <tr className={`group border-b border-[#141414] hover:bg-[#0F0F0F] transition-colors ${st.rowCls}`}>
      {/* Colaborador */}
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-2">
          {isCarencia && (
            <AlertTriangle size={13} className="flex-shrink-0 text-rose-400" strokeWidth={2.5}
              aria-label="Em período de experiência — margem bloqueada" />
          )}
          <div>
            <p className="text-white font-bold text-sm">{emp.name}</p>
            <p className="text-[#444] text-xs mt-0.5">{emp.department}</p>
          </div>
        </div>
      </td>

      {/* CPF */}
      <td className="py-3.5 px-4 text-[#555] text-sm font-mono hidden sm:table-cell">{maskCPF(emp.cpf)}</td>

      {/* Admissão */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <p className="text-[#888] text-xs font-semibold">{emp.admissionDate}</p>
        <p className="text-[#444] text-[10px] mt-0.5">{emp.daysSinceAdmission}d de casa</p>
      </td>

      {/* Salário */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <p className="text-white font-bold text-sm">{formatBRL(emp.netSalary)}</p>
      </td>

      {/* Margem / Uso */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        {isCarencia ? (
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-700/40 bg-rose-900/30 px-2 py-0.5 text-[10px] font-black text-rose-300">
              🔒 Margem Bloqueada
            </span>
            <p className="text-[10px] text-rose-400/70 mt-1 font-semibold">R$ 0,00 disponível</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-20 h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                <div className="h-full rounded-full" style={{ width: `${Math.min(marginPct, 100)}%`, backgroundColor: barColor }} />
              </div>
              <span className="text-xs font-bold" style={{ color: barColor }}>{marginPct.toFixed(0)}%</span>
            </div>
            <p className="text-[#FFD700] font-black text-xs">{formatBRL(emp.availableMargin)} disp.</p>
            {emp.maxDebtLimit !== null && (
              <p className="text-amber-400/70 text-[10px] mt-0.5">
                Teto: {formatBRL(emp.maxDebtLimit)}
              </p>
            )}
          </div>
        )}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${st.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
            {st.label}
          </span>
          {emp.riskTier && (
            <span className="text-[10px] font-bold text-[#444]">
              Cenário {emp.riskTier}
            </span>
          )}
        </div>
      </td>

      {/* Ações */}
      <td className="py-3.5 pr-4 pl-2">
        <RowActions emp={emp} onDetail={() => onDetail(emp)} onEdit={() => onEdit(emp)} onToggleBlock={() => onToggleBlock(emp)} />
      </td>
    </tr>
  );
}

function SortTh({ label, field, current, dir, onSort }: {
  label: string; field: SortField | null; current: SortField; dir: SortDir; onSort: (f: SortField) => void;
}) {
  const active = field && current === field;
  return (
    <th onClick={() => field && onSort(field)}
      className={`py-3 px-4 text-left text-[10px] tracking-[0.15em] font-black uppercase whitespace-nowrap select-none ${
        field ? 'cursor-pointer hover:text-[#888] transition-colors' : ''
      } ${active ? 'text-[#FFD700]' : 'text-[#444]'}`}>
      {label}
      {field && <span className="ml-1">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>}
    </th>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type StatusFilter = EmployeeStatus | 'all' | 'carencia_only';

export default function ColaboradoresPage() {
  const [employees, setEmployees]       = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField]       = useState<SortField>('name');
  const [sortDir, setSortDir]           = useState<SortDir>('asc');
  const [showImport, setShowImport]     = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }, [sortField]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = employees.filter((e) => {
      const matchSearch = !q
        || e.name.toLowerCase().includes(q)
        || e.cpf.includes(q)
        || e.department.toLowerCase().includes(q)
        || STATUS_CFG[e.status].label.toLowerCase().includes(q)
        || e.admissionDate.includes(q);
      const matchStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'carencia_only' ? e.status === 'carencia' :
        e.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return [...result].sort((a, b) => {
      let cmp = 0;
      if      (sortField === 'name')           cmp = a.name.localeCompare(b.name);
      else if (sortField === 'netSalary')       cmp = a.netSalary - b.netSalary;
      else if (sortField === 'availableMargin') cmp = a.availableMargin - b.availableMargin;
      else if (sortField === 'status')          cmp = a.status.localeCompare(b.status);
      else if (sortField === 'admissionDate')   cmp = a.daysSinceAdmission - b.daysSinceAdmission;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [employees, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleBlock = useCallback((emp: Employee) => {
    const next: EmployeeStatus = emp.status === 'blocked' ? 'active' : 'blocked';
    setEmployees((prev) => prev.map((e) => e.id === emp.id ? { ...e, status: next } : e));
    setDetailEmployee((prev) => prev?.id === emp.id ? { ...prev, status: next } : prev);
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const carencia    = employees.filter((e) => e.status === 'carencia').length;
    const comTeto     = employees.filter((e) => e.status === 'ativo_com_teto').length;
    const ativos      = employees.filter((e) => e.status === 'active');
    const bloqueados  = employees.filter((e) => e.status === 'blocked').length;
    const desligados  = employees.filter((e) => e.status === 'dismissed').length;
    const avgMargin   = ativos.length > 0
      ? ativos.reduce((s, e) => s + e.availableMargin, 0) / ativos.length : 0;
    return { total: employees.length, ativos: ativos.length, comTeto, carencia, bloqueados, desligados, avgMargin };
  }, [employees]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <RhNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-black">Gestão de Colaboradores</h1>
            <p className="text-[#555] text-sm mt-1">
              <span className="text-[#FFD700] font-bold">{stats.ativos + stats.comTeto}</span> ativos ·{' '}
              {stats.total} total na empresa
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all">
              <UserPlus size={15} strokeWidth={2.5} /> Adicionar Manual
            </button>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_16px_rgba(255,215,0,0.2)]">
              <Upload size={15} strokeWidth={2.5} /> Importar Folha
            </button>
          </div>
        </div>

        {/* Carencia alert banner */}
        {stats.carencia > 0 && (
          <div className="flex items-start gap-4 rounded-2xl border border-rose-800/40 bg-rose-950/25 px-5 py-4">
            <AlertTriangle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <p className="text-sm font-black text-rose-300">
                {stats.carencia} {stats.carencia === 1 ? 'colaborador em' : 'colaboradores em'} período de experiência — Margem Bloqueada (Cenário A)
              </p>
              <p className="text-xs text-[#666] mt-0.5">
                Estes colaboradores têm menos de 90 dias de casa. O motor de risco bloqueou a margem automaticamente para proteger contra inadimplência por demissão sem cobertura de rescisão.
              </p>
              <button onClick={() => setStatusFilter('carencia_only')} className="mt-2 text-xs font-black text-rose-400 hover:underline">
                Filtrar colaboradores em experiência →
              </button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',          value: stats.total.toString(),      color: 'text-white'       },
            { label: 'Ativos (C)',      value: stats.ativos.toString(),     color: 'text-green-400'   },
            { label: 'Com Teto (B)',    value: stats.comTeto.toString(),    color: 'text-amber-300'   },
            { label: 'Em Exp. (A)',     value: stats.carencia.toString(),   color: 'text-rose-300'    },
            { label: 'Bloqueados',      value: stats.bloqueados.toString(), color: 'text-red-400'     },
            { label: 'Margem média',    value: formatBRL(stats.avgMargin),  color: 'text-[#FFD700]'   },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-[#1A1A1A] bg-[#111] px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">{s.label}</p>
              <p className={`mt-2 text-xl font-black leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-base">🔍</span>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome, CPF, departamento, status ou data de admissão…"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#111] pl-11 pr-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'all',            label: 'Todos'          },
              { key: 'carencia_only',  label: '🔒 Em Exp. (A)' },
              { key: 'ativo_com_teto', label: 'Teto (B)'       },
              { key: 'active',         label: 'Ativos (C)'     },
              { key: 'blocked',        label: 'Bloqueados'     },
              { key: 'dismissed',      label: 'Desligados'     },
            ] as const).map((f) => (
              <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${
                  statusFilter === f.key
                    ? 'bg-[#FFD700] text-[#0A0A0A] border-[#FFD700]'
                    : 'bg-[#111] text-[#555] border-[#1A1A1A] hover:border-[#333] hover:text-white'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  <SortTh label="Colaborador"       field="name"            current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="CPF"               field={null}            current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Admissão"          field="admissionDate"   current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Salário Líquido"   field="netSalary"       current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Margem / Teto"     field="availableMargin" current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Status / Cenário"  field="status"          current={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#444]">
                      <p className="text-4xl mb-3">🔍</p>
                      <p className="font-bold text-white">Nenhum colaborador encontrado</p>
                      <p className="text-xs mt-1">Tente ajustar os filtros</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((emp) => (
                    <EmployeeRow key={emp.id} emp={emp}
                      onDetail={setDetailEmployee}
                      onEdit={() => {}} // TODO: abrir modal de edição
                      onToggleBlock={handleToggleBlock}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[#555] text-sm">
                Mostrando <span className="text-white font-bold">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>{' '}
                de <span className="text-white font-bold">{filtered.length}</span> colaboradores
              </p>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A1A1A] text-[#555] text-xs hover:border-[#333] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`d${i}`} className="px-2 text-[#444] text-xs">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          page === p ? 'bg-[#FFD700] text-[#0A0A0A]' : 'border border-[#1A1A1A] text-[#555] hover:border-[#333] hover:text-white'
                        }`}>
                        {p}
                      </button>
                    ),
                  )}
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A1A1A] text-[#555] text-xs hover:border-[#333] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="rounded-xl border border-[#1A1A1A] bg-[#111] px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#555] mb-2">Motor de Risco APROVA — Regras de Margem</p>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="flex gap-2">
              <span className="flex-shrink-0 text-rose-400 font-black">A</span>
              <span className="text-[#555]"><span className="text-rose-300 font-bold">{'<'} 90 dias</span> · Margem R$0,00 · Em Experiência (demissão sem cobertura de rescisão)</span>
            </div>
            <div className="flex gap-2">
              <span className="flex-shrink-0 text-amber-400 font-black">B</span>
              <span className="text-[#555]"><span className="text-amber-300 font-bold">90–365 dias</span> · Margem 30%, Teto 1× salário</span>
            </div>
            <div className="flex gap-2">
              <span className="flex-shrink-0 text-green-400 font-black">C</span>
              <span className="text-[#555]"><span className="text-green-400 font-bold">{'>'} 365 dias</span> · Margem 30%, Sem teto de dívida</span>
            </div>
          </div>
        </div>

      </main>

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onSuccess={() => setShowImport(false)} />
      )}
      {detailEmployee && (
        <EmployeeDetailModal employee={detailEmployee} onClose={() => setDetailEmployee(null)}
          onBlock={handleToggleBlock} onEdit={() => {}} />
      )}
    </div>
  );
}
