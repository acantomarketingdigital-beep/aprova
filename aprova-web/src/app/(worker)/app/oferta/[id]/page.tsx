import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatBRL, getWorkerOffer, workerOffers } from '../../worker-data';
import OfferSimulator from './OfferSimulator';

export function generateStaticParams() {
  return workerOffers.map((offer) => ({ id: offer.id }));
}

export default async function WorkerOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = getWorkerOffer(id);

  if (!offer) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-aprova-black pb-32 text-white">
      <div className="mx-auto grid w-full max-w-[1480px] gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:px-10">
        <section className="flex flex-col gap-5">
          <Link
            href="/app"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm font-black text-aprova-muted transition hover:border-aprova-yellow hover:text-aprova-yellow"
          >
            <ArrowLeft size={18} /> Voltar para ofertas
          </Link>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
            <img src={offer.image} alt={offer.title} className="aspect-[16/11] w-full object-cover lg:aspect-[16/12]" />
            <div className="absolute left-4 top-4 rounded-full border border-aprova-yellow/30 bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-aprova-yellow backdrop-blur">
              {offer.badge}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5 sm:p-7">
            <div className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${offer.accent}`}>
              {offer.category}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">
              {offer.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-aprova-muted">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} /> {offer.partner}
              </span>
              <span className="text-aprova-yellow">{formatBRL(offer.price)}</span>
            </div>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-white/72 sm:text-lg">
              {offer.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {offer.details.map((detail) => (
                <div key={detail} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                  <CheckCircle2 className="text-aprova-yellow" size={20} />
                  <p className="mt-3 text-sm font-black text-white">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <OfferSimulator offer={offer} />
        </aside>
      </div>
    </main>
  );
}
