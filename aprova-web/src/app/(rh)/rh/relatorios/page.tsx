'use client';

import { useState } from 'react';
import { Download, FileText, RefreshCw, BarChart2, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import RhNav from '../components/RhNav';

// TODO: substituir por GET /api/v1/rh/reports e GET /api/v1/rh/metrics?period=X
const MOCK_SUMMARY = {
  totalContracted:       89400,
  totalInstallments:     12,
  marginConsumed:        47200,
  employeesImpacted:     63,
  contractsFinished:     14,
  contractsActive:       63,
};

const MOCK_MONTHLY = [
  { month: 'Jan', value: 31200 },
  { month: 'Fev', value: 38500 },
  { month: 'Mar', value: 42100 },
  { month: 'Abr', value: 39800 },
  { month: 'Mai', value: 47200 },
  { month: 'Jun', value: 0     },
];

const MOCK_RECENT_REPORTS = [
  { id: 'r1', name: 'Uso da margem',           period: 'Maio/2026',       by: 'Marina',  date: '28/05/2026', status: 'ready'      },
  { id: 'r2', name: 'Contratos ativos',         period: 'Maio/2026',       by: 'Sistema', date: '28/05/2026', status: 'ready'      },
  { id: 'r3', name: 'Auditoria de alterações',  period: 'Últimos 30 dias', by: 'Sistema', date: '28/05/2026', status: 'processing' },
  { id: 'r4', name: 'Repasse mensal',           period: 'Abril/2026',      by: 'Marina',  date: '30/04/2026', status: 'ready'      },
  { id: 'r5', name: 'Colaboradores bloqueados', period: 'Abril/2026',      by: 'Sistema', date: '15/04/2026', status: 'ready'      },
];

const REPORT_TYPES = [
  'Uso da margem',
  'Contratos ativos',
  'Colaboradores bloqueados',
  'Importações de folha',
  'Repasse mensal',
  'Auditoria de alterações',
];

const RECOMMENDED = [
  { icon: '📊', title: 'Fechamento mensal para financeiro', desc: 'Totais consolidados para envio à folha de pagamento.' },
  { icon: '👥', title: 'Lista de colaboradores ativos',     desc: 'Exportação completa dos colaboradores elegíveis.' },
  { icon: '🔒', title: 'Auditoria de bloqueios',            desc: 'Histórico de bloqueios e desbloqueios de benefício.' },
  { icon: '📈', title: 'Consumo por departamento',          desc: 'Breakdown da margem utilizada por área da empresa.' },
];

const PERIODS = ['Hoje', '7 dias', '30 dias', 'Este mês', 'Personalizado'];

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-[#FFD700]/30 bg-[#1A1A00] px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <span className="text-[#FFD700] text-sm font-bold">{message}</span>
      <button onClick={onClose} className="text-[#555] hover:text-white text-xs font-bold">✕</button>
    </div>
  );
}

