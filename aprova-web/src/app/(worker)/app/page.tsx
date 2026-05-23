import Link from 'next/link';
import { ArrowRight, Search, Wallet, QrCode, ChevronRight } from 'lucide-react';
import {
  availableLimit,
  formatBRL,
  workerName,
  workerOffers,
  type WorkerOffer,
} from './worker-data';

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'estetica',    emoji: '💆‍♀️', label: 'Estética',    bg: 'bg-rose-950/60',    border: 'border-rose-500/20',    text: 'text-rose-200' },
  { slug: 'odonto',      emoji: '🦷',   label: 'Odonto',      bg: 'bg-sky-950/60',     border: 'border-sky-500/20',     text: 'text-sky-200' },
  { slug: 'viagens',     emoji: '✈️',   label: 'Viagens',     bg: 'bg-violet-950/60',  border: 'border-violet-500/20',  text: 'text-violet-200' },
  { slug: 'construcao',  emoji: '🧱',   label: 'Construção',  bg: 'bg-amber-950/60',   border: 'border-amber-500/20',   text: 'text-amber-200' },
  { slug: 'veiculos',    emoji: '🚗',   label: 'Veículos',    bg: 'bg-lime-950/60',    border: 'border-lime-500/20',    text: 'text-lime-200' },
  { slug: 'educacao',    emoji: '📚',   label: 'Educação',    bg: 'bg-indigo-950/60',  border: 'border-indigo-500/20',  text: 'text-indigo-200' },
  { slug: 'saude',       emoji: '🏥',   label: 'Saúde',       bg: 'bg-emerald-950/60', border: 'border-emerald-500/20', text: 'text-emerald-200' },
  { slug: 'tecnologia',  emoji: '💻',   label: 'Tecnologia',  bg: 'bg-cyan-950/60',    border: 'border-cyan-500/20',    text: 'text-cyan-200' },
];

