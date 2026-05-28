'use client';

import { QrCode } from 'lucide-react';

interface TokenBarProps {
  onClick: () => void;
}

export default function TokenBar({ onClick }: TokenBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FFD700] py-4 text-sm font-black uppercase tracking-widest text-[#0D0D0D] shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(255,215,0,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <QrCode size={20} strokeWidth={2.5} />
        Gerar Token de Compra
      </button>
    </div>
  );
}
