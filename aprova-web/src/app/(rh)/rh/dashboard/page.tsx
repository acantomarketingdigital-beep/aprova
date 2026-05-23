'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RhMetrics {
  totalEmployees: number;
  totalMargin: number;
  usedMargin: number;
  availableMargin: number;
  utilizationPct: number;
  newThisMonth: number;
  activeContracts: number;
}

interface RecentActivity {
  id: string;
  employee: string;
  action: string;
  amount: number | null;
  ts: string;
  type: 'contract' | 'import' | 'block' | 'edit';
}

// ─── Mock data (substitua por fetch real) ────────────────────────────────────

const MOCK_METRICS: RhMetrics = {
  totalEmployees: 248,
  totalMargin: 156000,
  usedMargin: 47200,
  availableMargin: 108800,
  utilizationPct: 30.3,
  newThisMonth: 7,
  activeContracts: 63,
};

const MOCK_ACTIVITY: RecentActivity[] = [
  { id: '1', employee: 'João Silva', action: 'Contrato assinado — Plano de Saúde Plus', amount: 1200, ts: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'contract' },
  { id: '2', employee: 'Sistema', action: 'Folha de pagamento importada (248 registros)', amount: null, ts: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'import' },
  { id: '3', employee: 'Maria Santos', action: 'Benefício bloqueado por solicitação do RH', amount: null, ts: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), type: 'block' },
  { id: '4', employee: 'Carlos Oliveira', action: 'Margem ajustada manualmente', amount: 800, ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'edit' },
];

const ACTIVITY_ICON: Record<RecentActivity['type'], string> = {
  contract: '📄',
  import: '📊',
  block: '🔒',
  edit: '✏️',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight = false,
  loading = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] p-6 flex flex-col gap-3">
      <p className="text-[#666] text-xs tracking-widest font-bold uppercase">{label}</p>
      {loading ? (
        <div className="h-9 bg-[#1A1A1A] rounded-xl animate-pulse" />
      ) : (
        <p className={`text-3xl font-black tracking-tight ${highlight ? 'text-[#FFD700]' : 'text-white'}`}>
          {value}
        </p>
      )}
      {sub && !loading && <p className="text-[#555] text-xs font-medium">{sub}</p>}
    </div>
  );
}

