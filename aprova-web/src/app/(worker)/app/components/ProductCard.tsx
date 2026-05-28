'use client';

import { ArrowRight } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  partner: string;
  category: string;
  description: string;
  valorTotal: number;
  installments: number;
  emoji: string;
  bgGradient: string;
  accent: string;
  badge: string;
  details: string[];
  destaque?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  'Mais buscado': 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  'Flash sale':   'bg-rose-400/20    text-rose-300    border-rose-400/30',
  'Agenda aberta':'bg-sky-400/20     text-sky-300     border-sky-400/30',
  'Carreira':     'bg-violet-400/20  text-violet-300  border-violet-400/30',
  'Entrega rápida':'bg-lime-400/20   text-lime-300    border-lime-400/30',
  'Novidade':     'bg-amber-400/20   text-amber-300   border-amber-400/30',
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface ProductCardProps {
  product: Product;
  onSimular: (product: Product) => void;
}

export default function ProductCard({ product, onSimular }: ProductCardProps) {
  const installmentPrice = product.valorTotal / product.installments;
  const badgeStyle = BADGE_STYLES[product.badge] ?? 'bg-white/10 text-white/60 border-white/20';

  if (product.destaque) {
    return (
      <button
        onClick={() => onSimular(product)}
        className="group col-span-2 flex flex-row overflow-hidden rounded-3xl border border-white/[0.06] bg-[#161616] text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD700]/40 hover:shadow-[0_0_28px_rgba(255,215,0,0.12)]"
      >
        {/* Emoji cover — wide */}
        <div className={`relative flex w-48 flex-shrink-0 items-center justify-center ${product.bgGradient}`}>
          <span className="text-6xl">{product.emoji}</span>
          <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${badgeStyle}`}>
            {product.badge}
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${product.accent}`}>
            {product.category}
          </span>
          <h3 className="mt-2 text-base font-black leading-snug text-white">{product.title}</h3>
          <p className="mt-0.5 text-xs font-semibold text-[#555]">{product.partner}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">{product.description}</p>
          <div className="mt-auto pt-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#555]">A partir de</p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-sm font-bold text-[#555]">{product.installments}x de</span>
              <span className="text-2xl font-black leading-none tracking-tight text-[#FFD700]">
                {formatBRL(installmentPrice)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/[0.07] px-4 py-2.5 text-[13px] font-black text-[#FFD700] transition-colors group-hover:bg-[#FFD700]/[0.13]">
            Simular agora
            <ArrowRight size={15} strokeWidth={3} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSimular(product)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#161616] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD700]/40 hover:shadow-[0_0_28px_rgba(255,215,0,0.12)]"
    >
      {/* Emoji cover */}
      <div className={`relative flex aspect-[16/10] items-center justify-center ${product.bgGradient}`}>
        <span className="text-6xl">{product.emoji}</span>
        <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${badgeStyle}`}>
          {product.badge}
        </div>
        <div className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${product.accent}`}>
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-black leading-snug text-white">{product.title}</h3>
        <p className="mt-0.5 text-xs font-semibold text-[#555]">{product.partner}</p>
        <div className="mt-auto pt-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#555]">A partir de</p>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-xs font-bold text-[#555]">{product.installments}x de</span>
            <span className="text-xl font-black leading-none tracking-tight text-[#FFD700]">
              {formatBRL(installmentPrice)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-[#444]">Total: {formatBRL(product.valorTotal)}</p>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/[0.07] px-3 py-2 text-xs font-black text-[#FFD700] transition-colors group-hover:bg-[#FFD700]/[0.13]">
          Simular agora
          <ArrowRight size={14} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}
