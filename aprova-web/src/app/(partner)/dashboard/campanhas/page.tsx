'use client';

import { useState, useRef } from 'react';
import { Plus, Zap, X, Upload, AlertTriangle, ArrowRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import PartnerShell from '../../components/PartnerShell';
import {
  MOCK_CAMPAIGNS, MOCK_PLAN, MOCK_PARTNER, ART_SPECS,
  CAMPAIGN_TYPE_LABELS, type Campaign, type CampaignType, type CampaignStatus,
  formatBRL,
} from '../../components/partner-data';

const MOCK_OFFERS_SIMPLE = ['Combo Ozônio + Recovery', 'Pacote Facial Premium', 'Botox Facial', 'Limpeza de Pele'];
const CATEGORIES = ['Estética', 'Saúde', 'Odontologia', 'Educação', 'Veículos', 'Casa & Reforma'];

const CAMPAIGN_TYPES: Array<{ type: CampaignType; icon: string; desc: string }> = [
  { type: 'banner',            icon: '🖼️', desc: 'Topo do marketplace — máxima visibilidade' },
  { type: 'partner_highlight', icon: '⭐', desc: 'Carrossel de parceiros em destaque'         },
  { type: 'premium_card',      icon: '🃏', desc: 'Acima das ofertas orgânicas'                },
  { type: 'related_offer',     icon: '🔗', desc: 'Dentro do modal de outras ofertas (upsell)' },
  { type: 'sponsored_coupon',  icon: '🏷️', desc: 'Seção de cupons e condições especiais'      },
];

const STATUS_CFG: Record<CampaignStatus, { label: string; cls: string }> = {
  draft:  { label: 'Rascunho', cls: 'text-[#555]      bg-[#1A1A1A]      border-[#2A2A2A]'      },
  active: { label: 'Ativa',    cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  paused: { label: 'Pausada',  cls: 'text-orange-400  bg-orange-400/10  border-orange-400/20'  },
  ended:  { label: 'Encerrada',cls: 'text-[#555]      bg-[#1A1A1A]      border-[#2A2A2A]'      },
};

// ─── Upload slot component ────────────────────────────────────────────────────

function ArtUpload({ label, dimension, required = true }: { label: string; dimension?: string; required?: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setWarning(null);
    // Validate: no video
    if (f.type.startsWith('video/')) {
      setWarning('Vídeos não são permitidos. Use apenas PNG ou JPG.');
      return;
    }
    // Validate: image type
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      setWarning('Formato não suportado. Use PNG ou JPG.');
      return;
    }
    setFile(f);
    // TODO: validate actual pixel dimensions via Image object if needed
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">
          {label} {!required && <span className="normal-case text-[#333]">(opcional)</span>}
        </label>
        {dimension && (
          <span className="text-[10px] font-bold text-[#FFD700]/70">{dimension}</span>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors hover:border-[#FFD700]/40 ${
          file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#2A2A2A] bg-[#0F0F0F]'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
            <span>✓</span> {file.name}
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setWarning(null); }}
              className="ml-1 text-[#555] hover:text-red-400"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div>
            <Upload size={18} className="mx-auto text-[#333] mb-2" strokeWidth={1.5} />
            <p className="text-xs text-[#555]">Clique para selecionar imagem PNG ou JPG</p>
            {dimension && (
              <p className="text-[10px] text-[#333] mt-1">Recomendado: {dimension}</p>
            )}
          </div>
        )}
      </div>
      {warning && (
        <div className="flex items-center gap-2 text-xs font-bold text-red-400">
          <AlertTriangle size={12} strokeWidth={2.5} /> {warning}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

// ─── Campaign form ────────────────────────────────────────────────────────────

function CampaignForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('banner');
  const [offer, setOffer] = useState(MOCK_OFFERS_SIMPLE[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cta, setCta] = useState('Ver oferta');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const specs = ART_SPECS[type];

  const handleSave = async () => {
    setSaving(true);
    // TODO: POST /api/v1/partners/me/campaigns
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 z-50 mx-auto max-w-xl rounded-3xl border border-[#1A1A1A] bg-[#111] overflow-hidden top-4 bottom-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4 flex-shrink-0">
          <h2 className="font-black text-white">Nova Campanha</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 space-y-5">
          {/* Campaign name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Nome da campanha</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Promoção de Verão"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>

          {/* Campaign type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-2">Tipo de campanha</label>
            <div className="grid grid-cols-1 gap-2">
              {CAMPAIGN_TYPES.map((t) => (
                <button key={t.type} onClick={() => setType(t.type)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    type === t.type
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/10'
                      : 'border-[#1A1A1A] bg-[#161616] hover:border-[#2A2A2A]'
                  }`}>
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <p className={`text-sm font-black ${type === t.type ? 'text-[#FFD700]' : 'text-white'}`}>
                      {CAMPAIGN_TYPE_LABELS[t.type]}
                    </p>
                    <p className="text-xs text-[#555]">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Art dimensions guide */}
          <div className="rounded-xl border border-[#FFD700]/15 bg-[#FFD700]/[0.04] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]/60 mb-2">Especificações de arte</p>
            <div className="space-y-1.5 text-sm">
              {specs.desktop  && <div className="flex justify-between"><span className="text-[#888]">Desktop</span><span className="font-black text-[#FFD700]">{specs.desktop}</span></div>}
              {specs.mobile   && <div className="flex justify-between"><span className="text-[#888]">Mobile</span><span className="font-black text-[#FFD700]">{specs.mobile}</span></div>}
              {specs.square   && <div className="flex justify-between"><span className="text-[#888]">Tamanho</span><span className="font-black text-[#FFD700]">{specs.square}</span></div>}
              {specs.logo     && <div className="flex justify-between"><span className="text-[#888]">Logo</span><span className="font-black text-[#FFD700]">{specs.logo}</span></div>}
            </div>
            <p className="text-[10px] text-[#555] mt-2">{specs.note}</p>
            <p className="text-[10px] text-red-400 mt-1 font-bold">🚫 Vídeos não são permitidos. Apenas PNG e JPG.</p>
          </div>

          {/* Art uploads */}
          {type !== 'sponsored_coupon' && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">Upload das artes</p>
              {specs.desktop && <ArtUpload label="Arte Desktop" dimension={specs.desktop} />}
              {specs.mobile  && <ArtUpload label="Arte Mobile"  dimension={specs.mobile}  />}
              {specs.square  && <ArtUpload label="Arte"         dimension={specs.square}  />}
              {specs.logo    && <ArtUpload label="Logo"         dimension={specs.logo}    />}
            </div>
          )}

          {/* Content fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Oferta relacionada</label>
              <select value={offer} onChange={(e) => setOffer(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none appearance-none">
                {MOCK_OFFERS_SIMPLE.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none appearance-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Título do anúncio</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Condição especial para sua margem"
              className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">CTA</label>
              <input value={cta} onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-[#444] mb-1.5">Início</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
            </div>
          </div>

          {/* Preview mockup */}
          <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#444] mb-3">Preview (mockup)</p>
            <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1A00] px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]/60">⚡ Destaque APROVA</p>
                <p className="text-sm font-black text-white mt-0.5">{title || 'Título da sua campanha'}</p>
                <p className="text-xs text-[#888] mt-0.5">{offer}</p>
              </div>
              <span className="flex-shrink-0 rounded-xl bg-[#FFD700] px-3 py-2 text-xs font-black text-[#0A0A0A]">{cta}</span>
            </div>
            <p className="text-[10px] text-[#333] mt-2">Preview simplificado. A exibição real depende do tipo de campanha e dispositivo.</p>
          </div>
        </div>

        <div className="border-t border-[#1A1A1A] px-6 py-4 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3 text-sm font-bold text-[#888] hover:text-white transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !name}
            className={`flex-1 rounded-2xl py-3 text-sm font-black transition-all ${!saving && name ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110' : 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'}`}>
            {saving ? 'Salvando…' : 'Criar campanha'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showForm, setShowForm] = useState(false);
  const hasPlan = MOCK_PLAN.isActive || MOCK_PARTNER.plan === 'premium';

  return (
    <>
    <PartnerShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Marketing</p>
            <h1 className="mt-1 text-2xl font-black text-white">Campanhas Inteligentes APROVA</h1>
            <p className="mt-1 text-sm text-[#555]">
              Crie anúncios para aparecer em áreas premium do marketplace e vender mais.
            </p>
          </div>
          {hasPlan && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all">
              <Plus size={15} strokeWidth={2.5} /> Nova campanha
            </button>
          )}
        </div>

        {/* No plan — upsell */}
        {!hasPlan && (
          <div className="rounded-3xl border border-[#FFD700]/20 bg-[#1A1A00] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20">
              <Zap size={22} className="text-[#FFD700]" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">
              {MOCK_PARTNER.hasCompletedSale
                ? 'Você ainda não ativou as Campanhas Inteligentes APROVA.'
                : 'Disponível após sua primeira venda APROVA.'}
            </h2>
            <p className="text-sm text-[#888] max-w-md mx-auto mb-6">
              {MOCK_PARTNER.hasCompletedSale
                ? 'Apareça em áreas premium do marketplace: banners, cupons, parceiros em destaque, categorias e ofertas relacionadas.'
                : 'Para facilitar o início, o plano de R$ 197/mês só poderá ser ativado depois que você tiver recebíveis no sistema.'}
            </p>
            <Link href="/dashboard/plano"
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black transition-all ${
                MOCK_PARTNER.hasCompletedSale
                  ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                  : 'cursor-not-allowed bg-[#1A1A1A] text-[#444] border border-[#2A2A2A]'
              }`}
            >
              {MOCK_PARTNER.hasCompletedSale
                ? <><Zap size={15} strokeWidth={2.5} /> Ativar campanhas por R$ 197/mês</>
                : 'Ativação disponível após primeira venda'}
            </Link>
          </div>
        )}

        {/* Campaign types reference */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4">Espaços de anúncio disponíveis</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPAIGN_TYPES.map((t) => {
              const specs = ART_SPECS[t.type];
              return (
                <div key={t.type} className={`rounded-2xl border p-5 ${hasPlan ? 'border-[#1A1A1A] bg-[#111]' : 'border-[#1A1A1A] bg-[#0F0F0F] opacity-60'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="text-sm font-black text-white">{CAMPAIGN_TYPE_LABELS[t.type]}</p>
                      <p className="text-xs text-[#555]">{t.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    {specs.desktop && <div className="flex justify-between text-[#666]"><span>Desktop</span><span className="font-bold text-[#888]">{specs.desktop}</span></div>}
                    {specs.mobile  && <div className="flex justify-between text-[#666]"><span>Mobile</span><span className="font-bold text-[#888]">{specs.mobile}</span></div>}
                    {specs.square  && <div className="flex justify-between text-[#666]"><span>Tamanho</span><span className="font-bold text-[#888]">{specs.square}</span></div>}
                    {specs.logo    && <div className="flex justify-between text-[#666]"><span>Logo</span><span className="font-bold text-[#888]">{specs.logo}</span></div>}
                  </div>
                  <p className="text-[10px] text-[#333] mt-2">{specs.note}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] font-bold text-red-400">🚫 Vídeos não são permitidos em nenhum espaço. Apenas PNG e JPG.</p>
        </div>

        {/* Campaigns table (if any) */}
        {hasPlan && (
          <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <BarChart2 size={40} className="text-[#2A2A2A]" strokeWidth={1.5} />
                <p className="font-black text-white">Nenhuma campanha ainda</p>
                <p className="text-sm text-[#555]">Crie sua primeira campanha para aparecer no marketplace.</p>
                <button onClick={() => setShowForm(true)} className="mt-2 flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all">
                  <Plus size={15} strokeWidth={2.5} /> Nova campanha
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]">
                      {['Campanha', 'Tipo', 'Status', 'Período', 'Impressões', 'Cliques', 'Tokens', 'Vendas', 'Receita', ''].map((h) => (
                        <th key={h} className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#444] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]">
                    {campaigns.map((c) => {
                      const st = STATUS_CFG[c.status];
                      return (
                        <tr key={c.id} className="hover:bg-[#0F0F0F] transition-colors">
                          <td className="py-3.5 pl-5 pr-4 text-sm font-bold text-white">{c.name}</td>
                          <td className="py-3.5 px-4 text-xs text-[#888]">{CAMPAIGN_TYPE_LABELS[c.type]}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#888]">{c.startDate} → {c.endDate}</td>
                          <td className="py-3.5 px-4 text-sm font-bold text-white">{c.impressions.toLocaleString('pt-BR')}</td>
                          <td className="py-3.5 px-4 text-sm font-bold text-white">{c.clicks}</td>
                          <td className="py-3.5 px-4 text-sm font-bold text-white">{c.tokens}</td>
                          <td className="py-3.5 px-4 text-sm font-bold text-[#FFD700]">{c.sales}</td>
                          <td className="py-3.5 px-4 text-sm font-bold text-emerald-400">{formatBRL(c.revenue)}</td>
                          <td className="py-3.5 px-4 pr-5">
                            <button className="text-xs font-bold text-[#555] hover:text-[#FFD700] transition-colors">Ver →</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </PartnerShell>
    {showForm && <CampaignForm onClose={() => setShowForm(false)} />}
    </>
  );
}
