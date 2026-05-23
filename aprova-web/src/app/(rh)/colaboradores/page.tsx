'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import ImportModal from './components/ImportModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeStatus = 'active' | 'dismissed' | 'on_leave' | 'blocked';

interface Employee {
  id: string;
  name: string;
  cpf: string;
  department: string;
  netSalary: number;
  marginCap: number;      // 30% do salário
  usedMargin: number;
  availableMargin: number;
  status: EmployeeStatus;
  admissionDate: string;
}

type SortField = 'name' | 'netSalary' | 'availableMargin' | 'status';
type SortDir = 'asc' | 'desc';

// ─── Mock data ─────────────────────────────────────────────────────────────────

function makeMockEmployee(i: number): Employee {
  const salary = 2000 + Math.random() * 8000;
  const cap = salary * 0.3;
  const used = Math.random() * cap * 0.9;
  const statuses: EmployeeStatus[] = ['active', 'active', 'active', 'dismissed', 'on_leave', 'blocked'];
  return {
    id: `emp-${i}`,
    name: ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Lima', 'Fernanda Rocha', 'Lucas Mendes', 'Isabela Ferreira', 'Rafael Sousa', 'Camila Nunes'][i % 10],
    cpf: `${String(Math.floor(Math.random() * 999)).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
    department: ['TI', 'Financeiro', 'Comercial', 'RH', 'Operações', 'Jurídico'][i % 6],
    netSalary: salary,
    marginCap: cap,
    usedMargin: used,
    availableMargin: cap - used,
    status: statuses[i % statuses.length],
    admissionDate: new Date(2018 + (i % 6), i % 12, 1).toLocaleDateString('pt-BR'),
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

const STATUS_CFG: Record<EmployeeStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: 'Ativo',       cls: 'text-green-400 bg-green-400/10 border-green-400/20',   dot: 'bg-green-400' },
  dismissed: { label: 'Desligado',   cls: 'text-[#666] bg-[#1A1A1A] border-[#2A2A2A]',           dot: 'bg-[#444]' },
  on_leave:  { label: 'Afastado',    cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
  blocked:   { label: 'Bloqueado',   cls: 'text-red-400 bg-red-400/10 border-red-400/20',          dot: 'bg-red-400' },
};

// ─── Row ──────────────────────────────────────────────────────────────────────

function EmployeeRow({
  emp,
  onEdit,
  onToggleBlock,
}: {
  emp: Employee;
  onEdit: (e: Employee) => void;
  onToggleBlock: (e: Employee) => void;
}) {
  const st = STATUS_CFG[emp.status];
  const marginPct = emp.marginCap > 0 ? (emp.usedMargin / emp.marginCap) * 100 : 0;
  const availColor = emp.availableMargin > 0 ? 'text-[#FFD700]' : 'text-red-400';

  return (
    <tr className="group border-b border-[#141414] hover:bg-[#141414] transition-colors">
      {/* Nome + Depto */}
      <td className="py-4 pl-6 pr-4">
        <p className="text-white font-semibold text-sm">{emp.name}</p>
        <p className="text-[#555] text-xs mt-0.5">{emp.department} · desde {emp.admissionDate}</p>
      </td>

      {/* CPF */}
      <td className="py-4 px-4 text-[#666] text-sm font-mono">{maskCPF(emp.cpf)}</td>

      {/* Salário Líquido */}
      <td className="py-4 px-4">
        <p className="text-white font-bold text-sm">{formatBRL(emp.netSalary)}</p>
      </td>

      {/* Margem Consignável */}
      <td className="py-4 px-4">
        <p className="text-[#888] font-semibold text-sm">{formatBRL(emp.marginCap)}</p>
        <div className="mt-1.5 h-1.5 w-24 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFD700]"
            style={{ width: `${Math.min(marginPct, 100)}%` }}
          />
        </div>
        <p className="text-[#444] text-xs mt-0.5">{marginPct.toFixed(0)}% utilizado</p>
      </td>

      {/* Margem Disponível */}
      <td className="py-4 px-4">
        <p className={`font-black text-sm ${availColor}`}>{formatBRL(emp.availableMargin)}</p>
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </td>

      {/* Ações */}
      <td className="py-4 pr-6 pl-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(emp)}
            title="Editar"
            className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] flex items-center justify-center text-[#888] hover:text-white transition text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onToggleBlock(emp)}
            title={emp.status === 'blocked' ? 'Desbloquear' : 'Bloquear benefício'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition text-sm ${
              emp.status === 'blocked'
                ? 'bg-[#1A0A0A] hover:bg-[#2A1010] text-red-400'
                : 'bg-[#1A1A1A] hover:bg-[#252525] text-[#888] hover:text-red-400'
            }`}
          >
            🔒
          </button>
        </div>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i} className="border-b border-[#141414]">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="py-4 px-4">
              <div className="h-4 bg-[#1A1A1A] rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ColaboradoresPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [loading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Sort toggle
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }, [sortField]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-[#333] ml-1">↕</span>;
    return <span className="text-[#FFD700] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Filter + sort + paginate
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = employees.filter((e) => {
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.cpf.includes(q);
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'netSalary') cmp = a.netSalary - b.netSalary;
      else if (sortField === 'availableMargin') cmp = a.availableMargin - b.availableMargin;
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [employees, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = useCallback((emp: Employee) => {
    alert(`Editar: ${emp.name}\n(Modal de edição a implementar)`);
  }, []);

  const handleToggleBlock = useCallback((emp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id
          ? { ...e, status: e.status === 'blocked' ? 'active' : 'blocked' }
          : e,
      ),
    );
  }, []);

  const handleImportSuccess = useCallback(() => {
    setShowImport(false);
    // Em produção, refetch da lista de funcionários aqui
  }, []);

  const activeCount = employees.filter((e) => e.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top Nav */}
      <header className="border-b border-[#1A1A1A] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[#FFD700] font-black text-xl tracking-widest">APROVA</span>
          <span className="text-[#333] text-lg">|</span>
          <span className="text-[#666] text-sm font-medium">Portal do RH</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Dashboard', href: '/rh/dashboard', active: false },
            { label: 'Colaboradores', href: '/rh/colaboradores', active: true },
            { label: 'Relatórios', href: '/rh/relatorios', active: false },
            { label: 'Configurações', href: '/rh/configuracoes', active: false },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                item.active
                  ? 'bg-[#FFD700] text-[#0A0A0A]'
                  : 'text-[#666] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0A0A0A] font-black text-sm">
          MF
        </div>
      </header>

      <main className="px-8 py-8 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-black">Gestão de Colaboradores</h1>
            <p className="text-[#555] text-sm mt-1">
              <span className="text-[#FFD700] font-bold">{activeCount}</span> ativos ·{' '}
              {employees.length} total
            </p>
          </div>
          {/* CTAs principais */}
          <div className="flex items-center gap-3">
            <button
              className="border border-[#2A2A2A] text-[#888] font-bold text-sm px-5 py-3 rounded-xl hover:border-[#444] hover:text-white transition flex items-center gap-2"
            >
              <span>➕</span> ADICIONAR MANUAL
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="bg-[#FFD700] text-[#0A0A0A] font-black text-sm px-5 py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)]"
            >
              <span>📊</span> IMPORTAR FOLHA (CSV)
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome ou CPF..."
              className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#FFD700]/50 transition"
            />
          </div>
          {/* Status filter */}
          <div className="flex gap-2">
            {([
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativos' },
              { key: 'blocked', label: 'Bloqueados' },
              { key: 'dismissed', label: 'Desligados' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => { setStatusFilter(f.key as any); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                  statusFilter === f.key
                    ? 'bg-[#FFD700] text-[#0A0A0A] border-[#FFD700]'
                    : 'bg-[#111] text-[#666] border-[#222] hover:border-[#444] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111] rounded-2xl border border-[#1A1A1A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {(
                    [
                      { label: 'Colaborador', field: 'name' as SortField, pl: 'pl-6' },
                      { label: 'CPF', field: null },
                      { label: 'Salário Líquido', field: 'netSalary' as SortField },
                      { label: 'Margem Consignável (30%)', field: null },
                      { label: 'Margem Disponível', field: 'availableMargin' as SortField },
                      { label: 'Status', field: 'status' as SortField },
                      { label: '', field: null },
                    ] as Array<{ label: string; field: SortField | null; pl?: string }>
                  ).map(({ label, field, pl }) => (
                    <th
                      key={label || 'actions'}
                      onClick={() => field && handleSort(field)}
                      className={`py-3 px-4 text-left text-[#444] text-xs tracking-widest font-bold uppercase whitespace-nowrap ${pl ?? ''} ${field ? 'cursor-pointer hover:text-[#888] transition select-none' : ''}`}
                    >
                      {label}
                      {field && <SortIcon field={field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton />
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#444]">
                      <p className="text-3xl mb-3">🔍</p>
                      <p className="font-semibold">Nenhum colaborador encontrado</p>
                      <p className="text-xs mt-1">Tente ajustar os filtros</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((emp) => (
                    <EmployeeRow
                      key={emp.id}
                      emp={emp}
                      onEdit={handleEdit}
                      onToggleBlock={handleToggleBlock}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-[#1A1A1A] flex items-center justify-between">
              <p className="text-[#555] text-sm">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de{' '}
                <span className="text-white font-bold">{filtered.length}</span> colaboradores
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#222] text-[#666] text-xs hover:border-[#444] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
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
                      <span key={`dots-${i}`} className="px-2 text-[#444] text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          page === p
                            ? 'bg-[#FFD700] text-[#0A0A0A]'
                            : 'border border-[#222] text-[#666] hover:border-[#444] hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#222] text-[#666] text-xs hover:border-[#444] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
