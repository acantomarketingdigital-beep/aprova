import Link from 'next/link';
import { ArrowRight, BadgePercent, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { availableLimit, formatBRL, workerBanners, workerName, workerOffers } from './worker-data';

const workerBenefits = [
  {
    title: 'Token na hora',
    subtitle: 'Gere o codigo no PC ou celular',
    icon: ShieldCheck,
  },
  {
    title: 'Flash Sales',
    subtitle: 'Ofertas ativas dos parceiros',
    icon: BadgePercent,
  },
  {
    title: 'Sem cartao',
    subtitle: 'Pagamento via desconto em folha',
    icon: Wallet,
  },
];

function installmentLabel(price: number, installments: number) {
  return `${installments}x de ${formatBRL(price / installments)}`;
}

export default function WorkerStorefrontPage() {
  return (
    <main className="min-h-screen bg-aprova-black text-white">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-8 px-4 pb-12 pt-4 sm:px-6 lg:px-10">
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-aprova-black/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-aprova-muted">APROVA Marketplace</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Ola, {workerName}
                </h1>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-aprova-yellow/30 bg-aprova-yellow/10 text-aprova-yellow md:hidden">
                <Wallet size={21} strokeWidth={2.6} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] md:min-w-[520px] md:grid-cols-[1fr_auto]">
              <label className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#111] px-4 text-aprova-muted">
                <Search size={18} />
                <input
                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-aprova-muted"
                  placeholder="Buscar clinicas, lojas e ofertas"
                />
              </label>

              <div className="rounded-xl border border-aprova-yellow/30 bg-aprova-yellow px-4 py-2 text-aprova-black shadow-neon-yellow-sm">
                <div className="flex items-center gap-2">
                  <Wallet size={18} strokeWidth={2.7} />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">Limite disponivel</span>
                </div>
                <p className="text-2xl font-black leading-none tracking-tight sm:text-3xl">
                  {formatBRL(availableLimit)}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="flex snap-x gap-4 overflow-x-auto pb-1 xl:grid xl:grid-cols-1 xl:overflow-visible">
            {workerBanners.slice(0, 2).map((banner) => (
              <Link
                href={banner.href}
                key={banner.id}
                className="group relative min-w-[88vw] overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-[0_24px_90px_rgba(0,0,0,0.4)] transition duration-300 hover:border-aprova-yellow/60 sm:min-w-[620px] xl:min-w-0"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-500 group-hover:scale-[1.03]"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.tone}`} />
                <div className="relative flex min-h-[320px] flex-col justify-between p-6 sm:min-h-[390px] sm:p-8 lg:p-10">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-aprova-yellow/30 bg-aprova-yellow/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-aprova-yellow">
                    <Sparkles size={15} />
                    {banner.eyebrow}
                  </div>
                  <div className="max-w-3xl">
                    <h2 className="text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                      {banner.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white/78 sm:text-lg">
                      {banner.subtitle}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-aprova-yellow px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-aprova-black shadow-neon-yellow-sm">
                      Ver oferta <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={workerBanners[2].href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition duration-300 hover:border-aprova-yellow/60"
          >
            <img
              src={workerBanners[2].image}
              alt={workerBanners[2].title}
              className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-[1.04]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${workerBanners[2].tone}`} />
            <div className="relative flex min-h-[320px] flex-col justify-between p-6 sm:p-8 xl:min-h-full">
              <div className="inline-flex w-fit rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-200">
                {workerBanners[2].eyebrow}
              </div>
              <div>
                <h2 className="text-3xl font-black leading-none tracking-tight text-white sm:text-5xl">
                  {workerBanners[2].title}
                </h2>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white/75 sm:text-base">
                  {workerBanners[2].subtitle}
                </p>
              </div>
            </div>
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {workerBenefits.map(({ title, subtitle, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-[#111] p-5">
              <Icon className="text-aprova-yellow" size={22} strokeWidth={2.5} />
              <p className="mt-4 text-base font-black text-white">{title}</p>
              <p className="mt-1 text-sm font-semibold text-aprova-muted">{subtitle}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-aprova-yellow">Recomendadas para voce</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ofertas com parcela que cabe na folha
              </h2>
            </div>
            <p className="text-sm font-semibold text-aprova-muted">Atualizadas hoje pelos parceiros APROVA</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {workerOffers.map((offer) => (
              <Link
                key={offer.id}
                href={`/app/oferta/${offer.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition duration-300 hover:-translate-y-1 hover:border-aprova-yellow/60 hover:shadow-neon-yellow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#171717]">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                    {offer.badge}
                  </div>
                </div>
                <div className="flex min-h-[230px] flex-col p-5">
                  <div className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${offer.accent}`}>
                    {offer.category}
                  </div>
                  <h3 className="mt-4 text-xl font-black leading-tight text-white">{offer.title}</h3>
                  <p className="mt-1 text-sm font-bold text-aprova-muted">{offer.partner}</p>
                  <div className="mt-auto pt-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-aprova-muted">A partir de</p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-aprova-yellow">
                      {installmentLabel(offer.price, offer.installments)}
                    </p>
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-aprova-yellow/25 bg-aprova-yellow/10 px-4 py-3 text-sm font-black text-aprova-yellow">
                      Simular agora <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
