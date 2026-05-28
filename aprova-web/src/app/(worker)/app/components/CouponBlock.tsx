'use client';

import { useState } from 'react';
import { Tag, Clock, CheckCheck, Copy, ArrowRight } from 'lucide-react';

export interface Coupon {
  id: string;
  // partnerId vincula o cupom a um parceiro pagante (Plano Destaque)
  partnerId: string;
  partnerName: string;
  label: string;
  description: string;
  code: string;
  validUntil: string;
  // TODO: vincular ao endpoint GET /api/v1/products/:id quando backend estiver pronto
  relatedProductId?: string;
}

interface CouponBlockProps {
  coupons: Coupon[];
  // TODO: receber a lista de produtos para abrir o modal de detalhe correto
  onViewOffer?: (productId: string) => void;
}

export default function CouponBlock({ coupons, onViewOffer }: CouponBlockProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (coupons.length === 0) return null;

  const handleCopy = async (coupon: Coupon) => {
    await navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
          Condições exclusivas
        </p>
        <h2 className="mt-0.5 text-lg font-black tracking-tight text-white">
          Cupons e condições especiais
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-[#555]">
          Válido para compras com token APROVA nos parceiros em destaque
        </p>
      </div>

      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex w-64 flex-shrink-0 flex-col gap-3 rounded-2xl border border-[#FFD700]/20 bg-[#1A1A00] p-4"
          >
            {/* Label */}
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
              <Tag size={9} strokeWidth={3} />
              {coupon.label}
            </span>

            {/* Descrição */}
            <div>
              <p className="text-sm font-black leading-snug text-white">{coupon.description}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#888]">
                ⭐ {coupon.partnerName}
              </p>
            </div>

            {/* Código copiável */}
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#FFD700]/30 bg-[#FFD700]/[0.06] px-3 py-2">
              <span className="flex-1 font-mono text-sm font-black tracking-wider text-[#FFD700]">
                {coupon.code}
              </span>
              <button
                onClick={() => handleCopy(coupon)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[#FFD700]/70 transition-colors hover:text-[#FFD700]"
              >
                {copiedId === coupon.id ? (
                  <><CheckCheck size={11} /> Copiado</>
                ) : (
                  <><Copy size={11} /> Copiar</>
                )}
              </button>
            </div>

            {/* Rodapé: validade + CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-[#555]">
                <Clock size={10} />
                Válido: {coupon.validUntil}
              </div>
              {/* CTA "Usar agora" — abre a oferta relacionada */}
              {coupon.relatedProductId && onViewOffer && (
                <button
                  onClick={() => onViewOffer(coupon.relatedProductId!)}
                  className="flex items-center gap-1 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/10 px-2.5 py-1 text-[10px] font-black text-[#FFD700] transition-colors hover:bg-[#FFD700]/20"
                >
                  Usar agora <ArrowRight size={9} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
