'use client';

import { useState } from 'react';
import { Check, X, Zap, Lock, CheckCircle2 } from 'lucide-react';
import PartnerShell from '../../components/PartnerShell';
import { MOCK_PARTNER, MOCK_PLAN, formatBRL } from '../../components/partner-data';

const FREE_FEATURES = [
  { label: 'Vender pelo APROVA',           ok: true  },
  { label: 'Pagar 12% por venda concluída', ok: true  },
  { label: 'Receber tokens dos clientes',   ok: true  },
  { label: 'Aparecer organicamente',        ok: true  },
  { label: 'Banner principal do marketplace', ok: false },
  { label: 'Parceiro em destaque',          ok: false },
  { label: 'Card premium de oferta',        ok: false },
  { label: 'Cupons patrocinados',           ok: false },
  { label: 'Ofertas relacionadas/upsell',   ok: false },
  { label: 'Prioridade em categorias',      ok: false },
  { label: 'Relatório de performance',      ok: false },
];

const PREMIUM_FEATURES = [
  { label: 'Tudo do Plano Gratuito',         ok: true },
  { label: 'Banner principal do marketplace', ok: true },
  { label: 'Parceiro em destaque',            ok: true },
  { label: 'Card premium de oferta',          ok: true },
  { label: 'Cupons e condições especiais',    ok: true },
  { label: 'Ofertas relacionadas/upsell',     ok: true },
  { label: 'Prioridade em categorias',        ok: true },
  { label: 'Relatório de performance',        ok: true },
  { label: 'Exposição para usuários com margem disponível', ok: true },
  { label: 'Cobrança descontada dos recebíveis', ok: true },
];

function ConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!accepted) return;
    setLoading(true);
    // TODO: POST /api/v1/partners/me/plan/activate
    await new Promise((r) => setTimeout(r, 1200));
    onConfirm();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 z-50 mx-auto max-w-lg rounded-3xl border border-[#1A1A1A] bg-[#111] p-7 top-1/2 -translate-y-1/2 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
          Confirmação
        </div>
        <h2 className="text-xl font-black text-white mb-3">
          Confirmar ativação das Campanhas Inteligentes
        </h2>
        <p className="text-sm text-[#888] leading-relaxed mb-5">
          Ao ativar, sua empresa passa a ter acesso aos espaços de anúncio do marketplace. O valor de{' '}
          <span className="font-black text-[#FFD700]">R$ 197/mês</span> será descontado dos repasses futuros,
          além da taxa de 12% sobre vendas concluídas.
        </p>
        <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-4 mb-5 space-y-2 text-sm text-[#666]">
          <div className="flex justify-between"><span>Taxa por venda</span><span className="font-bold text-white">12%</span></div>
          <div className="flex justify-between"><span>Plano de anúncios</span><span className="font-bold text-[#FFD700]">R$ 197/mês</span></div>
          <div className="flex justify-between"><span>Forma de cobrança</span><span className="font-bold text-white">Desconto em recebíveis</span></div>
        </div>
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#FFD700]"
          />
          <span className="text-sm text-[#888]">
            Li e aceito as regras de cobrança e exibição das campanhas inteligentes APROVA.
          </span>
        </label>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3.5 text-sm font-bold text-[#888] hover:text-white transition-all">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!accepted || loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition-all ${
              accepted && !loading
                ? 'bg-[#FFD700] text-[#0A0A0A] hover:brightness-110'
                : 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'
            }`}
          >
            {loading ? 'Ativando…' : 'Confirmar ativação'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function PlanoPage() {
  const [showModal, setShowModal] = useState(false);
  const [activated, setActivated] = useState(MOCK_PLAN.isActive);
  const [toast, setToast] = useState(false);

  const { hasCompletedSale } = MOCK_PARTNER;

  const handleConfirm = () => {
    setShowModal(false);
    setActivated(true);
    setToast(true);
    setTimeout(() => setToast(false), 5000);
  };

  if (activated) {
    return (
      <PartnerShell maxW="max-w-4xl" py="py-10">
          <div className="rounded-3xl border border-[#FFD700]/25 bg-[#1A1A00] p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={24} className="text-[#FFD700]" strokeWidth={2} />
              <h1 className="text-2xl font-black text-[#FFD700]">Campanhas Inteligentes — Ativo</h1>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Próxima cobrança', value: '01/07/2026' },
                { label: 'Valor', value: formatBRL(197) + '/mês' },
                { label: 'Forma de cobrança', value: 'Desc. em recebíveis' },
              ].map((i) => (
                <div key={i.label} className="rounded-xl border border-[#FFD700]/15 bg-[#FFD700]/[0.05] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]/60">{i.label}</p>
                  <p className="mt-1 text-sm font-black text-[#FFD700]">{i.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#888] mb-4">
              Histórico de cobranças — TODO: GET /api/v1/partners/me/plan/billing
            </p>
            <button
              onClick={() => setActivated(false)}
              className="text-xs font-bold text-[#555] hover:text-red-400 transition-colors"
            >
              Cancelar renovação →
            </button>
          </div>
      </PartnerShell>
    );
  }

  return (
    <>
    <PartnerShell maxW="max-w-5xl" py="py-10" gap="gap-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700] mb-2">Crescimento</p>
          <h1 className="text-3xl font-black text-white">Plano de Anúncios</h1>
          <p className="mt-3 text-sm text-[#555]">
            Apareça nos espaços premium do marketplace e venda mais para trabalhadores com margem disponível.
          </p>
        </div>

        {/* Comparison */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Free */}
          <div className="rounded-3xl border border-[#1A1A1A] bg-[#111] p-6">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-1">Plano atual</p>
              <h2 className="text-xl font-black text-white">Parceiro Gratuito</h2>
              <p className="text-3xl font-black text-[#555] mt-1">Grátis</p>
              <p className="text-xs text-[#444] mt-0.5">+ 12% por venda concluída</p>
            </div>
            <div className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  {f.ok
                    ? <Check size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                    : <X    size={14} className="text-[#333]     flex-shrink-0" strokeWidth={2.5} />}
                  <span className={`text-sm ${f.ok ? 'text-[#CCC]' : 'text-[#444] line-through'}`}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div className="relative rounded-3xl border border-[#FFD700]/30 bg-[#1A1A00] p-6 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full border border-[#FFD700]/30 bg-[#FFD700] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">
                Recomendado
              </span>
            </div>
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700] mb-1">Mais exposição</p>
              <h2 className="text-xl font-black text-white">Campanhas Inteligentes</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#FFD700]">R$ 197</span>
                <span className="text-[#888] text-sm">/mês</span>
              </div>
              <p className="text-xs text-[#555] mt-0.5">+ 12% por venda concluída</p>
            </div>
            <div className="space-y-2.5 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <Zap size={13} className="text-[#FFD700] flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-sm text-[#CCC]">{f.label}</span>
                </div>
              ))}
            </div>

            {!hasCompletedSale ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <p className="text-sm font-black text-amber-400 mb-1">Disponível após sua primeira venda APROVA</p>
                <p className="text-xs text-[#666] leading-relaxed">
                  Para facilitar sua entrada, o plano de R$ 197/mês só será cobrado quando sua operação já tiver vendas no sistema. Assim o valor pode ser descontado dos seus recebíveis.
                </p>
                <button disabled className="mt-4 w-full cursor-not-allowed rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] py-3 text-sm font-black text-[#444]">
                  <Lock size={14} className="inline mr-2" />
                  Aguardando primeira venda
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-2xl bg-[#FFD700] py-4 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_24px_rgba(255,215,0,0.3)]"
              >
                <Zap size={15} className="inline mr-2" strokeWidth={2.5} />
                Ativar Campanhas Inteligentes por R$ 197/mês
              </button>
            )}
          </div>
        </div>

        {/* Charge method explanation */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] p-6">
          <h2 className="text-base font-black text-white mb-3">Como funciona a cobrança</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { step: '1', title: 'Você vende', desc: 'O cliente usa o token APROVA e a venda é concluída.' },
              { step: '2', title: 'Repasse APROVA', desc: 'Ao repassar o valor, o APROVA desconta 12% + R$ 197 do plano (se ativo).' },
              { step: '3', title: 'Você recebe', desc: 'O saldo líquido é transferido para sua conta no fechamento da folha.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-xs font-black text-[#0A0A0A]">{s.step}</span>
                <div>
                  <p className="font-black text-white">{s.title}</p>
                  <p className="text-xs text-[#555] mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#333]">
            Valores finais podem variar conforme fechamento da folha e validação dos contratos.
          </p>
        </div>

    </PartnerShell>
    {showModal && (
      <ConfirmModal onClose={() => setShowModal(false)} onConfirm={handleConfirm} />
    )}
    {toast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={2.5} />
        <span className="text-emerald-400 text-sm font-bold">Campanhas Inteligentes ativadas com sucesso!</span>
      </div>
    )}
    </>
  );
}