// CSS bar chart — sem dependências externas
function BarChart({ data }: { data: typeof MOCK_MONTHLY }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        const isEmpty = d.value === 0;
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end" style={{ height: '110px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isEmpty ? 'bg-[#1A1A1A]' : 'bg-[#FFD700]'}`}
                style={{ height: `${Math.max(pct, isEmpty ? 8 : 4)}%` }}
                title={isEmpty ? 'Sem dados' : formatBRL(d.value)}
              />
            </div>
            <span className="text-[10px] font-bold text-[#555]">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState('Este mês');
  const [reportType, setReportType] = useState('Uso da margem');
  const [toast, setToast] = useState<string | null>(null);

  // TODO: conectar ao endpoint POST /api/v1/rh/reports/generate
  const handleGenerate = () => {
    setToast('Relatório em preparação. Integração com backend pendente.');
    setTimeout(() => setToast(null), 4000);
  };

  // TODO: conectar ao endpoint GET /api/v1/rh/reports/:id/download
  const handleDownload = (report: typeof MOCK_RECENT_REPORTS[0]) => {
    if (report.status === 'processing') {
      setToast('Relatório ainda sendo processado. Tente novamente em alguns instantes.');
    } else {
      setToast('Download em preparação. Integração com backend pendente.');
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <RhNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Portal do RH</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white">Relatórios</h1>
            <p className="mt-1 text-sm text-[#555]">
              Acompanhe a utilização do benefício, contratos e movimentações da sua empresa.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all"
            >
              <RefreshCw size={15} strokeWidth={2.5} />
              Gerar relatório
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all"
            >
              <Download size={15} strokeWidth={2} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Volume total utilizado',  value: formatBRL(MOCK_SUMMARY.marginConsumed), color: 'text-[#FFD700]' },
            { icon: FileText,   label: 'Contratos gerados',       value: MOCK_SUMMARY.contractsActive.toString(), color: 'text-white'      },
            { icon: BarChart2,  label: 'Ticket médio',            value: formatBRL(MOCK_SUMMARY.totalContracted / MOCK_SUMMARY.contractsActive), color: 'text-white' },
            { icon: Users,      label: 'Colaboradores c/ benefício', value: MOCK_SUMMARY.employeesImpacted.toString(), color: 'text-emerald-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} className="text-[#444]" strokeWidth={2} />
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">{label}</p>
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4">Filtros</p>
          <div className="flex flex-wrap gap-4">
            {/* Período */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#444]">Período</label>
              <div className="flex gap-1.5 flex-wrap">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      period === p ? 'bg-[#FFD700] text-[#0A0A0A] border-[#FFD700]' : 'bg-[#161616] text-[#555] border-[#1A1A1A] hover:border-[#333] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de relatório */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#444]">Tipo de relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 appearance-none pr-8"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary block */}
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">{period}</p>
              <h2 className="mt-0.5 text-lg font-black text-white">Resumo do período</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total contratado',          value: formatBRL(MOCK_SUMMARY.totalContracted),    highlight: true  },
                { label: 'Parcelas previstas',        value: `${MOCK_SUMMARY.totalInstallments}x`,       highlight: false },
                { label: 'Margem consumida',          value: formatBRL(MOCK_SUMMARY.marginConsumed),     highlight: false },
                { label: 'Colaboradores impactados',  value: MOCK_SUMMARY.employeesImpacted.toString(),  highlight: false },
                { label: 'Contratos finalizados',     value: MOCK_SUMMARY.contractsFinished.toString(),  highlight: false },
                { label: 'Contratos em andamento',    value: MOCK_SUMMARY.contractsActive.toString(),    highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
                  <span className="text-xs font-semibold text-[#888]">{label}</span>
                  <span className={`text-sm font-black ${highlight ? 'text-[#FFD700]' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart — evolução mensal */}
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Evolução 2026</p>
              <h2 className="mt-0.5 text-lg font-black text-white">Volume mensal utilizado</h2>
            </div>
            <BarChart data={MOCK_MONTHLY} />
            <div className="mt-4 flex items-center justify-between text-xs text-[#444]">
              <span>Pico: {formatBRL(Math.max(...MOCK_MONTHLY.map((d) => d.value)))}</span>
              <span>Média: {formatBRL(MOCK_MONTHLY.filter((d) => d.value > 0).reduce((s, d) => s + d.value, 0) / MOCK_MONTHLY.filter((d) => d.value > 0).length)}</span>
            </div>
          </div>
        </div>

        {/* Recent reports table */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <h2 className="font-black text-white">Relatórios recentes</h2>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-xs font-bold text-[#888] hover:border-[#444] hover:text-white transition-all"
            >
              <Download size={12} strokeWidth={2} /> Exportar PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {['Relatório', 'Período', 'Gerado por', 'Data', 'Status', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] tracking-[0.15em] font-black uppercase text-[#444] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {MOCK_RECENT_REPORTS.map((r) => (
                  <tr key={r.id} className="hover:bg-[#0F0F0F] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-white text-sm font-semibold">{r.name}</p>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#888]">{r.period}</td>
                    <td className="py-3.5 px-4 text-sm text-[#888]">{r.by}</td>
                    <td className="py-3.5 px-4 text-sm text-[#888]">{r.date}</td>
                    <td className="py-3.5 px-4">
                      {r.status === 'ready' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                          <CheckCircle2 size={11} strokeWidth={2.5} /> Pronto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/20">
                          <RefreshCw size={11} strokeWidth={2.5} className="animate-spin" /> Processando
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 pr-6">
                      <button
                        onClick={() => handleDownload(r)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-xs font-bold text-[#888] hover:border-[#444] hover:text-white transition-all disabled:opacity-40"
                        disabled={r.status === 'processing'}
                      >
                        <Download size={12} strokeWidth={2} />
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended reports */}
        <div>
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Sugestões</p>
            <h2 className="mt-0.5 text-lg font-black text-white">Relatórios recomendados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECOMMENDED.map((r) => (
              <button
                key={r.title}
                onClick={handleGenerate}
                className="group flex flex-col gap-3 rounded-2xl border border-[#1A1A1A] bg-[#111] p-5 text-left hover:border-[#FFD700]/30 hover:bg-[#161616] transition-all"
              >
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors leading-snug">{r.title}</p>
                  <p className="text-xs text-[#555] mt-1 leading-relaxed">{r.desc}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide text-[#FFD700]/60 group-hover:text-[#FFD700] transition-colors">
                  Gerar →
                </span>
              </button>
            ))}
          </div>
        </div>

      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
