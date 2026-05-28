'use client';

export interface Partner {
  id: string;
  name: string;
  initial: string;
  color: string;
  featured?: boolean;
}

interface PartnersScrollProps {
  partners: Partner[];
}

export default function PartnersScroll({ partners }: PartnersScrollProps) {
  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
            Parceiros verificados
          </p>
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-white">
            Grandes Parceiros APROVA
          </h2>
        </div>
        <button className="text-xs font-bold text-[#555] transition-colors hover:text-white">
          Ver todos →
        </button>
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className={`group relative flex flex-shrink-0 flex-col items-center gap-3 rounded-2xl border bg-[#161616] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1C1C1C]
              ${partner.featured ? 'border-[#FFD700]/40 shadow-[0_0_16px_rgba(255,215,0,0.1)]' : 'border-white/[0.06] hover:border-[#FFD700]/20'}`}
          >
            {/* Featured star */}
            {partner.featured && (
              <span className="absolute -right-1.5 -top-1.5 text-base leading-none">⭐</span>
            )}
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${partner.color} text-xl font-black text-white`}>
              {partner.initial}
            </div>
            <p className="max-w-[84px] text-center text-[11px] font-bold leading-tight text-[#888] transition-colors group-hover:text-white">
              {partner.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
