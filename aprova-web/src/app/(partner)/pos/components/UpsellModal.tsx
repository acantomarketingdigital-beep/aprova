'use client';

import React from 'react';

interface UpsellOffer {
  title: string;
  description: string;
  originalAmount: number;
  comboAmount: number;
  savings: number;
}

interface UpsellModalProps {
  offer: UpsellOffer;
  onAccept: () => void;
  onDecline: () => void;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function UpsellModal({ offer, onAccept, onDecline }: UpsellModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-aprova-black/95 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 flex flex-col gap-6">

        {/* Badge */}
        <div className="flex justify-center">
          <span className="bg-aprova-yellow text-aprova-black text-xs font-black tracking-widest px-4 py-2 rounded-full uppercase">
            ⚡ Oferta Especial
          </span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-aprova-yellow text-3xl font-black tracking-tight uppercase leading-tight">
            OPORTUNIDADE
            <br />
            DE UPSELL
          </h2>
        </div>

        {/* Offer Card */}
        <div className="bg-[#111111] rounded-2xl border border-[#2A2A00] p-6 flex flex-col gap-4">
          <div>
            <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase mb-1">
              Oferta adicional
            </p>
            <p className="text-white text-xl font-bold">{offer.title}</p>
          </div>

          <p className="text-[#AAA] text-sm leading-relaxed">{offer.description}</p>

          <div className="flex items-end justify-between border-t border-[#222] pt-4">
            <div>
              <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase mb-1">
                Valor original
              </p>
              <p className="text-[#666] text-base font-semibold line-through">
                {formatBRL(offer.originalAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase mb-1">
                Combo APROVA
              </p>
              <p className="text-aprova-yellow text-3xl font-black">
                {formatBRL(offer.comboAmount)}
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A00] rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-aprova-yellow text-lg">💰</span>
            <p className="text-aprova-yellow font-bold text-sm">
              Economia de {formatBRL(offer.savings)} no combo!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onAccept}
            className="w-full bg-aprova-yellow text-aprova-black font-black text-lg py-5 rounded-2xl tracking-widest uppercase shadow-neon-yellow hover:brightness-110 active:scale-[0.98] transition-all"
          >
            ADICIONAR COMBO
          </button>

          <button
            onClick={onDecline}
            className="w-full border-2 border-[#333] text-[#888] font-bold text-base py-4 rounded-2xl tracking-wider uppercase hover:border-[#555] hover:text-[#AAA] transition-all"
          >
            MANTER ORIGINAL
          </button>
        </div>
      </div>
    </div>
  );
}