function UsageBar({ pct, used, total }: { pct: number; used: number; total: number }) {
  const health = pct < 60 ? 'healthy' : pct < 85 ? 'moderate' : 'critical';
  const barColor = health === 'healthy' ? '#FFD700' : health === 'moderate' ? '#FF9800' : '#FF1744';
  const healthLabel = health === 'healthy' ? 'Saudável' : health === 'moderate' ? 'Atenção' : 'Crítico';
  const healthClass = health === 'healthy' ? 'text-[#FFD700]' : health === 'moderate' ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#666] text-xs tracking-widest font-bold uppercase mb-1">
            CONSUMO DA MARGEM EMPRESARIAL
          </p>
          <p className="text-white text-sm">
            {formatBRL(used)}{' '}
            <span className="text-[#555]">de {formatBRL(total)} utilizados</span>
          </p>
        </div>
        <span className={`text-xs font-black tracking-widest border rounded-full px-3 py-1 ${healthClass} border-current`}>
          {healthLabel}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 bg-[#1A1A1A] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
        {/* 30% trava line */}
        <div className="absolute top-0 bottom-0 w-px bg-[#333]" style={{ left: '30%' }}>
          <div className="absolute -top-5 left-1 text-[10px] text-[#555] whitespace-nowrap">trava 30%</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#555]">
        <span>0%</span>
        <span className={`font-black text-lg ${healthClass}`}>{pct.toFixed(1)}% utilizado</span>
        <span>100%</span>
      </div>

      {/* Segments */}
      <div className="grid grid-cols-3 gap-3 border-t border-[#1A1A1A] pt-4">
        {[
          { label: 'Disponível', value: formatBRL(total - used), color: 'text-[#FFD700]' },
          { label: 'Utilizado', value: formatBRL(used), color: 'text-white' },
          { label: 'Contratos ativos', value: '63', color: 'text-[#888]' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className={`font-black text-base ${s.color}`}>{s.value}</p>
            <p className="text-[#555] text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ items }: { items: RecentActivity[] }) {
  function relativeTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] flex flex-col">
      <div className="px-6 py-5 border-b border-[#1A1A1A]">
        <p className="text-white font-bold">Atividade Recente</p>
      </div>
      <div className="divide-y divide-[#1A1A1A]">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#0F0F0F] transition">
            <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-base flex-shrink-0">
              {ACTIVITY_ICON[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{item.employee}</p>
              <p className="text-[#666] text-xs mt-0.5 leading-relaxed">{item.action}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {item.amount && (
                <p className="text-[#FFD700] text-sm font-black">{formatBRL(item.amount)}</p>
              )}
              <p className="text-[#444] text-xs mt-0.5">{relativeTime(item.ts)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RhDashboardPage() {
  const [metrics, setMetrics] = useState<RhMetrics>(MOCK_METRICS);
  const [activity] = useState<RecentActivity[]>(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const companyName = 'Metalúrgica Fonseca S.A.';

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

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
            { label: 'Dashboard', href: '/rh/dashboard', active: true },
            { label: 'Colaboradores', href: '/rh/colaboradores', active: false },
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
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-bold">{companyName}</p>
            <p className="text-[#555] text-xs">Administrador RH</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0A0A0A] font-black text-sm">
            MF
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-8 py-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Page header */}
        <div>
          <p className="text-[#555] text-sm mb-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-white text-3xl font-black">
            Olá, <span className="text-[#FFD700]">{companyName}</span> 👋
          </h1>
          <p className="text-[#555] text-sm mt-1">
            Aqui está o resumo do benefício consignado da sua empresa.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Colaboradores Ativos"
            value={loading ? '—' : metrics.totalEmployees.toString()}
            sub={`+${metrics.newThisMonth} este mês`}
            loading={loading}
          />
          <StatCard
            label="Margem Total Liberada"
            value={loading ? '—' : formatBRL(metrics.totalMargin)}
            sub="Saldo consignável"
            highlight
            loading={loading}
          />
          <StatCard
            label="Volume Utilizado (Mês)"
            value={loading ? '—' : formatBRL(metrics.usedMargin)}
            sub={`${metrics.utilizationPct.toFixed(1)}% da margem`}
            loading={loading}
          />
          <StatCard
            label="Contratos Ativos"
            value={loading ? '—' : metrics.activeContracts.toString()}
            sub="Em andamento"
            loading={loading}
          />
        </div>

        {/* Usage bar */}
        {!loading && (
          <UsageBar
            pct={metrics.utilizationPct}
            used={metrics.usedMargin}
            total={metrics.totalMargin}
          />
        )}
        {loading && <div className="h-48 bg-[#111] rounded-2xl border border-[#222] animate-pulse" />}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="bg-[#111] rounded-2xl border border-[#222] p-6 flex flex-col gap-3">
            <p className="text-[#666] text-xs tracking-widest font-bold uppercase mb-2">
              AÇÕES RÁPIDAS
            </p>
            {[
              { label: 'Importar Folha (CSV)', icon: '📊', href: '/rh/colaboradores', yellow: true },
              { label: 'Adicionar Colaborador', icon: '➕', href: '/rh/colaboradores', yellow: false },
              { label: 'Gerar Relatório', icon: '📋', href: '/rh/relatorios', yellow: false },
              { label: 'Exportar Dados', icon: '⬇️', href: '#', yellow: false },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  action.yellow
                    ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#222]'
                }`}
              >
                <span>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>

          {/* Activity feed */}
          <div className="lg:col-span-2">
            <ActivityFeed items={activity} />
          </div>
        </div>
      </main>
    </div>
  );
}
