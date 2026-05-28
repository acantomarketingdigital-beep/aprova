'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { UserPlus, Upload, Eye, Lock, Unlock, Pencil, MoreVertical } from 'lucide-react';
import RhNav from '../components/RhNav';
import ImportModal from './components/ImportModal';
import EmployeeDetailModal, { type Employee } from './components/EmployeeDetailModal';

// ─── Types & mock ─────────────────────────────────────────────────────────────

type EmployeeStatus = 'active' | 'dismissed' | 'on_leave' | 'blocked';
type SortField = 'name' | 'netSalary' | 'availableMargin' | 'status';
type SortDir = 'asc' | 'desc';

function makeMockEmployee(i: number): Employee {
  const salary = 2000 + (i * 317.7) % 8000;
  const cap = salary * 0.3;
  const used = (i * 211.3) % cap * 0.9;
  const statuses: EmployeeStatus[] = ['active', 'active', 'active', 'dismissed', 'on_leave', 'blocked'];
  const names = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Lima', 'Fernanda Rocha', 'Lucas Mendes', 'Isabela Ferreira', 'Rafael Sousa', 'Camila Nunes'];
  const depts = ['TI', 'Financeiro', 'Comercial', 'RH', 'Operações', 'Jurídico'];
  return {
    id: `emp-${i}`,
    name: names[i % names.length],
    cpf: `${String((i * 37) % 999).padStart(3, '0')}.${String((i * 53) % 999).padStart(3, '0')}.${String((i * 71) % 999).padStart(3, '0')}-${String((i * 11) % 99).padStart(2, '0')}`,
    department: depts[i % depts.length],
    netSalary: Math.round(salary),
    marginCap: Math.round(cap),
    usedMargin: Math.round(used),
    availableMargin: Math.round(cap - used),
    status: statuses[i % statuses.length],
    admissionDate: new Date(2018 + (i % 6), i % 12, 1).toLocaleDateString('pt-BR'),
  };
}

// TODO: substituir por GET /api/v1/rh/employees
const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 24 }, (_, i) => makeMockEmployee(i));

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskCPF(cpf: string) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '•••.$2.•••-••');
}

const STATUS_CFG: Record<EmployeeStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: 'Ativo',     cls: 'text-green-400  bg-green-400/10  border-green-400/20',   dot: 'bg-green-400'  },
  dismissed: { label: 'Desligado', cls: 'text-[#666]     bg-[#1A1A1A]     border-[#2A2A2A]',       dot: 'bg-[#444]'     },
  on_leave:  { label: 'Afastado',  cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20',  dot: 'bg-orange-400' },
  blocked:   { label: 'Bloqueado', cls: 'text-red-400    bg-red-400/10    border-red-400/20',      dot: 'bg-red-400'    },
};

// ─── RowActions with dropdown ─────────────────────────────────────────────────

