'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface HeroBannerItem {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  tone: string;
}

interface HeroBannerProps {
  banners: HeroBannerItem[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const handleDotClick = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(idx);
    startTimer();
  };

  const banner = banners[current];

  return (
    <section className="px-4 pb-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#161616]" style={{ minHeight: '240px' }}>
        {/* Images */}
        {banners.map((b, i) => (
          <img
            key={b.id}
            src={b.image}
            alt={b.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === current ? 'opacity-50' : 'opacity-0'}`}
          />
        ))}

        {/* Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.tone}`} />

        {/* Patrocinado badge */}
        <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/60 backdrop-blur-sm">
          Patrocinado
        </div>

        {/* Content */}
        <div className="relative flex min-h-[240px] flex-col justify-end gap-3 p-7 sm:p-9">
          <span className="w-fit rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#FFD700]">
            ⚡ {banner.eyebrow}
          </span>
          <h2 className="max-w-sm text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {banner.title}
          </h2>
          <p className="max-w-xs text-sm font-semibold text-white/60">
            {banner.subtitle}
          </p>
          <Link
            href={banner.href}
            className="mt-1 flex w-fit items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-2.5 text-sm font-black uppercase tracking-wider text-[#0D0D0D] shadow-[0_0_20px_rgba(255,215,0,0.35)] transition-all hover:brightness-110"
          >
            Ver oferta <ArrowRight size={15} strokeWidth={3} />
          </Link>
        </div>

        {/* Dot navigation */}
        <div className="absolute bottom-4 right-6 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-[#FFD700]' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
