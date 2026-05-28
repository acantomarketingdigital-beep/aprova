'use client';

import { useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, MessageCircle, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from './ProductCard';

// ─── Categorias complementares para upsell (evitar matches aleatórios) ─────────
const COMPLEMENTARY: Record<string, string[]> = {
  estetica:    ['saude', 'odonto'],
  odonto:      ['saude', 'estetica'],
  saude:       ['odonto', 'estetica'],
  construcao:  ['veiculos', 'tecnologia'],
  veiculos:    ['tecnologia'],
  educacao:    ['tecnologia'],
  tecnologia:  ['educacao'],
  viagens:     ['estetica', 'saude'],
};

// ─── Lógica de ofertas relacionadas ────────────────────────────────────────────
// P1: mesmo parceiro  P2: mesma categoria  P3: categoria complementar  P4: featured geral
// Só exibe se parcela ≤ limite do usuário (sem restrição de 30% aqui — é o total disponível)
function getRelatedOffers(primary: Product, all: Product[], userLimit: number) {
  const complements = COMPLEMENTARY[primary.category] ?? [];

  const affordable = all.filter(
    (p) => p.id !== primary.id && p.valorTotal / p.installments <= userLimit * 0.3,
  );

  const scored = affordable.map((p) => ({
    product: p,
    score:
      (p.partner === primary.partner ? 8 : 0) +
      (p.category === primary.category ? 4 : 0) +
      (complements.includes(p.category) ? 2 : 0) +
      (p.isFeatured ? 1 : 0),
  }));

  // Só mostrar se tiver score > 0 (evitar matches completamente aleatórios)
  const relevant = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return relevant.slice(0, 3).map((s) => s.product);
}

// Decide o título/subtítulo da seção de upsell conforme a relação dos itens
function getUpsellHeader(primary: Product, related: Product[]) {
  if (related.length === 0) return null;
  const samePartner = related.every((r) => r.partner === primary.partner);
  if (samePartner) {
    return {
      title: 'Aproveite sua visita',
      subtitle: 'Estes serviços da mesma clínica também cabem na sua margem.',
    };
  }
  return {
    title: 'Outras ofertas que cabem na sua margem',
    subtitle: 'Selecionamos opções disponíveis para sua margem atual.',
  };
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Benefícios fixos — sem duplicatas ─────────────────────────────────────────
const BASE_BENEFITS = [
  'Sem cartão de crédito',
  'Sem entrada',
  'Desconto direto na folha',
  'Parceiro verificado APROVA',
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface OfferDetailModalProps {
  product: Product;
  allProducts: Product[];
  userLimit: number;
  packageItems: Product[];
  onClose: () => void;
  onGerarToken: () => void;
  onAddToPackage: (product: Product) => void;
  onRemoveFromPackage: (id: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OfferDetailModal({
  product,
  allProducts,
  userLimit,
  packageItems,
  onClose,
  onGerarToken,
  onAddToPackage,
  onRemoveFromPackage,
}: OfferDetailModalProps) {
  const installmentPrice = product.valorTotal / product.installments;
  const cabeMargem = installmentPrice <= userLimit * 0.3;
  const margemAposCompra = Math.max(0, userLimit - installmentPrice);

  // Pacote = oferta principal + itens adicionados
  const allPackageItems = [product, ...packageItems];
  const packageMonthly = allPackageItems.reduce((s, p) => s + p.valorTotal / p.installments, 0);
  const margemAposPacote = Math.max(0, userLimit - packageMonthly);
  const hasPackage = packageItems.length > 0;

  const related = useMemo(
    () => getRelatedOffers(product, allProducts, userLimit),
    [product, allProducts, userLimit],
  );

  const upsellHeader = useMemo(
    () => getUpsellHeader(product, related),
    [product, related],
  );

  const isInPackage = (id: string) => packageItems.some((p) => p.id === id);

  const ctaLabel = hasPackage ? 'Gerar token do pacote' : 'Gerar token desta oferta';

  // Barra de progresso: quanto da margem total disponível esta compra representa
  const progressPercent = Math.min((installmentPrice / userLimit) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — mobile: full screen, desktop: modal centralizado */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94vh] flex-col overflow-hidden rounded-t-3xl border-t border-white/[0.08] bg-[#161616] sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
        {/* Handle (mobile) */}
        <div className="flex flex-shrink-0 justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          <div className="px-5 pb-8 pt-3 sm:px-8 sm:pt-6">

            {/* ── Cabeçalho ── */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                {product.isFeatured && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                    ⭐ Destaque APROVA
                  </span>
                )}
                <h2 className="text-2xl font-black leading-tight text-white">{product.title}</h2>
                <p className="mt-0.5 text-sm font-semibold text-[#666]">{product.partner}</p>
                <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${product.accent}`}>
                  {product.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1F1F1F] text-[#555] transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Cover ── */}
            <div className={`mb-5 flex h-44 items-center justify-center rounded-2xl ${product.bgGradient}`}>
              <span className="text-8xl">{product.emoji}</span>
            </div>

            {/* ── Bloco de preço ── */}
            <div className="mb-4 grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1A1A]">
              <div className="flex flex-col gap-0.5 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Total</p>
                <p className="text-base font-black text-white">{formatBRL(product.valorTotal)}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Parcela</p>
                <p className="text-xl font-black text-[#FFD700]">{formatBRL(installmentPrice)}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Parcelas</p>
                <p className="text-base font-black text-white">{product.installments}x</p>
              </div>
            </div>

            {/* ── Simulação de margem — linguagem simplificada ── */}
            <div className={`mb-4 rounded-2xl border p-4 ${cabeMargem ? 'border-emerald-500/25 bg-emerald-950/25' : 'border-rose-500/25 bg-rose-950/25'}`}>
              <div className={`mb-3 flex items-center gap-2 font-black ${cabeMargem ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cabeMargem
                  ? <CheckCircle2 size={16} strokeWidth={2.5} />
                  : <AlertCircle size={16} strokeWidth={2.5} />}
                <span className="text-sm">
                  {cabeMargem
                    ? 'Esta oferta cabe na sua margem atual.'
                    : 'Esta oferta excede sua margem disponível.'}
                </span>
              </div>

              {/* Textos simples — sem jargão técnico de "30%" */}
              <div className="mb-3 space-y-1 text-sm text-[#888]">
                <p>
                  Impacto desta compra:{' '}
                  <span className="font-black text-white">{formatBRL(installmentPrice)}/mês</span>{' '}
                  da sua margem disponível.
                </p>
                <p>
                  Você ainda ficará com{' '}
                  <span className="font-black text-[#FFD700]">{formatBRL(margemAposCompra)}</span>{' '}
                  disponíveis.
                </p>
              </div>

              {/* Barra visual — label sem "máx 30%" */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold text-[#555]">
                  Uso da margem disponível
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cabeMargem ? 'bg-emerald-400' : 'bg-rose-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Benefícios fixos — 4 itens, sem duplicatas ── */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              {BASE_BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-3 py-2.5">
                  <span className="text-sm text-[#FFD700]">✓</span>
                  <span className="text-xs font-semibold leading-tight text-[#999]">{b}</span>
                </div>
              ))}
            </div>

            {/* ── Resumo do pacote (exibe após "Adicionar ao pacote") ── */}
            {hasPackage && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-[#FFD700]/25 bg-[#1A1A00]">
                {/* Header do pacote */}
                <div className="flex items-center gap-2 border-b border-[#FFD700]/10 px-4 py-3">
                  <ShoppingBag size={15} className="text-[#FFD700]" strokeWidth={2.5} />
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#FFD700]">
                    Seu pacote APROVA
                  </h3>
                </div>

                {/* Itens do pacote */}
                <div className="divide-y divide-white/[0.04] px-4">
                  {/* Oferta principal */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{product.emoji}</span>
                      <span className="truncate text-sm font-semibold text-[#CCC]">{product.title}</span>
                    </div>
                    <span className="flex-shrink-0 text-sm font-black text-white">
                      {product.installments}x {formatBRL(installmentPrice)}
                    </span>
                  </div>
                  {/* Itens adicionados via upsell */}
                  {packageItems.map((item) => {
                    const itemInstallment = item.valorTotal / item.installments;
                    return (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{item.emoji}</span>
                          <span className="truncate text-sm font-semibold text-[#CCC]">{item.title}</span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="text-sm font-black text-white">
                            {item.installments}x {formatBRL(itemInstallment)}
                          </span>
                          <button
                            onClick={() => onRemoveFromPackage(item.id)}
                            className="text-[#555] transition-colors hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totais */}
                <div className="border-t border-[#FFD700]/10 bg-[#FFD700]/[0.04] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#888]">Total do pacote</span>
                    <span className="text-lg font-black text-[#FFD700]">
                      {product.installments}x de {formatBRL(packageMonthly)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#666]">
                    Após este pacote, você ainda terá{' '}
                    <span className="font-black text-white">{formatBRL(margemAposPacote)}</span>{' '}
                    disponíveis.
                  </p>
                </div>
              </div>
            )}

            {/* ── CTAs ── */}
            <div className="mb-7 flex flex-col gap-3">
              <button
                onClick={onGerarToken}
                disabled={!cabeMargem}
                className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-wider transition-all
                  ${cabeMargem
                    ? 'bg-[#FFD700] text-[#0D0D0D] shadow-[0_0_24px_rgba(255,215,0,0.35)] hover:brightness-110'
                    : 'cursor-not-allowed bg-[#2A2A2A] text-[#444]'}`}
              >
                <ShoppingBag size={16} strokeWidth={2.5} />
                {ctaLabel}
              </button>
              {/* TODO: integrar com WhatsApp/link do parceiro via GET /api/v1/partners/:id */}
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] py-3.5 text-sm font-bold text-[#888] transition-colors hover:border-white/20 hover:text-white">
                <MessageCircle size={15} strokeWidth={2} />
                Falar com parceiro
              </button>
            </div>

            {/* ── Seção de upsell (título dinâmico conforme relação dos itens) ── */}
            {upsellHeader && (
              <div>
                <div className="mb-4 border-t border-white/[0.06] pt-5">
                  <h3 className="text-base font-black text-white">{upsellHeader.title}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#555]">{upsellHeader.subtitle}</p>
                </div>
                <div className="space-y-3">
                  {related.map((offer) => {
                    const inPkg = isInPackage(offer.id);
                    const offerInstallment = offer.valorTotal / offer.installments;
                    return (
                      <div
                        key={offer.id}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition-all
                          ${inPkg
                            ? 'border-[#FFD700]/30 bg-[#1A1A00]'
                            : 'border-white/[0.06] bg-[#1A1A1A] hover:border-white/[0.12]'}`}
                      >
                        {/* Emoji thumb */}
                        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl ${offer.bgGradient}`}>
                          {offer.emoji}
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="truncate text-sm font-black text-white">{offer.title}</p>
                            {offer.isFeatured && <span className="flex-shrink-0 text-xs">⭐</span>}
                          </div>
                          <p className="text-xs font-semibold text-[#555]">{offer.partner}</p>
                          <p className="mt-0.5 text-sm font-black text-[#FFD700]">
                            {offer.installments}x de {formatBRL(offerInstallment)}
                          </p>
                          <p className="text-[10px] font-semibold text-emerald-400">
                            ✓ Também cabe na sua margem
                          </p>
                        </div>
                        {/* Botão adicionar/remover */}
                        <button
                          onClick={() =>
                            inPkg ? onRemoveFromPackage(offer.id) : onAddToPackage(offer)
                          }
                          className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition-all
                            ${inPkg
                              ? 'border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700]'
                              : 'border-white/[0.08] bg-[#222] text-[#888] hover:border-[#FFD700]/30 hover:text-[#FFD700]'}`}
                        >
                          {inPkg ? (
                            <>✓ Adicionado</>
                          ) : (
                            <><Plus size={13} strokeWidth={3} /> Adicionar ao pacote</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-5 text-center text-xs font-semibold text-[#444]">
                  Aproveite sua margem para montar um pacote completo
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
