'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Copy, CheckCheck, RefreshCw } from 'lucide-react';

const TOTAL_SECONDS = 15 * 60;

function gerarToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(3)}-${rand(3)}`;
}

interface TokenModalProps {
  onClose: () => void;
}

export default function TokenModal({ onClose }: TokenModalProps) {
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
  }, []);

  const handleRenew = () => {
    setToken(gerarToken());
    startCountdown();
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
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

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-sm rounded-t-3xl border-t border-white/[0.08] bg-[#161616] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                Token de Compra
              </p>
              <h3 className="mt-0.5 text-xl font-black text-white">APROVA Pay</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1F1F1F] text-[#555] transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* QR + Timer ring */}
          <div className="mt-5 flex flex-col items-center gap-5">
            {/* SVG QR placeholder */}
            <div className="relative">
              {/* Countdown ring */}
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
              {/* QR code SVG placeholder */}
              <div className="relative flex h-[132px] w-[132px] items-center justify-center">
                <svg
                  width="96" height="96" viewBox="0 0 9 9"
                  className={`rounded-lg transition-opacity ${expired ? 'opacity-20' : 'opacity-100'}`}
                  style={{ imageRendering: 'pixelated' }}
                >
                  {/* Simplified QR pattern */}
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
              <div className={`flex items-center gap-3 rounded-2xl border px-6 py-3 ${expired ? 'border-rose-500/30 bg-rose-950/30' : 'border-[#FFD700]/25 bg-[#FFD700]/[0.06]'}`}>
                <span className={`font-mono text-3xl font-black tracking-[0.35em] ${expired ? 'text-rose-400 line-through' : 'text-[#FFD700]'}`}>
                  {token}
                </span>
              </div>
              {/* Timer */}
              <p className={`mt-1 text-xs font-bold ${expired ? 'text-rose-400' : secondsLeft < 180 ? 'text-orange-400' : 'text-[#555]'}`}>
                {expired ? 'Token expirado' : `Expira em ${minutes}:${String(seconds).padStart(2, '0')}`}
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

          {/* Actions */}
          <div className="mt-5 flex gap-3">
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

          <p className="mt-4 text-center text-xs text-[#444]">
            Apresente este código no balcão do parceiro
          </p>
        </div>
      </div>
    </>
  );
}
