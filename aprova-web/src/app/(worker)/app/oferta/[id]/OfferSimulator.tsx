'use client';

import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';
import type { WorkerOffer } from '../../worker-data';
import { formatBRL } from '../../worker-data';
import { useState } from 'react';

export default function OfferSimulator({ offer }: { offer: WorkerOffer }) {
  const [installments, setInstallments] = useState(offer.installments);
  const installmentValue = offer.price / installments;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-aprova-yellow">
          Simulador de folha
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
          Escolha em quantas vezes quer descontar na folha
        </h2>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0A0A0A] p-4">
          <button
            type="button"
            onClick={() => setInstallments((value) => Math.max(1, value - 1))}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:border-aprova-yellow hover:text-aprova-yellow"
            aria-label="Diminuir parcelas"
          >
            <Minus size={20} />
          </button>

          <div className="text-center">
            <p className="text-5xl font-black leading-none text-aprova-yellow">{installments}x</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-aprova-muted">
              de {formatBRL(installmentValue)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInstallments((value) => Math.min(12, value + 1))}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:border-aprova-yellow hover:text-aprova-yellow"
            aria-label="Aumentar parcelas"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInstallments(value)}
              className={`h-11 rounded-xl border text-sm font-black transition ${
                installments === value
                  ? 'border-aprova-yellow bg-aprova-yellow text-aprova-black shadow-neon-yellow-sm'
                  : 'border-white/10 bg-[#0A0A0A] text-aprova-muted hover:border-white/25 hover:text-white'
              }`}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-aprova-yellow/30 bg-aprova-yellow/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-aprova-yellow" size={22} />
          <div>
            <p className="font-black text-white">Token aceito direto no parceiro</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-aprova-muted">
              Depois de gerar o token, apresente o QR Code ou o codigo de 6 digitos no balcao.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-aprova-yellow/25 bg-aprova-black/94 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[980px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-aprova-muted">Total da oferta</p>
            <p className="text-xl font-black text-white">
              {formatBRL(offer.price)} em {installments}x
            </p>
          </div>
          <Link
            href={`/app/token?offer=${offer.id}&parcelas=${installments}`}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-aprova-yellow px-6 text-center text-sm font-black uppercase tracking-[0.14em] text-aprova-black shadow-neon-yellow transition hover:brightness-110"
          >
            Garantir oferta e gerar token <ArrowRight size={19} strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}
