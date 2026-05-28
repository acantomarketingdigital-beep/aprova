'use client';

import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PartnerNav from '../../components/PartnerNav';

// Token validation status types
type TokenStatus = 'idle' | 'loading' | 'valid' | 'expired' | 'used' | 'insufficient' | 'blocked' | 'invalid';

interface ValidationResult {
  status: TokenStatus;
  clientName?: string;
  offer?: string;
  amount?: number;
  installments?: number;
  margin?: number;
}

// TODO: substituir por POST /api/v1/qr-codes/validate
const DEMO_TOKENS: Record<string, ValidationResult> = {
  'DEMO-OK':  { status: 'valid',  clientName: 'João Silva',   offer: 'Combo Ozônio + Recovery', amount: 1080, installments: 12, margin: 2400 },
  'ABX-4F2':  { status: 'valid',  clientName: 'Maria Santos', offer: 'Pacote Facial Premium',   amount: 720,  installments: 10, margin: 1800 },
  'DEMO-EXP': { status: 'expired',  clientName: 'Carlos Oliveira' },
  'DEMO-USE': { status: 'used',     clientName: 'Ana Costa'       },
  'DEMO-BLK': { status: 'blocked',  clientName: 'Pedro Lima'      },
  'DEMO-LOW': { status: 'insufficient', clientName: 'Fernanda Rocha', margin: 80, amount: 1080 },
};

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_CONFIG = {
  valid: {
    Icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-500/25',
    title: 'Token válido',
    desc: 'Cliente com margem disponível. Confirme a venda abaixo.',
  },
  expired: {
    Icon: Clock,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-500/25',
    title: 'Token expirado',
    desc: 'Este token não é mais válido. Solicite ao cliente que gere um novo token no aplicativo APROVA.',
  },
  used: {
    Icon: XCircle,
    color: 'text-[#555]',
    bg: 'bg-[#1A1A1A] border-[#2A2A2A]',
    title: 'Token já utilizado',
    desc: 'Este token já foi validado em uma venda anterior. Cada token é de uso único.',
  },
  insufficient: {
    Icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-500/25',
    title: 'Margem insuficiente',
    desc: 'O cliente não possui margem suficiente para esta oferta.',
  },
  blocked: {
    Icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-500/25',
    title: 'Cliente bloqueado',
    desc: 'O benefício deste cliente está bloqueado. Entre em contato com o RH da empresa.',
  },
  invalid: {
    Icon: XCircle,
    color: 'text-[#555]',
    bg: 'bg-[#1A1A1A] border-[#2A2A2A]',
    title: 'Token inválido',
    desc: 'Não encontramos este código no sistema. Verifique a digitação ou solicite novo token.',
  },
};

export default function TokenPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [status, setStatus] = useState<TokenStatus>('idle');

  const handleValidate = async () => {
    if (!tokenInput.trim()) return;
    setStatus('loading');
    setResult(null);

    // TODO: POST /api/v1/qr-codes/validate { token: tokenInput.toUpperCase() }
    await new Promise((r) => setTimeout(r, 1000));

    const normalized = tokenInput.trim().toUpperCase();
    const found = DEMO_TOKENS[normalized];
    if (found) {
      setResult(found);
      setStatus(found.status);
    } else {
      setResult({ status: 'invalid' });
      setStatus('invalid');
    }
  };

  const handleConfirmSale = () => {
    // TODO: POST /api/v1/transactions/confirm { token: tokenInput }
    alert('Venda confirmada! (integração com backend pendente)');
    setTokenInput('');
    setResult(null);
    setStatus('idle');
  };

  const handleReset = () => {
    setTokenInput('');
    setResult(null);
    setStatus('idle');
  };

  const isLoading = status === 'loading';
  const cfg = status !== 'idle' && status !== 'loading' ? STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20">
            <QrCode size={28} className="text-[#FFD700]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-white">Validar Token APROVA</h1>
          <p className="mt-2 text-sm text-[#555]">
            Digite o código apresentado pelo cliente para confirmar margem e concluir a venda.
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-3xl border border-[#1A1A1A] bg-[#111] p-8">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-3">
            Código do token
          </label>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value.toUpperCase());
              if (status !== 'idle') handleReset();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            placeholder="Ex: ABX-4F2"
            maxLength={10}
            className="w-full rounded-2xl border border-[#2A2A2A] bg-[#161616] px-5 py-4 text-center font-mono text-3xl font-black tracking-[0.4em] text-white placeholder:text-[#333] placeholder:text-xl placeholder:tracking-normal focus:outline-none focus:border-[#FFD700]/40 transition-colors"
          />

          <button
            onClick={handleValidate}
            disabled={!tokenInput.trim() || isLoading}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-wider transition-all ${
              !tokenInput.trim() || isLoading
                ? 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'
                : 'bg-[#FFD700] text-[#0A0A0A] shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110'
            }`}
          >
            {isLoading ? (
              <><span className="animate-spin">⟳</span> Validando…</>
            ) : (
              <><ArrowRight size={16} strokeWidth={3} /> Validar token</>
            )}
          </button>

          {/* Demo hints */}
          <div className="mt-5 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#333] mb-2">Tokens de demonstração</p>
            <div className="flex flex-wrap gap-2">
              {['DEMO-OK', 'DEMO-EXP', 'DEMO-USE', 'DEMO-BLK', 'DEMO-LOW'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTokenInput(t); handleReset(); }}
                  className="font-mono text-xs font-bold text-[#444] hover:text-[#FFD700] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result card */}
        {cfg && result && (
          <div className={`rounded-3xl border p-6 ${cfg.bg}`}>
            <div className={`flex items-center gap-3 mb-4 ${cfg.color}`}>
              <cfg.Icon size={22} strokeWidth={2.5} />
              <h2 className="text-lg font-black">{cfg.title}</h2>
            </div>
            <p className="text-sm text-[#888] mb-5">{cfg.desc}</p>

            {result.clientName && (
              <div className="rounded-2xl border border-white/[0.06] bg-[#0F0F0F] p-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  {result.clientName && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Cliente</p>
                      <p className="mt-1 text-sm font-black text-white">{result.clientName}</p>
                    </div>
                  )}
                  {result.offer && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Oferta</p>
                      <p className="mt-1 text-sm font-black text-white">{result.offer}</p>
                    </div>
                  )}
                  {result.amount && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Valor</p>
                      <p className="mt-1 text-sm font-black text-[#FFD700]">
                        {result.installments}x de {formatBRL(result.amount / (result.installments ?? 1))}
                      </p>
                    </div>
                  )}
                  {result.margin && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#444]">Margem disponível</p>
                      <p className="mt-1 text-sm font-black text-emerald-400">{formatBRL(result.margin)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {status === 'valid' && (
                <button
                  onClick={handleConfirmSale}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-3.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all"
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  Confirmar venda
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3.5 text-sm font-bold text-[#888] hover:text-white transition-all"
              >
                Novo token
              </button>
            </div>
          </div>
        )}

        {/* Link to history */}
        <div className="text-center">
          <Link href="/dashboard/transacoes" className="text-sm font-bold text-[#555] hover:text-[#FFD700] transition-colors">
            Ver histórico de tokens →
          </Link>
        </div>

      </main>
    </div>
  );
}