const PARTNERS = [
  { id: '1', name: 'Clínica Viva Mais',    initial: 'V', color: 'bg-emerald-700' },
  { id: '2', name: 'Sorriso Prime',         initial: 'S', color: 'bg-sky-700' },
  { id: '3', name: 'Obra Forte',            initial: 'O', color: 'bg-amber-700' },
  { id: '4', name: 'Next Skill Academy',    initial: 'N', color: 'bg-violet-700' },
  { id: '5', name: 'Mobility Store',        initial: 'M', color: 'bg-lime-700' },
  { id: '6', name: 'TurismoBrasil',         initial: 'T', color: 'bg-rose-700' },
  { id: '7', name: 'AutoCenter Plus',       initial: 'A', color: 'bg-orange-700' },
  { id: '8', name: 'MedFácil',              initial: 'M', color: 'bg-teal-700' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OfferCard({ offer }: { offer: WorkerOffer }) {
  const installmentPrice = offer.price / offer.installments;

  return (
    <Link
      href={`/app/oferta/${offer.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD700]/40 hover:shadow-[0_0_28px_rgba(255,215,0,0.12)]"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A]">
        <img
          src={offer.image}
          alt={offer.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-transparent to-transparent" />
        {/* Badge */}
        <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
          {offer.badge}
        </div>
        {/* Category chip */}
        <div className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${offer.accent}`}>
          {offer.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-black leading-snug text-white">{offer.title}</h3>
        <p className="mt-0.5 text-xs font-semibold text-[#666]">{offer.partner}</p>

        {/* Price block */}
        <div className="mt-auto pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
            A partir de
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[13px] font-bold text-[#555]">{offer.installments}x de</span>
            <span className="text-2xl font-black leading-none tracking-tight text-[#FFD700]">
              {formatBRL(installmentPrice)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#444]">
            Total: {formatBRL(offer.price)}
          </p>
        </div>

        {/* CTA row */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/[0.07] px-4 py-2.5 text-[13px] font-black text-[#FFD700] transition-colors group-hover:bg-[#FFD700]/[0.13]">
          Simular agora
          <ArrowRight size={16} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkerStorefrontPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between pt-8 pb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#555]">
              Seu saldo atual
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Olá, <span className="text-[#FFD700]">{workerName}</span> 👋
            </h1>
          </div>

          {/* Limit pill */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 rounded-2xl border border-[#FFD700]/25 bg-[#141414] px-5 py-3 shadow-[0_0_20px_rgba(255,215,0,0.08)]">
              <Wallet size={18} className="text-[#FFD700]" strokeWidth={2.5} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#666]">
                  LIMITE DISPONÍVEL
                </p>
                <p className="text-xl font-black leading-none tracking-tight text-[#FFD700] sm:text-2xl">
                  {formatBRL(availableLimit)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── SEARCH BAR ── */}
        <div className="mb-8">
          <label className="flex h-14 items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#141414] px-5 transition-colors focus-within:border-[#FFD700]/40 focus-within:bg-[#181818]">
            <Search size={20} className="flex-shrink-0 text-[#444]" />
            <input
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:font-medium placeholder:text-[#444]"
              placeholder="Busque por clínicas, lojas ou serviços..."
            />
          </label>
        </div>

        {/* ── CATEGORY PILLS ── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-[0.15em] text-[#555]">
              Categorias
            </h2>
            <button className="flex items-center gap-1 text-xs font-bold text-[#FFD700]">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {/* Horizontal scroll — hidden scrollbar */}
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/app?categoria=${cat.slug}`}
                className={`group flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 ${cat.bg} ${cat.border}`}
              >
                <span className="text-3xl leading-none">{cat.emoji}</span>
                <span className={`text-[11px] font-black uppercase tracking-wide ${cat.text}`}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HERO BANNER ── */}
        <section className="mb-10">
          <Link
            href="/app/oferta/combo-ozonio"
            className="group relative flex min-h-[220px] overflow-hidden rounded-3xl border border-white/[0.06] bg-[#141414] sm:min-h-[280px]"
          >
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80"
              alt="Flash Sale Estética"
              className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/95 via-[#0A0A0A]/60 to-transparent" />
            <div className="relative flex flex-col justify-center gap-3 p-8 sm:p-10">
              <span className="w-fit rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#FFD700]">
                ⚡ Flash Sale — Só hoje
              </span>
              <h2 className="max-w-sm text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Check-up estético com condições de folha
              </h2>
              <p className="max-w-xs text-sm font-semibold text-white/60 sm:text-base">
                Reserve hoje e pague em até 12x no benefício APROVA.
              </p>
              <div className="mt-2 flex w-fit items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-black uppercase tracking-wider text-[#0A0A0A] shadow-[0_0_20px_rgba(255,215,0,0.35)] transition-all group-hover:brightness-110">
                Ver oferta <ArrowRight size={16} strokeWidth={3} />
              </div>
            </div>
          </Link>
        </section>

        {/* ── TRUSTED PARTNERS ── */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD700]">
                Prova social
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                Grandes Parceiros APROVA
              </h2>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-[#555] hover:text-white transition-colors">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="group flex flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#141414] px-5 py-4 transition-all duration-200 hover:border-[#FFD700]/30 hover:bg-[#1A1A1A]"
              >
                {/* Logo placeholder — replace with <img> in production */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${partner.color} text-xl font-black text-white`}>
                  {partner.initial}
                </div>
                <p className="max-w-[90px] text-center text-[11px] font-bold leading-tight text-[#888] group-hover:text-white transition-colors">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── OFFERS FEED ── */}
        <section>
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD700]">
                Com sua margem de {formatBRL(availableLimit)}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Oportunidades com sua Margem
              </h2>
            </div>
            <p className="text-xs font-semibold text-[#444]">
              Parcelas que cabem na folha — sem surpresa
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {workerOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* ── FLOATING CTA ── */}
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Link
            href="/app/token"
            className="flex items-center gap-3 rounded-full border border-[#FFD700]/30 bg-[#141414] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#FFD700] shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(255,215,0,0.2)] transition-all hover:bg-[#1A1A1A] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_32px_rgba(255,215,0,0.35)]"
          >
            <QrCode size={20} strokeWidth={2.5} />
            Gerar Token APROVA
          </Link>
        </div>

      </div>
    </main>
  );
}
