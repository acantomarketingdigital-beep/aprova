'use client';

import { useMemo, useState } from 'react';
import { X, CheckCircle2, AlertCircle, MessageCircle, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from './ProductCard';

// ─── Lógica de ofertas relacionadas ────────────────────────────────────────────
// Prioridade: mesmo parceiro > mesma categoria > parceiro pagante (isFeatured)
// Só exibe se a parcela couber na margem disponível do usuário
function getRelatedOffers(primary: Product, all: Product[], userLimit: number): Product[] {
  return all
    .filter((p) => p.id !== primary.id && p.valorTotal / p.installments <= userLimit * 0.3)
    .sort((a, b) => {
      const score = (p: Product) =>
        (p.partner === primary.partner ? 4 : 0) +
        (p.category === primary.category ? 2 : 0) +
        (p.isFeatured ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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
  const margemMaxima = userLimit * 0.3;
  const cabeMargem = installmentPrice <= margemMaxima;

  // Pacote = oferta principal + itens adicionados
  const allPackageItems = [product, ...packageItems];
  const packageMonthly = allPackageItems.reduce((s, p) => s + p.valorTotal / p.installments, 0);
  const margemRestante = Math.max(0, userLimit - packageMonthly);
  const hasPackage = packageItems.length > 0;

  const related = useMemo(
    () => getRelatedOffers(product, allProducts, userLimit),
    [product, allProducts, userLimit],
  );

  const isInPackage = (id: string) => packageItems.some((p) => p.id === id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — mobile: full screen, desktop: centered modal */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94vh] flex-col overflow-hidden rounded-t-3xl border-t border-white/[0.08] bg-[#161616] sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {/* Drag handle (mobile only) */}
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

            {/* ── Simulação de margem ── */}
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
              <div className="space-y-1.5 text-sm text-[#888]">
                <p>
                  Esta compra compromete{' '}
                  <span className="font-black text-white">{formatBRL(installmentPrice)}/mês</span>{' '}
                  da sua margem.
                </p>
                <p>
                  Após esta compra, você ainda terá{' '}
                  <span className="font-black text-[#FFD700]">
                    {formatBRL(Math.max(0, userLimit - installmentPrice))}
                  </span>{' '}
                  disponíveis.
                </p>
              </div>
              {/* Barra de progresso da margem */}
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-[#555]">
                  <span>Uso da margem (máx 30%)</span>
                  <span>{Math.min(Math.round((installmentPrice / margemMaxima) * 100), 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cabeMargem ? 'bg-emerald-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min((installmentPrice / margemMaxima) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Benefícios ── */}
            <div className="mb-5 grid grid-cols-2 gap-2">
              {[
                'Sem cartão de crédito',
                'Sem entrada',
                'Pagamento direto na folha',
                'Parceiro verificado APROVA',
                ...product.details,
              ].slice(0, 6).map((b) => (
                <div key={b} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-3 py-2.5">
                  <span className="text-sm text-[#FFD700]">✓</span>
                  <span className="text-xs font-semibold leading-tight text-[#999]">{b}</span>
                </div>
              ))}
            </div>

            {/* ── Resumo do pacote ── */}
            {hasPackage && (
              <div className="mb-5 rounded-2xl border border-[#FFD700]/25 bg-[#1A1A00] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#FFD700]" strokeWidth={2.5} />
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#FFD700]">
                    Seu pacote APROVA
                  </h3>
                </div>
                <div className="space-y-2">
                  {/* Oferta principal (sempre inclusa) */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#CCC]">{product.title}</span>
                    <span className="font-black text-white">
                      {product.installments}x de {formatBRL(installmentPrice)}
                    </span>
                  </div>
                  {/* Itens adicionados */}
                  {packageItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#CCC]">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white">
                          {item.installments}x de {formatBRL(item.valorTotal / item.installments)}
                        </span>
                        <button
                          onClick={() => onRemoveFromPackage(item.id)}
                          className="text-[#555] transition-colors hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-white/[0.08] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#555]">Total mensal do pacote</span>
                    <span className="text-lg font-black text-[#FFD700]">
                      {product.installments}x de {formatBRL(packageMonthly)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#555]">
                    Após este pacote, você ainda terá{' '}
                    <span className="font-black text-white">{formatBRL(margemRestante)}</span>{' '}
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
                {hasPackage ? 'Gerar token do pacote' : 'Gerar token de compra'}
              </button>
              {/* TODO: integrar com WhatsApp/contato do parceiro via API */}
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] py-3.5 text-sm font-bold text-[#888] transition-colors hover:border-white/20 hover:text-white">
                <MessageCircle size={15} strokeWidth={2} />
                Falar com parceiro
              </button>
            </div>

            {/* ── Seção de upsell ── */}
            {related.length > 0 && (
              <div>
                <div className="mb-4 border-t border-white/[0.06] pt-5">
                  <h3 className="text-base font-black text-white">Aproveite sua visita</h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#555]">
                    Estes serviços também cabem na sua margem.
                  </p>
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
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-black text-white">{offer.title}</p>
                            {offer.isFeatured && (
                              <span className="flex-shrink-0 text-xs">⭐</span>
                            )}
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
                            <><span>✓</span> Adicionado</>
                          ) : (
                            <><Plus size={13} strokeWidth={3} /> Adicionar ao pacote</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Texto motivacional final */}
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