function RowActions({
  emp,
  onDetail,
  onEdit,
  onToggleBlock,
}: {
  emp: Employee;
  onDetail: () => void;
  onEdit: () => void;
  onToggleBlock: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#555] hover:border-[#2A2A2A] hover:bg-[#1A1A1A] hover:text-white transition-all"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-[#2A2A2A] bg-[#161616] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
            {[
              { icon: Eye,    label: 'Ver detalhes', fn: () => { onDetail(); setOpen(false); } },
              { icon: Pencil, label: 'Editar dados',  fn: () => { onEdit();   setOpen(false); } },
              {
                icon: emp.status === 'blocked' ? Unlock : Lock,
                label: emp.status === 'blocked' ? 'Desbloquear' : 'Bloquear benefício',
                fn: () => { onToggleBlock(); setOpen(false); },
              },
            ].map(({ icon: Icon, label, fn }) => (
              <button
                key={label}
                onClick={fn}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#888] hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function EmployeeRow({
  emp,
  onDetail,
  onEdit,
  onToggleBlock,
}: {
  emp: Employee;
  onDetail: (e: Employee) => void;
  onEdit: (e: Employee) => void;
  onToggleBlock: (e: Employee) => void;
}) {
  const st = STATUS_CFG[emp.status];
  const marginPct = emp.marginCap > 0 ? (emp.usedMargin / emp.marginCap) * 100 : 0;
  const barColor = marginPct < 50 ? '#22c55e' : marginPct < 80 ? '#FFD700' : '#ef4444';

  return (
    <tr className="group border-b border-[#141414] hover:bg-[#0F0F0F] transition-colors">
      {/* Colaborador */}
      <td className="py-3.5 pl-6 pr-4">
        <p className="text-white font-bold text-sm">{emp.name}</p>
        <p className="text-[#444] text-xs mt-0.5">{emp.department} · desde {emp.admissionDate}</p>
      </td>

      {/* CPF */}
      <td className="py-3.5 px-4 text-[#555] text-sm font-mono hidden sm:table-cell">{maskCPF(emp.cpf)}</td>

      {/* Salário */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <p className="text-white font-bold text-sm">{formatBRL(emp.netSalary)}</p>
      </td>

      {/* Margem total */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <p className="text-[#888] font-semibold text-sm">{formatBRL(emp.marginCap)}</p>
      </td>

      {/* Uso */}
      <td className="py-3.5 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden flex-shrink-0">
            <div className="h-full rounded-full" style={{ width: `${Math.min(marginPct, 100)}%`, backgroundColor: barColor }} />
          </div>
          <span className="text-xs font-bold" style={{ color: barColor }}>{marginPct.toFixed(0)}%</span>
        </div>
        <p className="text-[#FFD700] font-black text-xs mt-1">{formatBRL(emp.availableMargin)} disp.</p>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
          {st.label}
        </span>
      </td>

      {/* Ações */}
      <td className="py-3.5 pr-4 pl-2">
        <RowActions
          emp={emp}
          onDetail={() => onDetail(emp)}
          onEdit={() => onEdit(emp)}
          onToggleBlock={() => onToggleBlock(emp)}
        />
      </td>
    </tr>
  );
}

function SortTh({ label, field, current, dir, onSort }: {
  label: string; field: SortField | null; current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = field && current === field;
  return (
    <th
      onClick={() => field && onSort(field)}
      className={`py-3 px-4 text-left text-[10px] tracking-[0.15em] font-black uppercase whitespace-nowrap select-none ${
        field ? 'cursor-pointer hover:text-[#888] transition-colors' : ''
      } ${active ? 'text-[#FFD700]' : 'text-[#444]'}`}
    >
      {label}
      {field && <span className="ml-1">{active ? (dir === 'asc' ? '↑' : '↓') : '↕'}</span>}
    </th>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ColaboradoresPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showImport, setShowImport] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
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
        || STATUS_CFG[e.status].label.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name')           cmp = a.name.localeCompare(b.name);
      else if (sortField === 'netSalary') cmp = a.netSalary - b.netSalary;
      else if (sortField === 'availableMargin') cmp = a.availableMargin - b.availableMargin;
      else if (sortField === 'status')    cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [employees, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleBlock = useCallback((emp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id ? { ...e, status: e.status === 'blocked' ? 'active' : 'blocked' } : e,
      ),
    );
    // Update detail view if open
    setDetailEmployee((prev) =>
      prev?.id === emp.id ? { ...prev, status: prev.status === 'blocked' ? 'active' : 'blocked' } : prev,
    );
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const ativos     = employees.filter((e) => e.status === 'active');
    const bloqueados = employees.filter((e) => e.status === 'blocked').length;
    const desligados = employees.filter((e) => e.status === 'dismissed').length;
    const avgMargin  = ativos.length > 0
      ? ativos.reduce((s, e) => s + e.availableMargin, 0) / ativos.length
      : 0;
    return { total: employees.length, ativos: ativos.length, bloqueados, desligados, avgMargin };
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
              <span className="text-[#FFD700] font-bold">{stats.ativos}</span> ativos ·{' '}
              {stats.total} total na empresa
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all">
              <UserPlus size={15} strokeWidth={2.5} />
              Adicionar Manual
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_16px_rgba(255,215,0,0.2)]"
            >
              <Upload size={15} strokeWidth={2.5} />
              Importar Folha
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total',       value: stats.total.toString(),        color: 'text-white'       },
            { label: 'Ativos',      value: stats.ativos.toString(),       color: 'text-green-400'   },
            { label: 'Bloqueados',  value: stats.bloqueados.toString(),   color: 'text-red-400'     },
            { label: 'Desligados',  value: stats.desligados.toString(),   color: 'text-[#666]'      },
            { label: 'Margem média disponível', value: formatBRL(stats.avgMargin), color: 'text-[#FFD700]' },
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
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome, CPF, departamento ou status…"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#111] pl-11 pr-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'all',       label: 'Todos' },
              { key: 'active',    label: 'Ativos' },
              { key: 'blocked',   label: 'Bloqueados' },
              { key: 'on_leave',  label: 'Afastados' },
              { key: 'dismissed', label: 'Desligados' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => { setStatusFilter(f.key); setPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${
                  statusFilter === f.key
                    ? 'bg-[#FFD700] text-[#0A0A0A] border-[#FFD700]'
                    : 'bg-[#111] text-[#555] border-[#1A1A1A] hover:border-[#333] hover:text-white'
                }`}
              >
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
                  <SortTh label="Colaborador"        field="name"           current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="CPF"                field={null}           current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Salário Líquido"    field="netSalary"      current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Margem Total (30%)" field={null}           current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Uso / Disponível"   field="availableMargin" current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Status"             field="status"         current={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#444]">
                      <p className="text-4xl mb-3">🔍</p>
                      <p className="font-bold text-white">Nenhum colaborador encontrado</p>
                      <p className="text-xs mt-1">Tente ajustar os filtros ou o termo de busca</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((emp) => (
                    <EmployeeRow
                      key={emp.id}
                      emp={emp}
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
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A1A1A] text-[#555] text-xs hover:border-[#333] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
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
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          page === p ? 'bg-[#FFD700] text-[#0A0A0A]' : 'border border-[#1A1A1A] text-[#555] hover:border-[#333] hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#1A1A1A] text-[#555] text-xs hover:border-[#333] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Texto de ajuda */}
        <p className="text-xs text-[#333] text-center">
          Colaboradores bloqueados não conseguem gerar novos tokens. Desligados permanecem no histórico para auditoria.
        </p>

      </main>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => setShowImport(false)}
        />
      )}

      {detailEmployee && (
        <EmployeeDetailModal
          employee={detailEmployee}
          onClose={() => setDetailEmployee(null)}
          onBlock={handleToggleBlock}
          onEdit={() => {}} // TODO: abrir modal de edição de colaborador
        />
      )}
    </div>
  );
}
