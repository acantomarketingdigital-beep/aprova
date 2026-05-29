'use client';

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ─── API config ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// ─── Demo tokens (fallback when API is not running) ───────────────────────────

const DEMO_TOKENS: Record<string, ValidationData & { _demo?: true }> = {
  'DEMO-OK': {
    _demo:            true,
    valid:            true,
    tokenCode:        'DEMO-OK',
    patientName:      'João Silva',
    productName:      'Combo Ozônio + Recovery',
    grossAmount:      1080,
    installmentsCount: 12,
    installmentAmount: 90,
    marginAvailable:  2400,
    expiresAt:        new Date(Date.now() + 14 * 60 * 1000).toISOString(),
    employeeId:       'demo-emp-001',
  },
  'ABX-4F2': {
    _demo:            true,
    valid:            true,
    tokenCode:        'ABX-4F2',
    patientName:      'Maria Santos',
    productName:      'Pacote Facial Premium',
    grossAmount:      720,
    installmentsCount: 10,
    installmentAmount: 72,
    marginAvailable:  1800,
    expiresAt:        new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    employeeId:       'demo-emp-002',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'searching' | 'ready' | 'processing' | 'success' | 'error';

interface ValidationData {
  valid: true;
  tokenCode: string;
  patientName: string | null;
  productName: string | null;
  grossAmount: number;
  installmentsCount: number;
  installmentAmount: number;
  marginAvailable: number;
  expiresAt: string;
  employeeId: string;
  _demo?: true;
}

interface SuccessData {
  transactionId: string;
  tokenCode: string;
  patientName: string | null;
  productName: string | null;
  grossAmount: number;
  takeRateAmount: number;
  netToPartner: number;
  installmentsCount: number;
  installmentAmount: number;
  processedAt: string;
}

interface ErrorState {
  type: 'not_found' | 'used' | 'expired' | 'margin' | 'network' | 'unknown';
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTokenInput(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.length > 3 ? `${clean.slice(0, 3)}-${clean.slice(3, 6)}` : clean;
}

function classifyError(status: number, body: { message?: string }): ErrorState {
  const msg = body.message ?? 'Erro desconhecido.';
  if (status === 404) return { type: 'not_found', message: msg };
  if (status === 409) return { type: 'used',      message: msg };
  if (status === 422) {
    if (msg.toLowerCase().includes('margin') || msg.toLowerCase().includes('margem')) {
      return { type: 'margin', message: msg };
    }
    return { type: 'expired', message: msg };
  }
  return { type: 'unknown', message: msg };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TokenInput({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ready    = value.length === 7; // XXX-XXX

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div>
        <label
          htmlFor="token-input"
          className="block mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#555]"
        >
          Código do token
        </label>
        <input
          id="token-input"
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          maxLength={7}
          placeholder="XXX-XXX"
          onChange={(e) => onChange(formatTokenInput(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && ready && onSubmit()}
          className="w-full rounded-2xl border border-[#2A2A2A] bg-[#161616] px-6 py-5 text-center font-mono text-4xl font-black tracking-[0.4em] text-white placeholder:text-[#2A2A2A] placeholder:text-2xl placeholder:tracking-normal focus:border-[#FFD700]/40 focus:outline-none transition-colors"
        />
      </div>

      {/* CTA */}
      <button
        onClick={onSubmit}
        disabled={!ready || loading}
        className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4.5 text-[15px] font-black uppercase tracking-[0.1em] transition-all ${
          ready && !loading
            ? 'bg-[#FFD700] text-[#0D0D0D] shadow-[0_0_24px_rgba(255,215,0,0.35)] hover:brightness-110 active:scale-[0.98]'
            : 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'
        }`}
      >
        {loading ? (
          <><RefreshCw size={18} className="animate-spin" /> Verificando autorização…</>
        ) : (
          <><ShieldCheck size={18} strokeWidth={2.5} /> Buscar Autorização</>
        )}
      </button>

      {/* Demo hints */}
      <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#333]">
          Tokens de demonstração
        </p>
        <div className="flex flex-wrap gap-3">
          {Object.keys(DEMO_TOKENS).map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="font-mono text-xs font-black text-[#FFD700]/60 hover:text-[#FFD700] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ error, onReset }: { error: ErrorState; onReset: () => void }) {
  const icon =
    error.type === 'used'      ? XCircle     :
    error.type === 'expired'   ? Clock3      :
    error.type === 'not_found' ? AlertCircle :
                                 AlertCircle;

  const Icon = icon;

  const color =
    error.type === 'used'    ? 'text-amber-400'  :
    error.type === 'margin'  ? 'text-orange-400' :
                               'text-red-400';

  const bg =
    error.type === 'used'    ? 'border-amber-500/25 bg-amber-500/[0.07]' :
    error.type === 'margin'  ? 'border-orange-400/25 bg-orange-500/[0.07]' :
                               'border-red-500/25 bg-red-500/[0.07]';

  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      <div className={`flex items-center gap-3 mb-3 ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
        <p className="font-black text-base">
          {error.type === 'not_found' ? 'Token não encontrado'     :
           error.type === 'used'      ? 'Token já utilizado'       :
           error.type === 'expired'   ? 'Token expirado'           :
           error.type === 'margin'    ? 'Margem insuficiente'      :
           error.type === 'network'   ? 'Erro de conexão'          :
                                        'Erro ao processar token'}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-[#888] mb-4">{error.message}</p>
      <p className="text-xs text-[#555] mb-4">
        {error.type === 'not_found' && 'Confira se o código foi digitado corretamente. Tokens têm formato XXX-XXX (letras e números).'}
        {error.type === 'used'      && 'Solicite ao paciente que gere um novo token pelo aplicativo APROVA. Tokens de uso único não podem ser reutilizados.'}
        {error.type === 'expired'   && 'Tokens expiram em 15 minutos. Solicite ao paciente que gere um novo token agora.'}
        {error.type === 'margin'    && 'O crédito consignado do paciente não cobre esta parcela. Oriente-o a verificar a margem disponível no app.'}
        {error.type === 'network'   && 'Verifique a conexão com a internet e tente novamente.'}
      </p>
      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2.5 text-sm font-bold text-white transition-all hover:border-[#FFD700]/30 hover:text-[#FFD700]"
      >
        <RefreshCw size={14} strokeWidth={2.5} /> Tentar novo token
      </button>
    </div>
  );
}

function ConfirmationCard({
  data,
  onConfirm,
  onCancel,
  loading,
}: {
  data: ValidationData;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const minutesLeft = Math.max(
    0,
    Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 60_000),
  );
  const isUrgent = minutesLeft < 3;

  return (
    <div className="flex flex-col gap-5">
      {/* Status badge */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3">
        <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-black text-emerald-400">Crédito Pré-Aprovado — Margem Verificada</p>
          <p className="text-xs text-[#666] mt-0.5">
            Margem disponível: <span className="font-bold text-white">{formatBRL(data.marginAvailable)}</span>
          </p>
        </div>
        {/* Expiry */}
        <div className={`ml-auto flex-shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${
          isUrgent
            ? 'border-orange-400/40 bg-orange-400/10 text-orange-300'
            : 'border-[#2A2A2A] bg-[#111] text-[#555]'
        }`}>
          <Clock3 size={11} strokeWidth={2.5} />
          {minutesLeft}min
        </div>
      </div>

      {/* Receipt card */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-5 py-3.5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
            Resumo da Reserva
          </p>
          <span className="font-mono text-xs font-black text-[#FFD700]">{data.tokenCode}</span>
        </div>

        {/* Fields */}
        <div className="divide-y divide-[#1A1A1A]">
          {[
            { label: 'Paciente',     value: data.patientName  ?? '—', highlight: false },
            { label: 'Serviço',      value: data.productName  ?? '—', highlight: false },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <span className="text-sm text-[#666] flex-shrink-0">{label}</span>
              <span className="text-sm font-black text-white text-right">{value}</span>
            </div>
          ))}

          {/* Financial grid */}
          <div className="grid grid-cols-3 divide-x divide-[#1A1A1A]">
            <div className="px-4 py-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Valor Total</p>
              <p className="mt-1.5 text-base font-black text-white">
                {formatBRL(data.grossAmount)}
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Parcelas</p>
              <p className="mt-1.5 text-base font-black text-[#FFD700]">
                {data.installmentsCount}×
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">Valor/parcela</p>
              <p className="mt-1.5 text-base font-black text-white">
                {formatBRL(data.installmentAmount)}
              </p>
            </div>
          </div>

          {/* Margin impact */}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-[#555]">Margem após esta venda</span>
            <span className="text-xs font-black text-emerald-400">
              {formatBRL(Math.max(0, data.marginAvailable - data.installmentAmount))} restantes
            </span>
          </div>
        </div>
      </div>

      {/* Confirm CTA — pulsing */}
      <div className="relative">
        <span className="absolute -inset-0.5 animate-ping rounded-[18px] bg-[#FFD700] opacity-[0.12]" />
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`relative flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-[15px] font-black uppercase tracking-[0.08em] transition-all ${
            loading
              ? 'cursor-not-allowed bg-[#1A1A1A] text-[#444]'
              : 'bg-[#FFD700] text-[#0D0D0D] shadow-[0_0_28px_rgba(255,215,0,0.4)] hover:brightness-110 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <><RefreshCw size={18} className="animate-spin" /> Processando venda…</>
          ) : (
            <><CheckCircle2 size={18} strokeWidth={2.5} /> Confirmar Venda e Bloquear Limite</>
          )}
        </button>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        disabled={loading}
        className="text-center text-sm font-bold text-[#444] hover:text-[#888] transition-colors disabled:cursor-not-allowed"
      >
        Cancelar e digitar outro token
      </button>
    </div>
  );
}

function SuccessScreen({
  data,
  onReset,
}: {
  data: SuccessData;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" />
          <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/15">
            <Check size={32} className="text-emerald-400" strokeWidth={3} />
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">Venda confirmada!</h2>
          <p className="mt-1.5 text-sm text-[#666]">
            O limite do colaborador foi bloqueado com sucesso.
          </p>
        </div>
      </div>

      {/* Transaction summary */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
        <div className="border-b border-[#1A1A1A] px-5 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
            Resumo da Transação
          </p>
        </div>

        <div className="divide-y divide-[#1A1A1A]">
          {data.patientName && (
            <div className="flex justify-between px-5 py-3.5">
              <span className="text-sm text-[#666]">Paciente</span>
              <span className="text-sm font-black text-white">{data.patientName}</span>
            </div>
          )}
          {data.productName && (
            <div className="flex justify-between px-5 py-3.5">
              <span className="text-sm text-[#666]">Serviço</span>
              <span className="text-sm font-black text-white text-right max-w-[200px]">{data.productName}</span>
            </div>
          )}
          <div className="flex justify-between px-5 py-3.5">
            <span className="text-sm text-[#666]">Token</span>
            <span className="font-mono text-sm font-black text-[#FFD700]">{data.tokenCode}</span>
          </div>
          <div className="flex justify-between px-5 py-3.5">
            <span className="text-sm text-[#666]">Condição</span>
            <span className="text-sm font-black text-white">
              {data.installmentsCount}× de {formatBRL(data.installmentAmount)}
            </span>
          </div>
          <div className="flex justify-between px-5 py-3.5">
            <span className="text-sm text-[#666]">Valor total</span>
            <span className="text-sm font-black text-white">{formatBRL(data.grossAmount)}</span>
          </div>
        </div>

        {/* Split breakdown */}
        <div className="border-t border-[#1A1A1A] bg-[#0F0F0F]">
          <div className="grid grid-cols-2 divide-x divide-[#1A1A1A]">
            <div className="px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">
                Taxa APROVA (12%)
              </p>
              <p className="mt-1.5 text-base font-black text-red-400">
                − {formatBRL(data.takeRateAmount)}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#555]">
                Repasse estimado (88%)
              </p>
              <p className="mt-1.5 text-base font-black text-emerald-400">
                {formatBRL(data.netToPartner)}
              </p>
            </div>
          </div>
          <p className="border-t border-[#1A1A1A] px-5 py-2.5 text-[10px] text-[#333]">
            Repasse sujeito ao fechamento da folha de pagamento.
            ID: <span className="font-mono">{data.transactionId.slice(0, 8)}…</span>
          </p>
        </div>
      </div>

      {/* New validation */}
      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#2A2A2A] bg-[#111] py-4 text-sm font-black text-white transition-all hover:border-[#FFD700]/30 hover:text-[#FFD700]"
      >
        <ArrowRight size={16} strokeWidth={2.5} /> Nova validação de token
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TokenValidationModule() {
  const [phase, setPhase]       = useState<Phase>('idle');
  const [tokenInput, setInput]  = useState('');
  const [validated, setValidated] = useState<ValidationData | null>(null);
  const [success, setSuccess]   = useState<SuccessData | null>(null);
  const [error, setError]       = useState<ErrorState | null>(null);

  const reset = useCallback(() => {
    setPhase('idle');
    setInput('');
    setValidated(null);
    setSuccess(null);
    setError(null);
  }, []);

  // ── Phase 1 → 2: Validate token ──────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (tokenInput.length !== 7) return;
    setPhase('searching');
    setError(null);

    // Demo shortcut (no backend required)
    const demo = DEMO_TOKENS[tokenInput];
    if (demo) {
      await new Promise((r) => setTimeout(r, 800)); // simulate latency
      setValidated(demo);
      setPhase('ready');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/qr-codes/validate/${encodeURIComponent(tokenInput)}`);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(classifyError(res.status, body));
        setPhase('error');
        return;
      }

      setValidated(body as ValidationData);
      setPhase('ready');
    } catch {
      setError({
        type: 'network',
        message: 'Não foi possível conectar ao servidor APROVA. Verifique a conexão e tente novamente.',
      });
      setPhase('error');
    }
  }, [tokenInput]);

  // ── Phase 2 → 3: Process transaction ─────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!validated) return;
    setPhase('processing');

    // Demo shortcut
    if (validated._demo) {
      await new Promise((r) => setTimeout(r, 1_200));
      const gross = validated.grossAmount;
      const take  = +(gross * 0.12).toFixed(2);
      setSuccess({
        transactionId:    `demo-tx-${Date.now()}`,
        tokenCode:        validated.tokenCode,
        patientName:      validated.patientName,
        productName:      validated.productName,
        grossAmount:      gross,
        takeRateAmount:   take,
        netToPartner:     +(gross - take).toFixed(2),
        installmentsCount: validated.installmentsCount,
        installmentAmount: validated.installmentAmount,
        processedAt:      new Date().toISOString(),
      });
      setPhase('success');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/transactions/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenCode: validated.tokenCode,
          partnerId: 'TODO-REPLACE-WITH-JWT-PARTNER-ID',
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(classifyError(res.status, body));
        setPhase('error');
        return;
      }

      setSuccess(body as SuccessData);
      setPhase('success');
    } catch {
      setError({
        type: 'network',
        message: 'Falha ao processar a venda. Verifique a conexão e tente confirmar novamente.',
      });
      setPhase('error');
    }
  }, [validated]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-md">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
          Portal do Parceiro
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">Validar Token APROVA</h1>
        <p className="mt-1 text-sm text-[#555]">
          {phase === 'ready'   && 'Confirme os dados antes de efetivar a venda.'}
          {phase === 'success' && 'Venda registrada. O limite do colaborador foi bloqueado.'}
          {(phase === 'idle' || phase === 'searching' || phase === 'error') &&
            'Digite o código apresentado pelo paciente para liberar a compra no consignado.'}
        </p>
      </div>

      {/* Phase: idle / searching / error */}
      {(phase === 'idle' || phase === 'searching' || phase === 'error') && (
        <div className="flex flex-col gap-6">
          <TokenInput
            value={tokenInput}
            onChange={setInput}
            onSubmit={handleSearch}
            loading={phase === 'searching'}
          />
          {phase === 'error' && error && (
            <ErrorCard error={error} onReset={reset} />
          )}
        </div>
      )}

      {/* Phase: ready (confirmation) */}
      {(phase === 'ready' || phase === 'processing') && validated && (
        <ConfirmationCard
          data={validated}
          onConfirm={handleConfirm}
          onCancel={reset}
          loading={phase === 'processing'}
        />
      )}

      {/* Phase: success */}
      {phase === 'success' && success && (
        <SuccessScreen data={success} onReset={reset} />
      )}
    </div>
  );
}
