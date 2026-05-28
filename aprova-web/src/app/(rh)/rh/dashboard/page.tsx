'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, UserPlus, BarChart2, Download, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import RhNav from '../components/RhNav';

// TODO: substituir por GET /api/v1/rh/metrics
const MOCK_METRICS = {
  totalEmployees: 248,
  totalMargin: 156000,
  usedMargin: 47200,
  availableMargin: 108800,
  utilizationPct: 30.3,
  newThisMonth: 7,
  activeContracts: 63,
  companyName: 'Metalúrgica Fonseca S.A.',
};

// TODO: substituir por GET /api/v1/rh/activity
const MOCK_ACTIVITY = [
  { id: '1', employee: 'João Silva',      action: 'Contrato assinado', detail: 'Plano de Saúde Plus', amount: 1200,  ts: Date.now() - 900000,       type: 'contract' as const },
  { id: '2', employee: 'Sistema',          action: 'Folha importada',   detail: '248 registros processados',    amount: null,   ts: Date.now() - 7200000,      type: 'import'   as const },
  { id: '3', employee: 'Maria Santos',     action: 'Benefício bloqueado', detail: 'Por solicitação do RH',    amount: null,   ts: Date.now() - 18000000,     type: 'block'    as const },
  { id: '4', employee: 'Carlos Oliveira',  action: 'Margem ajustada',  detail: 'Ajuste manual pelo gestor',  amount: 800,    ts: Date.now() - 86400000,     type: 'edit'     as const },
  { id: '5', employee: 'Ana Costa',        action: 'Contrato assinado', detail: 'Bike Elétrica Urbana',       amount: 2160,   ts: Date.now() - 86400000 * 2, type: 'contract' as const },
];

// TODO: substituir por GET /api/v1/rh/pending
const MOCK_PENDING = [
  { id: 'p1', icon: '👤', label: '3 colaboradores sem margem calculada',    action: 'Revisar agora', href: '/rh/colaboradores' },
  { id: 'p2', icon: '📄', label: '2 contratos aguardando validação do RH',  action: 'Validar',       href: '/rh/relatorios' },
  { id: 'p3', icon: '📊', label: '1 arquivo de folha pendente de revisão',  action: 'Verificar',     href: '/rh/colaboradores' },
];

const ACTIVITY_CONFIG = {
  contract: { icon: '📄', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  import:   { icon: '📊', color: 'text-sky-400',     bg: 'bg-sky-400/10' },
  block:    { icon: '🔒', color: 'text-red-400',     bg: 'bg-red-400/10' },
  edit:     { icon: '✏️', color: 'text-orange-400',  bg: 'bg-orange-400/10' },
};

const QUICK_ACTIONS = [
  { icon: Upload,    label: 'Importar Folha',       desc: 'Atualize salários e margens em massa', href: '/rh/colaboradores', yellow: true  },
  { icon: UserPlus,  label: 'Adicionar Colaborador', desc: 'Cadastre manualmente um novo colaborador', href: '/rh/colaboradores', yellow: false },
  { icon: BarChart2, label: 'Gerar Relatório',       desc: 'Gere relatórios de uso e contratos',   href: '/rh/relatorios',   yellow: false },
  { icon: Download,  label: 'Exportar Dados',        desc: 'Baixe os dados da empresa em CSV/PDF', href: '/rh/relatorios',   yellow: false },
];

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, highlight, delta, loading,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
  delta?: { value: string; dir: 'up' | 'down' | 'neutral' }; loading?: boolean;
}) {
  const DeltaIcon = delta?.dir === 'up' ? TrendingUp : delta?.dir === 'down' ? TrendingDown : Minus;
  const deltaColor = delta?.dir === 'up' ? 'text-emerald-400' : delta?.dir === 'down' ? 'text-red-400' : 'text-[#555]';

  return (
    <div className="bg-[#111] rounded-2xl border border-[#1A1A1A] p-5 flex flex-col gap-3">
      <p className="text-[#555] text-[10px] tracking-[0.2em] font-black uppercase">{label}</p>
      {loading ? (
        <div className="h-9 bg-[#1A1A1A] rounded-xl animate-pulse" />
      ) : (
        <p className={`text-3xl font-black tracking-tight leading-none ${highlight ? 'text-[#FFD700]' : 'text-white'}`}>
          {value}
        </p>
      )}
      {(sub || delta) && !loading && (
        <div className="flex items-center gap-2">
          {delta && (
            <span className={`flex items-center gap-1 text-xs font-bold ${deltaColor}`}>
              <DeltaIcon size={12} strokeWidth={2.5} />
              {delta.value}
            </span>
          )}
          {sub && <p className="text-[#444] text-xs">{sub}</p>}
        </div>
      )}
    </div>
  );
}

