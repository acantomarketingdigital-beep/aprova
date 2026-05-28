'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Dashboard',     href: '/rh/dashboard' },
  { label: 'Colaboradores', href: '/rh/colaboradores' },
  { label: 'Relatórios',    href: '/rh/relatorios' },
  { label: 'Configurações', href: '/rh/configuracoes' },
];

interface RhNavProps {
  companyName?: string;
  userInitials?: string;
  userRole?: string;
}

export default function RhNav({
  companyName = 'Metalúrgica Fonseca S.A.',
  userInitials = 'MF',
  userRole = 'Administrador RH',
}: RhNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-[#0A0A0A]/96 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="APROVA" width={100} height={32} className="h-8 w-auto object-contain" priority />
          <span className="text-[#2A2A2A] hidden sm:block text-lg">|</span>
          <span className="text-[#555] text-sm font-semibold hidden sm:block">Portal do RH</span>
        </div>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#FFD700] text-[#0A0A0A]'
                    : 'text-[#666] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden lg:block">
            <p className="text-white text-sm font-bold leading-tight truncate max-w-[200px]">{companyName}</p>
            <p className="text-[#555] text-xs">{userRole}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0A0A0A] font-black text-sm flex-shrink-0">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Mobile nav — horizontal scroll */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                active ? 'bg-[#FFD700] text-[#0A0A0A]' : 'text-[#666] bg-[#111] border border-[#1A1A1A]'
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
