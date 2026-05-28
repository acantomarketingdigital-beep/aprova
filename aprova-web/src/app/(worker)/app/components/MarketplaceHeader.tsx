'use client';

import Image from 'next/image';
import { Wallet, Bell } from 'lucide-react';

interface MarketplaceHeaderProps {
  workerName: string;
  availableLimit: number;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MarketplaceHeader({ workerName, availableLimit }: MarketplaceHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0D0D0D]/95 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Logo bar */}
      <div className="flex items-center justify-between mb-3">
        <Image src="/logo.png" alt="APROVA" width={90} height={28} className="h-7 w-auto object-contain" priority />
      </div>
      <div className="flex items-center justify-between">
        {/* Left: greeting */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">
            Bem-vindo de volta
          </p>
          <h1 className="text-lg font-black leading-tight tracking-tight text-white">
            Olá, <span className="text-[#FFD700]">{workerName}</span> 👋
          </h1>
        </div>

        {/* Right: limit pill + bell */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-[#FFD700]/25 bg-[#161616] px-4 py-2 shadow-[0_0_16px_rgba(255,215,0,0.08)]">
            <Wallet size={15} className="text-[#FFD700]" strokeWidth={2.5} />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#555]">
                Margem disponível
              </p>
              <p className="text-sm font-black leading-none tracking-tight text-[#FFD700]">
                {formatBRL(availableLimit)}
              </p>
            </div>
          </div>
          <button
            aria-label="Notificações"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#161616] text-[#555] transition-colors hover:text-white"
          >
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Subtítulo comercial */}
      <p className="mt-1.5 text-xs font-semibold text-[#444]">
        Você tem{' '}
        <span className="font-black text-[#FFD700]">{formatBRL(availableLimit)}</span>{' '}
        disponíveis para comprar hoje — sem cartão, direto na folha
      </p>
    </header>
  );
}