function MarginHealthBlock({ pct }: { pct: number }) {
  const isHealthy  = pct <= 50;
  const isModerate = pct > 50 && pct <= 80;
  const isCritical = pct > 80;

  const cfg = isHealthy
    ? { label: 'Saudável',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20', Icon: CheckCircle,   msg: 'Uso atual dentro do limite esperado para o benefício.' }
    : isModerate
    ? { label: 'Atenção',   color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-500/20',  Icon: AlertTriangle, msg: 'Uso da margem está elevado. Monitore novos contratos.' }
    : { label: 'Crítico',   color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-500/20',     Icon: XCircle,       msg: 'Margem empresarial crítica. Bloqueie novos contratos.' };

  return (
    <div className={`rounded-2xl border p-5 flex items-start gap-4 ${cfg.border} ${cfg.bg}`}>
      <cfg.Icon size={20} className={`flex-shrink-0 mt-0.5 ${cfg.color}`} strokeWidth={2} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-white">Saúde da margem empresarial</p>
          <span className={`text-xs font-black tracking-widest border rounded-full px-3 py-1 ${cfg.color} border-current flex-shrink-0`}>
            {cfg.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#888]">{cfg.msg}</p>
        <p className="mt-0.5 text-xs text-[#555]">{pct.toFixed(1)}% da margem total utilizada</p>
      </div>
    </div>
  );
}

function UsageBar({ pct, used, total }: { pct: number; used: number; total: number }) {
  const isHealthy  = pct <= 50;
  const isModerate = pct > 50 && pct <= 80;
  const barColor   = isHealthy ? '#FFD700' : isModerate ? '#FF9800' : '#FF1744';
  const pctColor   = isHealthy ? 'text-[#FFD700]' : isModerate ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="bg-[#111] rounded-2xl border border-[#1A1A1A] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#555] text-[10px] tracking-[0.2em] font-black uppercase mb-1">Consumo da Margem Empresarial</p>
          <p className="text-white text-sm font-semibold">
            {formatBRL(used)}{' '}
            <span className="text-[#444] font-medium">de {formatBRL(total)} utilizados</span>
          </p>
        </div>
        <span className={`text-2xl font-black ${pctColor}`}>{pct.toFixed(1)}%</span>
      </div>

      <div className="relative h-4 bg-[#1A1A1A] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-[#1A1A1A] pt-4">
        {[
          { label: 'Disponível',        value: formatBRL(total - used), color: 'text-[#FFD700]' },
          { label: 'Utilizado',         value: formatBRL(used),         color: 'text-white'      },
          { label: 'Contratos ativos',  value: '63',                    color: 'text-[#888]'     },
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

export default function RhDashboardPage() {
  const [loading, setLoading] = useState(true);
  const m = MOCK_METRICS;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <RhNav companyName={m.companyName} />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 flex flex-col gap-7">

        {/* Page header */}
        <div>
          <p className="text-[#444] text-sm capitalize">{today}</p>
          <h1 className="text-white text-2xl sm:text-3xl font-black mt-0.5">
            Olá, <span className="text-[#FFD700]">{m.companyName}</span> 👋
          </h1>
          <p className="text-[#555] text-sm mt-1">
            Aqui está o resumo do benefício consignado da sua empresa.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Colaboradores Ativos"
            value={loading ? '—' : m.totalEmployees.toString()}
            sub="Total na empresa"
            delta={{ value: `+${m.newThisMonth} este mês`, dir: 'up' }}
            loading={loading}
          />
          <StatCard
            label="Margem Total Liberada"
            value={loading ? '—' : formatBRL(m.totalMargin)}
            sub="30% da folha elegível"
            highlight
            loading={loading}
          />
          <StatCard
            label="Volume Utilizado no Mês"
            value={loading ? '—' : formatBRL(m.usedMargin)}
            sub={`${m.utilizationPct.toFixed(1)}% da margem empresarial`}
            loading={loading}
          />
          <StatCard
            label="Contratos Ativos"
            value={loading ? '—' : m.activeContracts.toString()}
            sub="Em andamento"
            loading={loading}
          />
        </div>

        {/* Health alert */}
        {!loading && <MarginHealthBlock pct={m.utilizationPct} />}

        {/* Usage bar */}
        {!loading
          ? <UsageBar pct={m.utilizationPct} used={m.usedMargin} total={m.totalMargin} />
          : <div className="h-44 bg-[#111] rounded-2xl border border-[#1A1A1A] animate-pulse" />}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick actions */}
          <div className="bg-[#111] rounded-2xl border border-[#1A1A1A] p-6 flex flex-col gap-4">
            <p className="text-[#555] text-[10px] tracking-[0.2em] font-black uppercase">Ações rápidas</p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all group ${
                    a.yellow
                      ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110'
                      : 'bg-[#161616] border border-[#1A1A1A] text-white hover:border-[#2A2A2A] hover:bg-[#1C1C1C]'
                  }`}
                >
                  <a.icon size={17} strokeWidth={2.5} className="flex-shrink-0" />
                  <div>
                    <p className="text-sm font-black leading-tight">{a.label}</p>
                    <p className={`text-xs font-medium mt-0.5 ${a.yellow ? 'text-[#0A0A0A]/60' : 'text-[#555]'}`}>{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="lg:col-span-2 bg-[#111] rounded-2xl border border-[#1A1A1A] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
              <p className="text-white font-black">Atividade Recente</p>
              <Link href="/rh/relatorios" className="text-xs font-bold text-[#555] hover:text-[#FFD700] transition-colors">
                Ver tudo →
              </Link>
            </div>
            <div className="divide-y divide-[#141414]">
              {MOCK_ACTIVITY.map((item) => {
                const cfg = ACTIVITY_CONFIG[item.type];
                return (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#0F0F0F] transition-colors">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm ${cfg.bg}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-white text-sm font-bold">{item.employee}</p>
                        <p className={`text-xs font-bold ${cfg.color}`}>{item.action}</p>
                      </div>
                      <p className="text-[#555] text-xs mt-0.5 leading-relaxed">{item.detail}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {item.amount && (
                        <p className="text-[#FFD700] text-sm font-black">{formatBRL(item.amount)}</p>
                      )}
                      <p className="text-[#333] text-xs mt-0.5">{relativeTime(item.ts)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pendências do RH */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Atenção necessária</p>
              <h2 className="text-lg font-black text-white mt-0.5">Pendências do RH</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_PENDING.map((p) => (
              <div key={p.id} className="bg-[#111] rounded-2xl border border-[#1A1A1A] p-5 flex items-start gap-4 hover:border-[#2A2A2A] transition-colors">
                <span className="text-2xl flex-shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white leading-snug">{p.label}</p>
                  <Link
                    href={p.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#FFD700] hover:underline"
                  >
                    {p.action} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
