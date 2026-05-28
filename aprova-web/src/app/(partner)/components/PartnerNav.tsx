'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MOCK_PARTNER, MOCK_PLAN } from './partner-data';

const NAV = [
  { label: 'Visão Geral',      href: '/dashboard'             },
  { label: 'Validar Token',    href: '/dashboard/token'       },
  { label: 'Transações',       href: '/dashboard/transacoes'  },
  { label: 'Ofertas',          href: '/dashboard/ofertas'     },
  { label: 'Campanhas',        href: '/dashboard/campanhas'   },
  { label: 'Cupons',           href: '/dashboard/cupons'      },
  { label: 'Plano de Anúncios',href: '/dashboard/plano'       },
  { label: 'Regulamento',      href: '/dashboard/regulamento' },
];

function PlanBadge() {
  const { plan, hasCompletedSale } = MOCK_PARTNER;
  const { isActive } = MOCK_PLAN;

  if (isActive || plan === 'premium') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
        ⭐ Campanhas Ativas
      </span>
    );
  }
  if (!hasCompletedSale) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
        ⏳ Aguardando 1ª venda
      </span>
    );
  }
  return (
    <Link
      href="/dashboard/plano"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1A1A1A] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#555] hover:border-[#FFD700]/30 hover:text-[#FFD700] transition-colors"
    >
      Plano Gratuito — Ativar
    </Link>
  );
}

export default function PartnerNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-[#0A0A0A]/96 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="APROVA" width={100} height={32} className="h-8 w-auto object-contain" priority />
          <span className="hidden sm:block text-[#2A2A2A] text-lg">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white text-sm font-black">{MOCK_PARTNER.name}</span>
            <PlanBadge />
          </div>
        </div>

        {/* Partner pill (mobile) */}
        <div className="flex sm:hidden items-center gap-1.5">
          <div className="h-7 w-7 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0A0A0A] text-xs font-black">
            {MOCK_PARTNER.initials}
          </div>
          <PlanBadge />
        </div>

        {/* Avatar (desktop) */}
        <div className="hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFD700] text-[#0A0A0A] text-sm font-black">
          {MOCK_PARTNER.initials}
        </div>
      </div>

      {/* Nav scroll */}
      <div className="flex gap-1 px-4 sm:px-6 pb-0 overflow-x-auto scrollbar-hide border-t border-[#111]">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold tracking-wide whitespace-nowrap border-b-2 transition-all ${
                active
                  ? 'text-[#FFD700] border-[#FFD700]'
                  : 'text-[#555] border-transparent hover:text-white hover:border-[#333]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
