'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, QrCode, ArrowRight, Zap, BarChart2, ArrowUpRight,
} from 'lucide-react';
import PartnerNav from '../components/PartnerNav';
import {
  MOCK_METRICS, MOCK_FUNNEL, MOCK_TRANSACTIONS, MOCK_PLAN, MOCK_PARTNER,
  TX_STATUS_CFG, type Transaction, formatBRL, relativeTime,
} from '../components/partner-data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Period = 'today' | '7d' | '30d' | 'month';
const TAKE_RATE = 0.12;

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje', '7d': '7 dias', '30d': '30 dias', month: 'Este mês',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, highlight, trend, loading }: {
  label: string; value: string; sub: string; highlight?: boolean;
  trend?: 'up' | 'down' | 'neutral'; loading?: boolean;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : ArrowUpRight;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-[#555]';

  return (
    <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-5 flex flex-col gap-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#555]">{label}</p>
      {loading
        ? <div className="h-9 rounded-xl bg-[#1A1A1A] animate-pulse" />
        : <p className={`text-3xl font-black leading-none tracking-tight ${highlight ? 'text-[#FFD700]' : 'text-white'}`}>{value}</p>}
      {!loading && (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor}`}>
          <TrendIcon size={12} strokeWidth={2.5} />
          {sub}
        </div>
      )}
    </div>
  );
}

function FunnelBar({ label, value, total, pct }: { label: string; value: number; total: number; pct?: string }) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 flex-shrink-0">
        <p className="text-xs font-semibold text-[#888] truncate">{label}</p>
      </div>
      <div className="flex-1 h-7 bg-[#1A1A1A] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full bg-[#FFD700] transition-all duration-700"
          style={{ width: `${Math.max(width, 2)}%` }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white">
          {value.toLocaleString('pt-BR')}
        </span>
      </div>
      {pct && <span className="flex-shrink-0 text-xs font-black text-[#555] w-12 text-right">{pct}</span>}
    </div>
  );
}

// CSS bar chart
function VolumeChart() {
  const bars = [31, 47, 38, 52, 44, 61, 55, 48, 67, 72, 58, 65, 71, 80, 74, 68, 79, 85, 77, 82, 88, 76, 91, 84, 78, 95, 87, 92, 98, 100];
  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
          style={{ height: `${h}%`, background: i === bars.length - 1 ? '#FFD700' : i > bars.length - 8 ? '#3A3A00' : '#1A1A1A' }} />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: GET /api/v1/partners/me/metrics?period=X
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [period]);

  const m = MOCK_METRICS[period];
  const salesNet = m.salesGross * (1 - TAKE_RATE);
  const takeAmt  = m.salesGross * TAKE_RATE;

  const hasPlan = MOCK_PLAN.isActive || MOCK_PARTNER.plan === 'premium';

  // Funnel pct between steps
  const f = MOCK_FUNNEL;
  const funnelPct = (a: number, b: number) => b > 0 ? `${((a / b) * 100).toFixed(0)}%` : '—';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Portal do Parceiro</p>
            <h1 className="mt-1 text-2xl font-black text-white">Dashboard do Parceiro</h1>
            <p className="mt-1 text-sm text-[#555]">
              Acompanhe vendas, tokens, campanhas e performance da sua operação.
            </p>
          </div>
          {/* Period selector */}
          <div className="flex gap-1 bg-[#111] border border-[#1A1A1A] rounded-2xl p-1 self-start sm:self-auto">
            {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  period === key ? 'bg-[#FFD700] text-[#0A0A0A]' : 'text-[#555] hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Vendas no período"   value={formatBRL(m.salesGross)}     sub="Valor bruto via APROVA"          highlight loading={loading} />
          <MetricCard label="Receita líquida"     value={formatBRL(salesNet)}          sub="Após taxa APROVA de 12%"                   loading={loading} trend="up"      />
          <MetricCard label="Tokens gerados"      value={m.tokensGenerated.toString()} sub="Clientes com intenção de compra"            loading={loading} />
          <MetricCard label="Tokens convertidos"  value={m.tokensConverted.toString()} sub="Validados no balcão"             highlight loading={loading} />
          <MetricCard label="Taxa de conversão"   value={`${m.conversionRate.toFixed(1)}%`} sub="Tokens → venda"            loading={loading} trend={m.conversionRate > 40 ? 'up' : 'down'} />
          <MetricCard label="Ticket médio"        value={formatBRL(m.ticketAvg)}       sub="Média por venda aprovada"                  loading={loading} />
          <MetricCard label="Upsell / pacotes"    value={`${m.upsellRate.toFixed(1)}%`} sub="Vendas com mais de 1 item"    loading={loading} trend={m.upsellRate > 30 ? 'up' : 'neutral'} />
          <MetricCard label="ROI das campanhas"   value={m.campaignROI > 0 ? `${m.campaignROI}x` : '—'} sub="Retorno estimado dos anúncios" loading={loading} />
        </div>

        {/* Financial summary */}
        {!loading && (
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4">Resumo financeiro · {PERIOD_LABELS[period]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1A1A1A]">
              <div className="pb-4 sm:pb-0 sm:pr-6">
                <p className="text-xs text-[#555]">Vendas brutas</p>
                <p className="text-2xl font-black text-white mt-1">{formatBRL(m.salesGross)}</p>
              </div>
              <div className="py-4 sm:py-0 sm:px-6">
                <p className="text-xs text-[#555]">Taxa APROVA 12%</p>
                <p className="text-2xl font-black text-red-400 mt-1">- {formatBRL(takeAmt)}</p>
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-6">
                <p className="text-xs text-[#555]">Repasse estimado</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{formatBRL(salesNet)}</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-[#333]">
              Valores finais podem variar conforme fechamento da folha e validação dos contratos.
            </p>
          </div>
        )}

        {/* Two-column: Funnel + Campaign */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funil APROVA */}
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Conversão</p>
              <h2 className="mt-0.5 text-base font-black text-white">Funil APROVA</h2>
            </div>
            <div className="space-y-3">
              <FunnelBar label="Visualizações"    value={f.views}           total={f.views}           />
              <FunnelBar label="Cliques"          value={f.clicks}          total={f.views}          pct={funnelPct(f.clicks, f.views)}           />
              <FunnelBar label="Simulações"       value={f.simulations}     total={f.views}          pct={funnelPct(f.simulations, f.clicks)}      />
              <FunnelBar label="Tokens gerados"   value={f.tokensGenerated} total={f.views}          pct={funnelPct(f.tokensGenerated, f.simulations)} />
              <FunnelBar label="Tokens validados" value={f.tokensValidated} total={f.views}          pct={funnelPct(f.tokensValidated, f.tokensGenerated)} />
              <FunnelBar label="Vendas concluídas"value={f.salesCompleted}  total={f.views}          pct={funnelPct(f.salesCompleted, f.tokensValidated)} />
            </div>
            <p className="mt-4 text-[10px] text-[#333]">% calculado em relação à etapa anterior</p>
          </div>

          {/* Campaign performance or upsell */}
          <div className="rounded-2xl border bg-[#111] p-6 flex flex-col
            {!hasPlan ? 'border-[#FFD700]/15' : 'border-[#1A1A1A]'}">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Marketing</p>
              <h2 className="mt-0.5 text-base font-black text-white">Performance das Campanhas Inteligentes</h2>
            </div>

            {!hasPlan ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-4">
                <div className="h-14 w-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
                  <Zap size={22} className="text-[#FFD700]" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-black text-white text-sm">
                    {MOCK_PARTNER.hasCompletedSale
                      ? 'Você ainda não ativou as Campanhas Inteligentes APROVA.'
                      : 'Disponível após sua primeira venda APROVA.'}
                  </p>
                  <p className="text-xs text-[#555] mt-1.5 max-w-xs">
                    {MOCK_PARTNER.hasCompletedSale
                      ? 'Apareça em banners, cupons, parceiros em destaque e ofertas relacionadas.'
                      : 'Para facilitar o início, o plano só pode ser ativado após ter recebíveis no sistema.'}
                  </p>
                </div>
                <Link href="/dashboard/plano"
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all ${
                    MOCK_PARTNER.hasCompletedSale
                      ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110'
                      : 'cursor-not-allowed bg-[#1A1A1A] text-[#444] border border-[#2A2A2A]'
                  }`}
                >
                  {MOCK_PARTNER.hasCompletedSale
                    ? <><Zap size={14} strokeWidth={2.5} /> Ativar campanhas por R$ 197/mês</>
                    : 'Ativação disponível após primeira venda'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Impressões',        value: '8.420' },
                  { label: 'Cliques',           value: '312'   },
                  { label: 'Tokens gerados',    value: '42'    },
                  { label: 'Vendas atribuídas', value: '16'    },
                  { label: 'Receita atribuída', value: formatBRL(17280) },
                  { label: 'ROI',               value: `${m.campaignROI}x` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">{s.label}</p>
                    <p className="mt-1 text-xl font-black text-[#FFD700]">{s.value}</p>
                  </div>
                ))}
                <div className="col-span-2 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Custo do plano</p>
                    <p className="mt-1 text-sm font-black text-white">R$ 197/mês — desconto em recebíveis</p>
                  </div>
                  <Link href="/dashboard/campanhas" className="text-xs font-bold text-[#FFD700] hover:underline">
                    Gerenciar →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Volume chart + Token validator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Evolução</p>
                <h2 className="text-base font-black text-white">Volume de vendas</h2>
              </div>
              <span className="text-xs text-[#555]">Últimos 30 dias</span>
            </div>
            <VolumeChart />
          </div>

          {/* Token validator card */}
          <div className="rounded-2xl border border-[#FFD700]/20 bg-[#1A1A00] p-6 flex flex-col gap-4">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 mb-3">
                <QrCode size={20} className="text-[#FFD700]" strokeWidth={2} />
              </div>
              <h2 className="text-base font-black text-white">Validar Token APROVA</h2>
              <p className="text-xs text-[#888] mt-1">
                Digite o código apresentado pelo cliente para confirmar a margem e concluir a venda.
              </p>
            </div>
            <Link
              href="/dashboard/token"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#FFD700] py-4 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)]"
            >
              <QrCode size={16} strokeWidth={2.5} />
              Validar token agora
            </Link>
            <Link href="/dashboard/transacoes" className="text-center text-xs font-bold text-[#555] hover:text-[#FFD700] transition-colors">
              Ver histórico de tokens →
            </Link>
          </div>
        </div>

        {/* Transactions table */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">Histórico</p>
              <h2 className="text-base font-black text-white">Últimas Transações</h2>
            </div>
            <Link href="/dashboard/transacoes" className="flex items-center gap-1.5 text-sm font-bold text-[#FFD700] hover:underline">
              Ver todas <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {['Cliente', 'Oferta', 'Valor', 'Token', 'Data', 'Status', 'Repasse est.'].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {MOCK_TRANSACTIONS.slice(0, 5).map((tx: Transaction) => {
                  const st = TX_STATUS_CFG[tx.status];
                  const netAmt = tx.amount * (1 - TAKE_RATE);
                  return (
                    <tr key={tx.id} className="hover:bg-[#0F0F0F] transition-colors">
                      <td className="py-3.5 pl-5 pr-4 text-sm font-bold text-white">{tx.clientName}</td>
                      <td className="py-3.5 px-4 text-sm text-[#888]">{tx.offer}</td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-black text-[#FFD700]">{formatBRL(tx.amount)}</p>
                        <p className="text-[10px] text-[#444]">{tx.installments}x</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-[#888] bg-[#1A1A1A] px-2 py-1 rounded-lg">{tx.token}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#555]">{relativeTime(tx.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-black text-emerald-400">
                        {['approved', 'completed'].includes(tx.status) ? formatBRL(netAmt) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
