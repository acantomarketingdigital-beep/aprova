'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface MiniBannerData {
  eyebrow: string;
  title: string;
  href: string;
  emoji: string;
}

interface MiniBannerProps {
  data: MiniBannerData;
}

export default function MiniBanner({ data }: MiniBannerProps) {
  return (
    <section className="px-4 pb-6 sm:px-6">
      <Link
        href={data.href}
        className="group flex items-center justify-between overflow-hidden rounded-2xl border border-[#FFD700]/20 bg-[#1A1A00] px-6 py-5 transition-all hover:border-[#FFD700]/50 hover:bg-[#1F1F00]"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]/70">
            {data.eyebrow}
          </p>
          <h3 className="mt-0.5 text-base font-black leading-snug text-[#FFD700]">
            {data.title}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#FFD700]/70 transition-colors group-hover:text-[#FFD700]">
            Aproveitar <ArrowRight size={12} strokeWidth={3} />
          </div>
        </div>
        <span className="flex-shrink-0 text-5xl leading-none">{data.emoji}</span>
      </Link>
    </section>
  );
}
