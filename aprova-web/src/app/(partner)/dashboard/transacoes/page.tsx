'use client';

import { useState, useMemo } from 'react';
import PartnerNav from '../../components/PartnerNav';
import { MOCK_TRANSACTIONS, TX_STATUS_CFG, type TxStatus, type Transaction, formatBRL } from '../../components/partner-data';

const TAKE_RATE = 0.12;

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function TransacoesPage() {
  const [statusFilter, setStatusFilter] = useState<TxStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchSearch = !q || tx.clientName.toLowerCase().includes(q) || tx.offer.toLowerCase().includes(q) || tx.token.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [statusFilter, search]);

  const STATUS_FILTERS: Array<{ key: TxStatus | 'all'; label: string }> = [
    { key: 'all',             label: 'Todos'         },
    { key: 'approved',        label: 'Aprovados'     },
    { key: 'completed',       label: 'Concluídos'    },
    { key: 'pending',         label: 'Pendentes'     },
    { key: 'token_generated', label: 'Token gerado'  },
    { key: 'rejected',        label: 'Rejeitados'    },
    { key: 'expired',         label: 'Expirados'     },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Histórico</p>
          <h1 className="mt-1 text-2xl font-black text-white">Transações</h1>
          <p className="mt-1 text-sm text-[#555]">
            Todos os tokens gerados e vendas realizadas via APROVA.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, oferta ou token…"
            className="flex-1 rounded-xl border border-[#1A1A1A] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {STATUS_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
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
                  {['Cliente', 'Oferta', 'Valor', 'Parcelas', 'Token', 'Data', 'Status', 'Repasse est.', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-[#444]">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="font-bold text-white">Nenhuma transação encontrada</p>
                    <p className="text-xs mt-1">Tente ajustar os filtros</p>
                  </td></tr>
                ) : (
                  filtered.map((tx: Transaction) => {
                    const st = TX_STATUS_CFG[tx.status];
                    const installmentAmt = tx.amount / tx.installments;
                    const netAmt = tx.amount * (1 - TAKE_RATE);
                    return (
                      <tr key={tx.id} className="hover:bg-[#0F0F0F] transition-colors">
                        <td className="py-3.5 pl-5 pr-4 text-sm font-bold text-white">{tx.clientName}</td>
                        <td className="py-3.5 px-4 text-sm text-[#888]">{tx.offer}</td>
                        <td className="py-3.5 px-4">
                          <p className="text-sm font-black text-[#FFD700]">{formatBRL(tx.amount)}</p>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#888]">
                          {tx.installments}x de {formatBRL(installmentAmt)}
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
                        <td className="py-3.5 px-4 pr-5">
                          <button className="text-xs font-bold text-[#555] hover:text-[#FFD700] transition-colors">Detalhes</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[#1A1A1A] flex items-center justify-between">
            <p className="text-sm text-[#555]">
              <span className="font-bold text-white">{filtered.length}</span> transações encontradas
            </p>
            <p className="text-[10px] text-[#333]">
              TODO: paginação via GET /api/v1/partners/me/transactions?page=X&status=Y
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
