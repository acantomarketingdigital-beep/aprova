'use client';

import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

interface Metric {
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
}

interface Transaction {
  id: string;
  employee_name: string;
  service: string;
  amount: number;
  installments: number;
  status: 'approved' | 'pending' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'text-green-400 bg-green-400/10 border-green-400/20',
  completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  pending: 'text-aprova-yellow bg-aprova-yellow/10 border-aprova-yellow/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  cancelled: 'text-[#666] bg-[#666]/10 border-[#666]/20',
};

const STATUS_LABELS: Record<string, string> = {
  approved: 'Aprovado',
  completed: 'Concluído',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

function MetricCard({ metric, loading }: { metric: Metric; loading: boolean }) {
  const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-aprova-muted';
  const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] p-6 flex flex-col gap-2">
      <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase">{metric.label}</p>
      {loading ? (
        <div className="h-10 bg-[#222] rounded-xl animate-pulse" />
      ) : (
        <p className="text-aprova-yellow text-3xl font-black tracking-tight">{metric.value}</p>
      )}
      <p className={`text-xs font-semibold ${trendColor}`}>
        {trendIcon} {metric.sub}
      </p>
    </div>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const statusClass = STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending;
  return (
    <tr className="border-b border-[#1A1A1A] hover:bg-[#111] transition-colors">
      <td className="py-4 px-4">
        <p className="text-white font-semibold text-sm">{tx.employee_name}</p>
        <p className="text-aprova-muted text-xs mt-0.5">{tx.service}</p>
      </td>
      <td className="py-4 px-4">
        <p className="text-aprova-yellow font-black">{formatBRL(tx.amount)}</p>
        <p className="text-aprova-muted text-xs">{tx.installments}x</p>
      </td>
      <td className="py-4 px-4 text-aprova-muted text-xs">
        {new Date(tx.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${statusClass}`}
        >
          {STATUS_LABELS[tx.status] ?? tx.status}
        </span>
      </td>
    </tr>
  );
}

function TxRowSkeleton() {
  return (
    <tr className="border-b border-[#1A1A1A]">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-[#1A1A1A] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

const MOCK_METRICS: Metric[] = [
  { label: 'Vendas Hoje', value: 'R$ 12.400', sub: '+18% vs. ontem', trend: 'up' },
  { label: 'Ticket Médio', value: 'R$ 820', sub: '+4% este mês', trend: 'up' },
  { label: 'Taxa Upsell', value: '34,2%', sub: '-2% vs. semana passada', trend: 'down' },
  { label: 'ROI Campanha', value: '3,8x', sub: 'Mês atual', trend: 'neutral' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    employee_name: 'João Silva',
    service: 'Plano de Saúde Plus',
    amount: 1200,
    installments: 12,
    status: 'approved',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    employee_name: 'Maria Santos',
    service: 'Curso de Tecnologia',
    amount: 2400,
    installments: 6,
    status: 'completed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    employee_name: 'Carlos Oliveira',
    service: 'Eletrodomésticos Flash Sale',
    amount: 890,
    installments: 3,
    status: 'pending',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    employee_name: 'Ana Costa',
    service: 'Pacote Odonto',
    amount: 600,
    installments: 12,
    status: 'approved',
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '5',
    employee_name: 'Pedro Lima',
    service: 'Notebook Lenovo',
    amount: 3200,
    installments: 12,
    status: 'rejected',
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

export default function DashboardPage() {
  const [metrics] = useState<Metric[]>(MOCK_METRICS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // Simulate API loading
    const t1 = setTimeout(() => setLoadingMetrics(false), 800);
    const t2 = setTimeout(() => setLoadingTx(false), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [period]);

  const handlePeriodChange = (p: typeof period) => {
    if (p === period) return;
    setPeriod(p);
    setLoadingMetrics(true);
    setLoadingTx(true);
  };

  return (
    <div className="min-h-screen bg-aprova-black text-white p-6 flex flex-col gap-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
        <div>
          <h1 className="text-aprova-yellow text-3xl font-black tracking-widest uppercase">
            DASHBOARD
          </h1>
          <p className="text-aprova-muted text-sm mt-1">
            Visão geral do seu desempenho como parceiro
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-[#111] border border-[#2A2A2A] rounded-2xl p-1.5">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                period === p
                  ? 'bg-aprova-yellow text-aprova-black'
                  : 'text-aprova-muted hover:text-white'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} metric={m} loading={loadingMetrics} />
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase">
            VOLUME DE VENDAS
          </p>
          <p className="text-aprova-muted text-xs">Últimos 30 dias</p>
        </div>
        <div className="h-40 flex items-end gap-2">
          {Array.from({ length: 30 }, (_, i) => {
            const height = 20 + Math.random() * 80;
            const isLast = i === 29;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all ${isLast ? 'bg-aprova-yellow' : 'bg-[#2A2A2A]'}`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
          <p className="text-white font-bold tracking-wide">Últimas Transações</p>
          <button className="text-aprova-yellow text-sm font-bold hover:underline">
            Ver todas →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Cliente', 'Valor', 'Data', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-aprova-muted text-xs tracking-widest font-bold uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingTx
                ? Array.from({ length: 5 }, (_, i) => <TxRowSkeleton key={i} />)
                : transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </tbody>
          </table>
        </div>

        {!loadingTx && (
          <div className="px-6 py-4 border-t border-[#1A1A1A] flex items-center justify-between">
            <p className="text-aprova-muted text-sm">
              Mostrando {transactions.length} transações
            </p>
            <div className="flex gap-2">
              <button className="border border-[#2A2A2A] text-aprova-muted text-sm px-4 py-2 rounded-xl hover:border-[#444] transition">
                ← Anterior
              </button>
              <button className="border border-[#2A2A2A] text-aprova-muted text-sm px-4 py-2 rounded-xl hover:border-[#444] transition">
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
