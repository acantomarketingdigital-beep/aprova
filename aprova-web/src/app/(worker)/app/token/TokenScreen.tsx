'use client';

import Link from 'next/link';
import QRCode from 'react-qr-code';
import { Check, Clock3, Copy, Home, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function createToken() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TokenScreen() {
  const searchParams = useSearchParams();
  const [token] = useState(createToken);
  const [remaining, setRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const tokenDisplay = `${token.slice(0, 3)}-${token.slice(3)}`;
  const offerId = searchParams.get('offer') ?? 'oferta';
  const installments = searchParams.get('parcelas') ?? '12';

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        token,
        offerId,
        installments,
        channel: 'worker-web',
      }),
    [installments, offerId, token],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  async function copyToken() {
    await navigator.clipboard.writeText(tokenDisplay);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-aprova-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col justify-center gap-6 px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-aprova-yellow">Token APROVA</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Codigo de pagamento gerado
            </h1>
          </div>
          <Link
            href="/app"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm font-black text-aprova-muted transition hover:border-aprova-yellow hover:text-aprova-yellow"
          >
            <Home size={18} /> Ofertas
          </Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white p-6 text-aprova-black">
            <div className="w-full max-w-[320px] rounded-2xl bg-white p-4">
              <QRCode value={qrPayload} size={292} className="h-auto w-full" />
            </div>
            <p className="mt-4 text-center text-sm font-black uppercase tracking-[0.18em] text-[#111]">
              QR Code para pagamento no celular
            </p>
          </div>

          <div className="rounded-2xl border border-aprova-yellow/30 bg-[#111] p-5 shadow-neon-yellow-sm sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-aprova-yellow/30 bg-aprova-yellow/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-aprova-yellow">
              <ShieldCheck size={16} /> Valido no parceiro
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-aprova-muted">
              Token numerico
            </p>
            <div className="mt-3 rounded-2xl border border-aprova-yellow/25 bg-aprova-yellow px-4 py-6 text-center text-aprova-black shadow-neon-yellow">
              <p className="text-[clamp(3.6rem,14vw,8.5rem)] font-black leading-none tracking-tight">
                {tokenDisplay}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyToken}
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0A0A0A] px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-aprova-yellow hover:text-aprova-yellow"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar token'}
              </button>
              <div className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-5 text-sm font-black uppercase tracking-[0.14em] text-red-200">
                <Clock3 size={18} /> Expira em {formatTime(remaining)}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-aprova-yellow/25 bg-aprova-yellow/10 p-4">
              <p className="text-sm font-black text-white">Este codigo expira em 15 minutos.</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-aprova-muted">
                Se estiver no PC da empresa, anote ou fale o token para a recepcionista na hora de pagar.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
