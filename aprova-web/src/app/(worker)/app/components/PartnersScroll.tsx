'use client';

export interface Partner {
  id: string;
  name: string;
  initial: string;
  color: string;
  featured?: boolean;
  // plan: 'premium' = paga R$197/mês (Plano Destaque); 'free' = só comissão de 12%
  plan?: 'premium' | 'free';
  // Informações visíveis no card do trabalhador
  category?: string;
  status?: string;
}

interface PartnersScrollProps {
  partners: Partner[];
}

export default function PartnersScroll({ partners }: PartnersScrollProps) {
  // Apenas parceiros pagantes aparecem aqui — regra de negócio APROVA
  const featured = partners.filter((p) => p.featured || p.plan === 'premium');

  if (featured.length === 0) return null;

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          {/* "PARCEIROS SELECIONADOS" — não usar "Plano Destaque" aqui (linguagem interna do parceiro) */}
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
            Parceiros selecionados
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
            className="group relative flex w-[148px] flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-[#FFD700]/35 bg-[#161616] px-4 py-4 shadow-[0_0_16px_rgba(255,215,0,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1C1C1C] hover:shadow-[0_0_24px_rgba(255,215,0,0.15)]"
          >
            {/* Estrela de destaque */}
            <span className="absolute -right-1.5 -top-1.5 text-sm leading-none">⭐</span>

            {/* Inicial / logo */}
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${partner.color} text-xl font-black text-white shadow-md`}>
              {partner.initial}
            </div>

            {/* Info */}
            <div className="flex w-full flex-col items-center gap-1.5">
              <p className="text-center text-[12px] font-black leading-snug text-white transition-colors">
                {partner.name}
              </p>

              {/* Categoria e status — informação útil para o trabalhador */}
              {(partner.category || partner.status) && (
                <p className="text-center text-[10px] font-semibold leading-tight text-[#888]">
                  {[partner.category, partner.status].filter(Boolean).join(' • ')}
                </p>
              )}

              {/* Selo Parceiro Destaque */}
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
