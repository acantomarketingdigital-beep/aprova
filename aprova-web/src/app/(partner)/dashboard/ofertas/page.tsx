'use client';

import { useState } from 'react';
import { Plus, Pencil, Eye, EyeOff, X } from 'lucide-react';
import PartnerNav from '../../components/PartnerNav';
import { MOCK_OFFERS, type Offer, formatBRL } from '../../components/partner-data';

const TAKE_RATE = 0.12;

const STATUS_CFG = {
  active: { label: 'Ativa',     cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  paused: { label: 'Pausada',   cls: 'text-orange-400  bg-orange-400/10  border-orange-400/20'  },
  draft:  { label: 'Rascunho',  cls: 'text-[#555]      bg-[#1A1A1A]      border-[#2A2A2A]'      },
};

const CATEGORIES = ['Estética', 'Saúde', 'Odontologia', 'Educação', 'Veículos', 'Casa & Reforma', 'Tecnologia', 'Viagens'];
const INSTALLMENT_OPTIONS = [1,2,3,4,6,8,10,12];

function FinancialCalc({ totalValue, installments }: { totalValue: number; installments: number }) {
  const installmentAmt = totalValue / installments;
  const takeAmt = totalValue * TAKE_RATE;
  const net = totalValue - takeAmt;

  return (
    <div className="rounded-xl border border-[#FFD700]/15 bg-[#FFD700]/[0.04] p-4 space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]/60 mb-2">Cálculo financeiro</p>
      <div className="flex justify-between text-sm"><span className="text-[#888]">Valor total</span><span className="font-bold text-white">{formatBRL(totalValue)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-[#888]">{installments}x de</span><span className="font-bold text-[#FFD700]">{formatBRL(installmentAmt)}</span></div>
      <div className="border-t border-white/[0.06] pt-1.5 mt-1.5">
        <div className="flex justify-between text-sm"><span className="text-[#888]">Taxa APROVA 12%</span><span className="font-bold text-red-400">- {formatBRL(takeAmt)}</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="font-black text-white">Receita líquida estimada</span><span className="font-black text-emerald-400">{formatBRL(net)}</span></div>
      </div>
      <p className="text-[10px] text-[#333]">A taxa APROVA é aplicada sobre vendas concluídas.</p>
    </div>
  );
}

function OfferForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [desc, setDesc] = useState('');
  const [totalValue, setTotalValue] = useState(1080);
  const [installments, setInstallments] = useState(12);
  const [showInMarketplace, setShowInMarketplace] = useState(true);
  const [allowUpsell, setAllowUpsell] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: POST /api/v1/partners/me/products
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 z-50 mx-auto max-w-lg rounded-3xl border border-[#1A1A1A] bg-[#111] overflow-hidden top-1/2 -translate-y-1/2 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4">
          <h2 className="font-black text-white">Nova Oferta</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] scrollbar-hide space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Nome da oferta</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Combo Ozônio + Recovery"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 appearance-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Parcelas</label>
              <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 appearance-none">
                {INSTALLMENT_OPTIONS.map((n) => <option key={n} value={n}>{n}x</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Valor total (R$)</label>
            <input type="number" min={0} value={totalValue} onChange={(e) => setTotalValue(Number(e.target.value))}
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>
          <FinancialCalc totalValue={totalValue} installments={installments} />
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Descrição</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Descreva brevemente a oferta..."
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 resize-none transition-colors" />
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Exibir no marketplace',    sub: 'Oferta visível para trabalhadores', val: showInMarketplace, set: setShowInMarketplace },
              { label: 'Permitir upsell/pacote',   sub: 'Pode ser adicionada no pacote do cliente', val: allowUpsell, set: setAllowUpsell },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
                <div><p className="text-sm font-bold text-white">{label}</p><p className="text-xs text-[#444]">{sub}</p></div>
                <button onClick={() => set((v: boolean) => !v)}
                  className={`relative w-11 h-6 rounded-full border transition-all ${val ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${val ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#1A1A1A] px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3 text-sm font-bold text-[#888] hover:text-white transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !name}
            className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all ${!saving && name ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110' : 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'}`}>
            {saving ? 'Salvando…' : 'Salvar oferta'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function OfertasPage() {
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [showForm, setShowForm] = useState(false);

  const toggleStatus = (id: string) => {
    setOffers((prev) => prev.map((o) =>
      o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o,
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Catálogo</p>
            <h1 className="mt-1 text-2xl font-black text-white">Ofertas</h1>
            <p className="mt-1 text-sm text-[#555]">
              Cadastre os produtos e serviços que podem ser comprados com Token APROVA.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {}} className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all">
              Importar ofertas
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all">
              <Plus size={15} strokeWidth={2.5} /> Nova oferta
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {['Oferta', 'Categoria', 'Valor total', 'Parcela', 'Marketplace', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {offers.map((offer) => {
                  const st = STATUS_CFG[offer.status];
                  const installmentAmt = offer.totalValue / offer.installments;
                  const netAmt = offer.totalValue * (1 - TAKE_RATE);
                  return (
                    <tr key={offer.id} className="hover:bg-[#0F0F0F] transition-colors">
                      <td className="py-3.5 pl-5 pr-4">
                        <p className="text-sm font-bold text-white">{offer.name}</p>
                        <p className="text-xs text-[#444] mt-0.5 leading-relaxed">{offer.description.slice(0, 40)}…</p>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#888]">{offer.category}</td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-black text-[#FFD700]">{formatBRL(offer.totalValue)}</p>
                        <p className="text-[10px] text-[#444]">líq. {formatBRL(netAmt)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-black text-white">{offer.installments}x</p>
                        <p className="text-[10px] text-[#555]">{formatBRL(installmentAmt)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {offer.showInMarketplace
                          ? <Eye size={14} className="text-emerald-400" strokeWidth={2} />
                          : <EyeOff size={14} className="text-[#333]" strokeWidth={2} />}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 pr-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleStatus(offer.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                              offer.status === 'active'
                                ? 'border-orange-400/30 text-orange-400 hover:bg-orange-400/10'
                                : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10'
                            }`}>
                            {offer.status === 'active' ? 'Pausar' : 'Ativar'}
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2A2A2A] text-[#555] hover:text-white transition-colors">
                            <Pencil size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showForm && <OfferForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
