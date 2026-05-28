'use client';

import { useEffect, useState } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Product } from './ProductCard';

interface SimuladorModalProps {
  product: Product | null;
  userLimit: number;
  onClose: () => void;
  onGerarToken: () => void;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function SimuladorModal({
  product,
  userLimit,
  onClose,
  onGerarToken,
}: SimuladorModalProps) {
  const [installments, setInstallments] = useState(product?.installments ?? 12);

  useEffect(() => {
    if (product) setInstallments(product.installments);
  }, [product]);

  if (!product) return null;

  const valorParcela = product.valorTotal / installments;
  const margemMaxima = userLimit * 0.3;
  const cabeMargem = valorParcela <= margemMaxima;
  const progressPercent = Math.min((valorParcela / margemMaxima) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl border-t border-white/[0.08] bg-[#161616] pb-safe">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                Simulação
              </p>
              <h3 className="mt-0.5 text-xl font-black leading-tight text-white">
                {product.title}
              </h3>
              <p className="text-sm font-semibold text-[#555]">{product.partner}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1F1F1F] text-[#555] transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Price summary */}
          <div className="mt-5 flex items-baseline gap-2 rounded-2xl border border-white/[0.06] bg-[#1A1A1A] px-5 py-4">
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#555]">
                Total do produto
              </p>
              <p className="text-lg font-black text-white">{formatBRL(product.valorTotal)}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex-1 text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#555]">
                Valor da parcela
              </p>
              <p className="text-2xl font-black tracking-tight text-[#FFD700]">
                {formatBRL(valorParcela)}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-[#555]">
                Parcelas
              </p>
              <span className="rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/10 px-3 py-1 text-sm font-black text-[#FFD700]">
                {installments}x
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={product.installments}
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #FFD700 ${((installments - 1) / (product.installments - 1)) * 100}%, #2a2a2a ${((installments - 1) / (product.installments - 1)) * 100}%)`,
              }}
            />
            <div className="mt-1 flex justify-between">
              <span className="text-[10px] text-[#444]">1x</span>
              <span className="text-[10px] text-[#444]">{product.installments}x</span>
            </div>
          </div>

          {/* Margem indicator */}
          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#1A1A1A] p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-[#555]">Uso da margem</span>
              <span className={`font-black ${cabeMargem ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBRL(valorParcela)} / {formatBRL(margemMaxima)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${cabeMargem ? 'bg-emerald-400' : 'bg-rose-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={`mt-2.5 flex items-center gap-1.5 text-xs font-bold ${cabeMargem ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cabeMargem ? (
                <>
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                  Cabe na sua margem! Aprovação imediata.
                </>
              ) : (
                <>
                  <AlertCircle size={13} strokeWidth={2.5} />
                  Excede 30% da margem. Tente mais parcelas.
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <ul className="mt-4 space-y-1.5">
            {product.details.map((d) => (
              <li key={d} className="flex items-center gap-2 text-xs text-[#666]">
                <span className="text-[#FFD700]">✓</span> {d}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => { onClose(); onGerarToken(); }}
            disabled={!cabeMargem}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-wider transition-all
              ${cabeMargem
                ? 'bg-[#FFD700] text-[#0D0D0D] shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:brightness-110'
                : 'cursor-not-allowed bg-[#2A2A2A] text-[#444]'}`}
          >
            Gerar Token de Compra
            <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </>
  );
}
