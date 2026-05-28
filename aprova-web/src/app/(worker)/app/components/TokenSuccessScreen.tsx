'use client';

import { ArrowRight, Check, Clock3, Copy, Home } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// ─── WhatsApp brand icon (inline SVG — lucide-react não inclui) ───────────────
function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    const id = window.setInterval(
      () => setRemaining((v) => Math.max(0, v - 1)),
      1_000,
    );
    return () => window.clearInterval(id);
  }, []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return {
    formatted: `${mm}:${ss}`,
    isExpired: remaining === 0,
    isUrgent: remaining > 0 && remaining < 3 * 60,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatToken(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 6
    ? `${digits.slice(0, 3)}-${digits.slice(3)}`
    : raw.toUpperCase();
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildWaUrl(phone: string, procedureName: string, displayToken: string): string {
  const msg = `Olá! Acabei de reservar meu ${procedureName} pelo APROVA. Meu Token de liberação é o ${displayToken}. Quero agendar meu horário!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface TokenSuccessScreenProps {
  /** Raw 6-digit token string, e.g. "849213". Formatted internally as "849-213". */
  token: string;
  /** Name of the procedure/offer, e.g. "Combo Ozônio + Recovery". */
  procedureName: string;
  /** Partner/clinic display name, e.g. "Clínica Viva Mais". */
  partnerName: string;
  /**
   * Partner WhatsApp number in E.164 format — digits only, no `+` or spaces.
   * Example: "5511912345678"
   */
  partnerWhatsApp: string;
  /** Number of installments, e.g. 12. */
  installments?: number;
  /** Total offer value in BRL, e.g. 1080. Used to calculate installment amount. */
  totalValue?: number;
  /** Token validity in seconds. Defaults to 900 (15 min). */
  expiresInSeconds?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TokenSuccessScreen({
  token,
  procedureName,
  partnerName,
  partnerWhatsApp,
  installments,
  totalValue,
  expiresInSeconds = 15 * 60,
}: TokenSuccessScreenProps) {
  const displayToken = formatToken(token);
  const { formatted: timeLeft, isExpired, isUrgent } = useCountdown(expiresInSeconds);
  const [copied, setCopied] = useState(false);

  const waUrl = buildWaUrl(partnerWhatsApp, procedureName, displayToken);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayToken);
    } catch {
      // Fallback for browsers that block clipboard on non-HTTPS
      const el = document.createElement('textarea');
      el.value = displayToken;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }, [displayToken]);

  // ── Timer badge style ──
  const timerCls = isExpired
    ? 'border-red-500/40 bg-red-500/10 text-red-400'
    : isUrgent
    ? 'border-orange-400/40 bg-orange-400/10 text-orange-300'
    : 'border-red-400/20 bg-red-400/5 text-red-400/80';

  return (
    <div className="min-h-screen bg-aprova-black text-white">
      <div className="mx-auto max-w-md px-4 pb-16 pt-6 sm:pb-10">

        {/* ── Top bar ── */}
        <div className="mb-10 flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-aprova-yellow">
            APROVA
          </span>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-xl border border-aprova-border bg-aprova-card px-3.5 py-2 text-xs font-bold text-aprova-muted transition hover:border-aprova-yellow/40 hover:text-white"
          >
            <Home size={13} strokeWidth={2.5} />
            Voltar às ofertas
          </Link>
        </div>

        {/* ── Success hero ── */}
        <div className="mb-9 flex flex-col items-center text-center">
          {/* Animated checkmark with layered rings */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" />
            <span className="absolute inset-2 animate-pulse rounded-full bg-emerald-400/10" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/15">
              <Check size={32} className="text-emerald-400" strokeWidth={3} />
            </span>
          </div>

          <h1 className="text-[2.5rem] font-black leading-none tracking-tight text-white sm:text-5xl">
            Oferta garantida!
          </h1>
          <p className="mt-2.5 max-w-xs text-sm font-semibold leading-relaxed text-aprova-muted">
            Toque no botão abaixo para agendar direto pelo WhatsApp — a mensagem já está pronta.
          </p>
        </div>

        {/* ── Token card ── */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-aprova-yellow/30 bg-aprova-card shadow-neon-yellow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-aprova-yellow/10 px-5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-aprova-muted">
              Token de liberação
            </p>
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${timerCls}`}>
              <Clock3 size={11} strokeWidth={2.5} />
              {isExpired ? 'Expirado' : `Expira em ${timeLeft}`}
            </div>
          </div>

          {/* Token number — yellow background, max visual weight */}
          <div className="bg-aprova-yellow px-6 py-8 text-center shadow-neon-yellow">
            <p
              className="select-all font-black leading-none tracking-tight text-aprova-black"
              style={{ fontSize: 'clamp(3.8rem, 20vw, 6.5rem)', letterSpacing: '-0.02em' }}
            >
              {displayToken}
            </p>
          </div>

          {/* Copy button */}
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-black uppercase tracking-[0.1em] transition-all ${
                copied
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                  : 'border-aprova-border bg-[#0F0F0F] text-aprova-muted hover:border-aprova-yellow/30 hover:text-white'
              }`}
            >
              {copied ? (
                <><Check size={15} strokeWidth={3} /> Token copiado!</>
              ) : (
                <><Copy size={15} /> Copiar token</>
              )}
            </button>
          </div>
        </div>

        {/* ── Reservation summary ── */}
        <div className="mb-7 rounded-2xl border border-aprova-border bg-aprova-card p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-aprova-muted">
            Resumo da reserva
          </p>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <span className="flex-shrink-0 text-sm text-aprova-muted">Procedimento</span>
              <span className="text-right text-sm font-black text-white">{procedureName}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="flex-shrink-0 text-sm text-aprova-muted">Parceiro</span>
              <span className="text-right text-sm font-black text-white">{partnerName}</span>
            </div>
            {installments != null && totalValue != null && (
              <div className="flex items-start justify-between gap-4">
                <span className="flex-shrink-0 text-sm text-aprova-muted">Pagamento</span>
                <span className="text-right text-sm font-black text-aprova-yellow">
                  {installments}x de {formatBRL(totalValue / installments)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2.5">
            <span className="text-xs text-emerald-400 flex-shrink-0">✓</span>
            <p className="text-xs font-semibold leading-snug text-emerald-400">
              Sem cartão de crédito — desconto direto na folha de pagamento
            </p>
          </div>
        </div>

        {/* ── WhatsApp CTA — principal conversion driver ── */}
        <div className="mb-8">
          <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-aprova-muted">
            Próximo passo obrigatório
          </p>

          <div className="relative">
            {/* Outer ping ring — draws the eye */}
            <span className="absolute -inset-1 animate-ping rounded-[20px] bg-aprova-yellow opacity-[0.15]" />

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-aprova-yellow py-5 text-[15px] font-black uppercase tracking-[0.08em] text-aprova-black shadow-neon-yellow-lg transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <WhatsAppIcon size={22} className="flex-shrink-0" />
              Agendar agora pelo WhatsApp
              <ArrowRight size={18} strokeWidth={3} className="flex-shrink-0" />
            </a>
          </div>

          {/* 3-step micro guide */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { n: '1', label: 'Toque no botão' },
              { n: '2', label: 'Mensagem já preenchida' },
              { n: '3', label: 'Envie e aguarde' },
            ].map(({ n, label }) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aprova-yellow text-[10px] font-black text-aprova-black">
                  {n}
                </span>
                <p className="text-[10px] font-semibold leading-tight text-aprova-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preview of the WhatsApp message ── */}
        <div className="mb-8 rounded-2xl border border-aprova-border bg-aprova-card p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-aprova-muted">
            Mensagem que será enviada
          </p>
          <div className="rounded-xl bg-[#0F0F0F] px-4 py-3">
            <p className="text-sm leading-relaxed text-[#CCC]">
              Olá! Acabei de reservar meu{' '}
              <span className="font-black text-white">{procedureName}</span>{' '}
              pelo APROVA. Meu Token de liberação é o{' '}
              <span className="font-black text-aprova-yellow">{displayToken}</span>.
              Quero agendar meu horário!
            </p>
          </div>
          <p className="mt-2 text-[10px] font-semibold text-[#444]">
            Editável antes de enviar no WhatsApp.
          </p>
        </div>

        {/* ── Footer disclaimer ── */}
        <p className="text-center text-xs font-semibold leading-relaxed text-[#3A3A3A]">
          Token válido por {Math.floor(expiresInSeconds / 60)} minutos.{' '}
          Apresente ao parceiro para confirmar a compra no ato do atendimento.
        </p>

      </div>
    </div>
  );
}
