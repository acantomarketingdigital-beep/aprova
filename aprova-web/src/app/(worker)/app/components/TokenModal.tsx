'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Copy, CheckCheck, RefreshCw, ArrowRight } from 'lucide-react';

const TOTAL_SECONDS = 15 * 60;

function gerarToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(3)}-${rand(3)}`;
}

// WhatsApp brand icon
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface TokenModalProps {
  onClose: () => void;
  procedureName?: string;
  partnerName?: string;
  partnerWhatsApp?: string;
}

export default function TokenModal({
  onClose,
  procedureName,
  partnerName,
  partnerWhatsApp,
}: TokenModalProps) {
  const [token, setToken] = useState(() => gerarToken());
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (secs = TOTAL_SECONDS) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(secs);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRenew = () => {
    setToken(gerarToken());
    startCountdown();
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      const el = document.createElement('textarea');
      el.value = token;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = secondsLeft / TOTAL_SECONDS;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const expired = secondsLeft === 0;
  const barColor = progress > 0.5 ? '#FFD700' : progress > 0.2 ? '#FF8C00' : '#EF4444';
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - progress);

  // WhatsApp CTA — só exibe quando temos o número do parceiro
  const hasWa = Boolean(partnerWhatsApp);
  const waUrl = hasWa
    ? `https://wa.me/${partnerWhatsApp}?text=${encodeURIComponent(
        `Olá! Acabei de reservar meu ${procedureName ?? 'serviço'} pelo APROVA. Meu Token de liberação é o ${token}. Quero agendar meu horário!`,
      )}`
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-sm rounded-t-3xl border-t border-white/[0.08] bg-[#161616] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-7 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                Token de Compra
              </p>
              <h3 className="mt-0.5 text-xl font-black text-white">APROVA Pay</h3>
              {partnerName && (
                <p className="mt-0.5 text-xs font-semibold text-[#666]">{partnerName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1F1F1F] text-[#555] transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* QR + Timer ring */}
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="relative">
              <svg width="132" height="132" className="absolute inset-0 -rotate-90">
                <circle cx="66" cy="66" r="52" fill="none" stroke="#2A2A2A" strokeWidth="6" />
                <circle
                  cx="66" cy="66" r="52"
                  fill="none"
                  stroke={expired ? '#EF4444' : barColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }}
                />
              </svg>
              <div className="relative flex h-[132px] w-[132px] items-center justify-center">
                <svg
                  width="96" height="96" viewBox="0 0 9 9"
                  className={`rounded-lg transition-opacity ${expired ? 'opacity-20' : 'opacity-100'}`}
                  style={{ imageRendering: 'pixelated' }}
                >
                  {[
                    [0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],
                    [4,0],[4,1],[4,2],
                    [6,0],[7,0],[8,0],[6,1],[8,1],[6,2],[7,2],[8,2],
                    [0,4],[1,4],[3,4],[5,4],[7,4],[8,4],
                    [0,6],[1,6],[2,6],[0,7],[2,7],[0,8],[1,8],[2,8],
                    [4,6],[4,7],[4,8],
                    [6,4],[7,4],[8,4],[7,5],[6,6],[8,6],[7,7],[6,8],[8,8],
                    [1,1],[3,1],[5,1],[2,3],[4,3],[6,3],[1,5],[3,5],[5,5],
                  ].map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width={1} height={1} fill="#FFD700" />
                  ))}
                </svg>
                {expired && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl">⏱</span>
                    <span className="text-xs font-black text-rose-400">Expirado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Token code */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
                Código de 6 dígitos
              </p>
              <div className={`flex items-center gap-3 rounded-2xl border px-6 py-3 ${
                expired
                  ? 'border-rose-500/30 bg-rose-950/30'
                  : 'border-[#FFD700]/25 bg-[#FFD700]/[0.06]'
              }`}>
                <span className={`font-mono text-3xl font-black tracking-[0.35em] ${
                  expired ? 'text-rose-400 line-through' : 'text-[#FFD700]'
                }`}>
                  {token}
                </span>
              </div>
              <p className={`mt-1 text-xs font-bold ${
                expired ? 'text-rose-400' : secondsLeft < 180 ? 'text-orange-400' : 'text-[#555]'
              }`}>
                {expired
                  ? 'Token expirado'
                  : `Expira em ${minutes}:${String(seconds).padStart(2, '0')}`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress * 100}%`, background: expired ? '#EF4444' : barColor }}
                />
              </div>
            </div>
          </div>

          {/* Copy / Renew actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCopy}
              disabled={expired}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-black transition-all
                ${expired
                  ? 'cursor-not-allowed border-white/[0.06] text-[#444]'
                  : copied
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                    : 'border-white/[0.08] bg-[#1F1F1F] text-white hover:border-[#FFD700]/30 hover:text-[#FFD700]'}`}
            >
              {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleRenew}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-[#0D0D0D] shadow-[0_0_16px_rgba(255,215,0,0.3)] transition-all hover:brightness-110"
            >
              <RefreshCw size={16} strokeWidth={2.5} />
              Renovar
            </button>
          </div>

          {/* WhatsApp scheduling CTA */}
          {waUrl && !expired && (
            <div className="mt-4">
              <div className="relative">
                <span className="absolute -inset-0.5 animate-ping rounded-[18px] bg-[#FFD700] opacity-[0.12]" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#FFD700] py-4 text-sm font-black text-[#0D0D0D] shadow-[0_0_20px_rgba(255,215,0,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <WhatsAppIcon size={18} />
                  Agendar agora pelo WhatsApp
                  <ArrowRight size={16} strokeWidth={3} />
                </a>
              </div>
              <p className="mt-2 text-center text-[10px] font-semibold text-[#444]">
                A mensagem com o token já está preenchida
              </p>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-[#444]">
            {hasWa
              ? 'Agende pelo WhatsApp ou apresente o código no balcão do parceiro'
              : 'Apresente este código no balcão do parceiro'}
          </p>
        </div>
      </div>
    </>
  );
}
