'use client';

export interface Partner {
  id: string;
  name: string;
  initial: string;
  color: string;
  featured?: boolean;
  // plan: 'premium' = paga R$197/mês (Plano Destaque); 'free' = só comissão de 12%
  plan?: 'premium' | 'free';
}

interface PartnersScrollProps {
  partners: Partner[];
}

export default function PartnersScroll({ partners }: PartnersScrollProps) {
  // Apenas parceiros pagantes aparecem no carrossel de destaque
  const featured = partners.filter((p) => p.featured || p.plan === 'premium');

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
            Plano Destaque APROVA
          </p>
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-white">
            Parceiros em destaque
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#555]">
            Clínicas e lojas que aceitam sua margem APROVA
          </p>
        </div>
        <button className="flex-shrink-0 text-xs font-bold text-[#555] transition-colors hover:text-white">
          Ver todos →
        </button>
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
        {featured.map((partner) => (
          <div
            key={partner.id}
            className="group relative flex flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-[#FFD700]/35 bg-[#161616] px-5 py-4 shadow-[0_0_16px_rgba(255,215,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1C1C1C] hover:shadow-[0_0_24px_rgba(255,215,0,0.15)]"
          >
            {/* Destaque star */}
            <span className="absolute -right-1.5 -top-1.5 text-sm leading-none">⭐</span>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${partner.color} text-xl font-black text-white`}>
              {partner.initial}
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="max-w-[84px] text-center text-[11px] font-bold leading-tight text-[#CCC] transition-colors group-hover:text-white">
                {partner.name}
              </p>
              <span className="rounded-full border border-[#FFD700]/25 bg-[#FFD700]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#FFD700]">
                Parceiro Destaque
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
