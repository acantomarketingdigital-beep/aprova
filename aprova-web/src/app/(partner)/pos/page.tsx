'use client';

import React, { useState, useCallback } from 'react';
import UpsellModal from './components/UpsellModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const MAX_INSTALLMENTS = 12;

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface InstallmentRow {
  n: number;
  amount: number;
  total: number;
}

function buildInstallments(amount: number): InstallmentRow[] {
  if (!amount || amount <= 0) return [];
  return Array.from({ length: MAX_INSTALLMENTS }, (_, i) => {
    const n = i + 1;
    return { n, amount: amount / n, total: amount };
  });
}

interface CustomerInfo {
  name: string;
  limit: number;
}

type Step = 'input' | 'installments' | 'confirming' | 'success' | 'error';

export default function POSPage() {
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState<number | null>(null);
  const [step, setStep] = useState<Step>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);

  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  const installments = buildInstallments(numericAmount);

  const fetchCustomer = useCallback(async () => {
    if (!token.trim()) return;
    setLoadingCustomer(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/qr-codes/validate/${token.trim()}`);
      if (!res.ok) throw new Error('Token inválido ou expirado');
      const data = await res.json();
      setCustomer({ name: data.employee?.user?.email ?? 'Cliente', limit: data.amount ?? 5000 });
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro ao validar token');
      setCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  }, [token]);

  const handleConfirmSale = async () => {
    if (!selectedInstallments || numericAmount <= 0 || !token) return;
    setStep('confirming');
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: token,
          gross_amount: numericAmount,
          installments_count: selectedInstallments,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Falha na transação');
      }
      setShowUpsell(true);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro ao confirmar venda');
      setStep('error');
    }
  };

  const handleUpsellAccept = () => {
    setShowUpsell(false);
    setStep('success');
  };

  const handleReset = () => {
    setToken('');
    setAmount('');
    setCustomer(null);
    setSelectedInstallments(null);
    setStep('input');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-aprova-black text-white p-6 flex flex-col gap-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-aprova-yellow text-2xl font-black tracking-widest uppercase">
            APROVA
          </h1>
          <p className="text-aprova-muted text-xs tracking-widest mt-1">PDV EXPRESS</p>
        </div>
        {step === 'success' && (
          <button
            onClick={handleReset}
            className="text-aprova-muted text-sm border border-[#333] rounded-xl px-4 py-2 hover:border-[#555] transition"
          >
            Nova venda
          </button>
        )}
      </div>

      {/* Token Input */}
      <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] p-6 flex flex-col gap-4">
        <label className="text-aprova-muted text-xs tracking-widest font-bold uppercase">
          TOKEN DO CLIENTE / QR CODE
        </label>

        <div className="flex gap-3">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomer()}
            placeholder="Ex: APROVA-XXXXXX"
            className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl px-5 py-4 text-white text-xl font-mono tracking-widest placeholder:text-[#333] focus:outline-none focus:border-aprova-yellow transition"
          />
          <button
            onClick={fetchCustomer}
            disabled={loadingCustomer}
            className="bg-[#1A1A1A] border border-[#333] rounded-2xl px-5 text-2xl hover:border-aprova-yellow transition disabled:opacity-40"
          >
            {loadingCustomer ? '⏳' : '📷'}
          </button>
        </div>

        {customer && (
          <div className="bg-[#0A1A0A] border border-[#1A3A1A] rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[#4CAF50] text-xs font-bold tracking-widest uppercase mb-1">
                ✓ Cliente identificado
              </p>
              <p className="text-white font-bold">{customer.name}</p>
            </div>
            <div className="text-right">
              <p className="text-aprova-muted text-xs uppercase tracking-widest mb-1">Limite</p>
              <p className="text-aprova-yellow text-xl font-black">{formatBRL(customer.limit)}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="text-red-400 text-sm font-medium bg-[#1A0A0A] border border-[#3A1A1A] rounded-xl px-4 py-3">
            ❌ {errorMsg}
          </p>
        )}
      </div>

      {/* Amount Input */}
      <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] p-6 flex flex-col gap-3">
        <label className="text-aprova-muted text-xs tracking-widest font-bold uppercase">
          VALOR DO PROCEDIMENTO
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-aprova-muted text-xl font-bold">
            R$
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSelectedInstallments(null);
            }}
            placeholder="0,00"
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl pl-14 pr-5 py-5 text-white text-3xl font-black placeholder:text-[#333] focus:outline-none focus:border-aprova-yellow transition"
          />
        </div>
      </div>

      {/* Installment Grid */}
      {numericAmount > 0 && (
        <div className="bg-[#111] rounded-2xl border border-[#2A2A2A] p-6 flex flex-col gap-4">
          <p className="text-aprova-muted text-xs tracking-widest font-bold uppercase">
            ESCOLHA O PARCELAMENTO
          </p>
          <div className="grid grid-cols-3 gap-3">
            {installments.map((row) => (
              <button
                key={row.n}
                onClick={() => setSelectedInstallments(row.n)}
                className={`rounded-2xl p-4 flex flex-col items-center border-2 transition-all ${
                  selectedInstallments === row.n
                    ? 'border-aprova-yellow bg-[#1A1A00] shadow-neon-yellow-sm'
                    : 'border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444]'
                }`}
              >
                <span
                  className={`text-2xl font-black ${selectedInstallments === row.n ? 'text-aprova-yellow' : 'text-white'}`}
                >
                  {row.n}x
                </span>
                <span className="text-aprova-muted text-xs mt-1 font-semibold">
                  {formatBRL(row.amount)}
                </span>
              </button>
            ))}
          </div>

          {selectedInstallments && (
            <div className="bg-[#0A0A0A] rounded-xl border border-[#2A2A00] px-5 py-3 flex justify-between items-center">
              <span className="text-aprova-muted text-sm">
                {selectedInstallments}x de{' '}
                <span className="text-white font-bold">
                  {formatBRL(numericAmount / selectedInstallments)}
                </span>
              </span>
              <span className="text-aprova-muted text-sm">
                Total:{' '}
                <span className="text-aprova-yellow font-bold">{formatBRL(numericAmount)}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Confirm Button */}
      {selectedInstallments && customer && (
        <button
          onClick={handleConfirmSale}
          disabled={step === 'confirming'}
          className="w-full bg-aprova-yellow text-aprova-black font-black text-xl py-6 rounded-2xl tracking-widest uppercase shadow-neon-yellow hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {step === 'confirming' ? 'PROCESSANDO...' : 'CONFIRMAR VENDA'}
        </button>
      )}

      {/* Success State */}
      {step === 'success' && !showUpsell && (
        <div className="fixed inset-0 bg-aprova-black/95 flex flex-col items-center justify-center gap-6 z-40">
          <span className="text-8xl">✅</span>
          <h2 className="text-[#4CAF50] text-3xl font-black tracking-widest uppercase">
            VENDA APROVADA!
          </h2>
          <p className="text-aprova-muted text-center">
            {formatBRL(numericAmount)} em {selectedInstallments}x
            <br />
            descontados em folha
          </p>
          <button
            onClick={handleReset}
            className="bg-aprova-yellow text-aprova-black font-black text-base py-4 px-8 rounded-2xl tracking-widest uppercase shadow-neon-yellow"
          >
            NOVA VENDA
          </button>
        </div>
      )}

      {/* Upsell Modal */}
      {showUpsell && (
        <UpsellModal
          offer={{
            title: 'Plano de Saúde + Odonto',
            description:
              'Adicione cobertura odontológica completa ao seu plano de saúde. Consultas, exames e procedimentos incluídos.',
            originalAmount: numericAmount + 400,
            comboAmount: numericAmount + 250,
            savings: 150,
          }}
          onAccept={handleUpsellAccept}
          onDecline={() => {
            setShowUpsell(false);
            setStep('success');
          }}
        />
      )}
    </div>
  );
}
