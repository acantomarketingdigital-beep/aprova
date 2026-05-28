'use client';

import { useState } from 'react';
import { Plus, Tag, Zap, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PartnerNav from '../../components/PartnerNav';
import {
  MOCK_COUPONS, MOCK_PLAN, MOCK_PARTNER,
  COUPON_BENEFIT_LABELS, type Coupon, type CouponBenefit,
  formatBRL,
} from '../../components/partner-data';

const MOCK_OFFERS_SIMPLE = ['Combo Ozônio + Recovery', 'Pacote Facial Premium', 'Botox Facial', 'Limpeza de Pele'];

const BENEFIT_COLORS: Record<CouponBenefit, string> = {
  free_eval:       'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  bonus_session:   'text-sky-400     bg-sky-400/10     border-sky-400/20',
  return_included: 'text-violet-400  bg-violet-400/10  border-violet-400/20',
  discount_brl:    'text-[#FFD700]   bg-[#FFD700]/10   border-[#FFD700]/20',
  discount_pct:    'text-[#FFD700]   bg-[#FFD700]/10   border-[#FFD700]/20',
  gift:            'text-rose-400    bg-rose-400/10    border-rose-400/20',
  priority:        'text-amber-400   bg-amber-400/10   border-amber-400/20',
};

const STATUS_CFG = {
  active: { label: 'Ativo',   cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  paused: { label: 'Pausado', cls: 'text-orange-400  bg-orange-400/10  border-orange-400/20'  },
  ended:  { label: 'Encerrado',cls:'text-[#555]       bg-[#1A1A1A]      border-[#2A2A2A]'     },
};

function CouponForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [benefit, setBenefit] = useState<CouponBenefit>('free_eval');
  const [desc, setDesc] = useState('');
  const [offer, setOffer] = useState(MOCK_OFFERS_SIMPLE[0]);
  const [expires, setExpires] = useState('');
  const [maxUses, setMaxUses] = useState(100);
  const [showInMp, setShowInMp] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: POST /api/v1/partners/me/coupons
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  };

  const hasPlan = MOCK_PLAN.isActive || MOCK_PARTNER.plan === 'premium';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 z-50 mx-auto max-w-lg rounded-3xl border border-[#1A1A1A] bg-[#111] overflow-hidden top-1/2 -translate-y-1/2 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4">
          <h2 className="font-black text-white">Novo Cupom</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] scrollbar-hide space-y-4">
          {!hasPlan && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-sm font-bold text-amber-400 mb-1">Cupom salvo como rascunho</p>
              <p className="text-xs text-[#888]">Cupons patrocinados fazem parte das Campanhas Inteligentes APROVA. Ative o plano para exibir no marketplace.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Nome interno</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Avaliação Grátis Verão"
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Código do cupom</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VIVA10"
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm font-mono text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 tracking-widest transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Tipo de benefício</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(COUPON_BENEFIT_LABELS) as [CouponBenefit, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setBenefit(key)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold text-left transition-all ${
                    benefit === key
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700]'
                      : 'border-[#1A1A1A] bg-[#161616] text-[#555] hover:border-[#2A2A2A] hover:text-white'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Descrição para o cliente</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              placeholder="Ex: Avaliação gratuita em qualquer procedimento estético"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 resize-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Oferta vinculada</label>
              <select value={offer} onChange={(e) => setOffer(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 appearance-none">
                {MOCK_OFFERS_SIMPLE.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Validade</label>
              <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Limite de uso</label>
            <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Exibir no marketplace</p>
              <p className="text-xs text-[#444]">{hasPlan ? 'Visível para trabalhadores' : 'Requer Plano de Anúncios'}</p>
            </div>
            <button onClick={() => hasPlan && setShowInMp((v) => !v)} disabled={!hasPlan}
              className={`relative w-11 h-6 rounded-full border transition-all ${showInMp && hasPlan ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${showInMp && hasPlan ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="border-t border-[#1A1A1A] px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3 text-sm font-bold text-[#888] hover:text-white transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !name || !code}
            className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all ${!saving && name && code ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110' : 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'}`}>
            {saving ? 'Salvando…' : 'Salvar cupom'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [showForm, setShowForm] = useState(false);
  const hasPlan = MOCK_PLAN.isActive || MOCK_PARTNER.plan === 'premium';

  const toggleStatus = (id: string) => {
    setCoupons((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c,
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Marketing</p>
            <h1 className="mt-1 text-2xl font-black text-white">Cupons e Condições Especiais</h1>
            <p className="mt-1 text-sm text-[#555]">
              Crie benefícios para aumentar conversão sem depender apenas de desconto.
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all">
            <Plus size={15} strokeWidth={2.5} /> Novo cupom
          </button>
        </div>

        {/* Plan upsell */}
        {!hasPlan && (
          <div className="rounded-2xl border border-[#FFD700]/20 bg-[#1A1A00] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Zap size={20} className="text-[#FFD700] flex-shrink-0" strokeWidth={2} />
              <div>
                <p className="text-sm font-black text-white">Cupons patrocinados fazem parte das Campanhas Inteligentes APROVA.</p>
                <p className="text-xs text-[#888] mt-0.5">Ative o plano para exibir seus cupons no marketplace para trabalhadores com margem disponível.</p>
              </div>
            </div>
            <Link href="/dashboard/plano" className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all whitespace-nowrap">
              Ativar plano <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>
        )}

        {/* Benefit type cards */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-3">Tipos de benefício disponíveis</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(COUPON_BENEFIT_LABELS) as [CouponBenefit, string][]).map(([key, label]) => (
              <span key={key} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${BENEFIT_COLORS[key]}`}>
                <Tag size={10} strokeWidth={3} /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Coupons table */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {['Cupom', 'Benefício', 'Oferta', 'Validade', 'Usos', 'Tokens', 'Vendas', 'Status', ''].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#444] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {coupons.map((c) => {
                  const st = STATUS_CFG[c.status];
                  const bc = BENEFIT_COLORS[c.benefit];
                  return (
                    <tr key={c.id} className="hover:bg-[#0F0F0F] transition-colors">
                      <td className="py-3.5 pl-5 pr-4">
                        <p className="text-sm font-bold text-white">{c.name}</p>
                        <p className="font-mono text-[10px] text-[#FFD700] tracking-widest">{c.code}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${bc}`}>
                          {COUPON_BENEFIT_LABELS[c.benefit]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#888]">{c.offer}</td>
                      <td className="py-3.5 px-4 text-xs text-[#888]">{c.expiresAt}</td>
                      <td className="py-3.5 px-4 text-sm font-bold text-white">{c.usedCount}<span className="text-[#444]">/{c.maxUses}</span></td>
                      <td className="py-3.5 px-4 text-sm font-bold text-white">{c.tokensGenerated}</td>
                      <td className="py-3.5 px-4 text-sm font-bold text-[#FFD700]">{c.salesAttribued}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 pr-5">
                        <button onClick={() => toggleStatus(c.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            c.status === 'active'
                              ? 'border-orange-400/30 text-orange-400 hover:bg-orange-400/10'
                              : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10'
                          }`}>
                          {c.status === 'active' ? 'Pausar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showForm && <CouponForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
