'use client';

import { useState } from 'react';
import { Save, Upload, Download, UserPlus, Shield, Bell, Key, CheckCircle2 } from 'lucide-react';
import RhNav from '../components/RhNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin_rh' | 'financeiro' | 'leitura' | 'operador';
  status: 'active' | 'pending';
  lastAccess: string;
}

// ─── Mock data (TODO: substituir por GET /api/v1/rh/settings e /api/v1/rh/users) ──

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Marina Fonseca',  email: 'marina@fonseca.com.br',   role: 'admin_rh',  status: 'active',  lastAccess: 'Hoje, 14:23'       },
  { id: 'u2', name: 'Carlos Finanças', email: 'carlos@fonseca.com.br',   role: 'financeiro', status: 'active',  lastAccess: 'Ontem, 09:15'      },
  { id: 'u3', name: 'Ana Operações',   email: 'ana@fonseca.com.br',      role: 'operador',   status: 'active',  lastAccess: '15/05/2026, 16:40' },
  { id: 'u4', name: 'Visitante RH',   email: 'visitante@fonseca.com.br', role: 'leitura',    status: 'pending', lastAccess: '—'                 },
];

const ROLE_LABEL: Record<AdminUser['role'], string> = {
  admin_rh:  'Administrador RH',
  financeiro: 'Financeiro',
  leitura:    'Leitura',
  operador:   'Operador',
};

const IMPORT_HISTORY = {
  lastImport:  '28/05/2026 — 10:47',
  processed:   248,
  errors:      2,
};

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#1A1A1A]">
        <h2 className="text-base font-black text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#555]">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[#1A1A1A] last:border-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{label}</p>
        {sub && <p className="text-xs text-[#444] mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full border transition-all ${
          checked ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${
          checked ? 'left-5' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`rounded-xl border px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
          readOnly
            ? 'border-[#1A1A1A] bg-[#0F0F0F] text-[#555] cursor-not-allowed'
            : 'border-[#1A1A1A] bg-[#161616] focus:border-[#FFD700]/40'
        }`}
      />
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
      <span className="text-emerald-400 text-sm font-bold">{message}</span>
      <button onClick={onClose} className="text-[#555] hover:text-white text-xs font-bold">✕</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [toast, setToast] = useState<string | null>(null);

  // Section A — Company data
  const [company, setCompany] = useState({
    razaoSocial:    'Metalúrgica Fonseca S.A.',
    nomeFantasia:   'Fonseca Metais',
    cnpj:           '12.345.678/0001-90',
    responsavelRH:  'Marina Fonseca',
    emailFinanceiro:'financeiro@fonseca.com.br',
    telefone:       '(11) 3456-7890',
    endereco:       'Rua das Indústrias, 450 — Santo André, SP',
  });

  // Section B — Benefit rules
  const [rules, setRules] = useState({
    marginPct:             30,
    allowNewContracts:     true,
    requireRhApproval:     false,
    allowTrialEmployees:   false,
    autoBlockDismissed:    true,
    payrollCloseDay:       5,
    payrollTransferDay:    15,
  });

  // Section E — Notifications
  const [notifs, setNotifs] = useState({
    newPurchase:     true,
    nearClosing:     true,
    weeklySummary:   false,
    criticalMargin:  true,
    importErrors:    true,
  });

  const setRule = <K extends keyof typeof rules>(k: K, v: typeof rules[K]) =>
    setRules((r) => ({ ...r, [k]: v }));

  const setNotif = <K extends keyof typeof notifs>(k: K, v: boolean) =>
    setNotifs((n) => ({ ...n, [k]: v }));

  const handleSave = () => {
    // TODO: POST /api/v1/rh/settings
    setToast('Configurações salvas localmente. Integração com backend pendente.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <RhNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 flex flex-col gap-7">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Portal do RH</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white">Configurações</h1>
            <p className="mt-1 text-sm text-[#555]">
              Gerencie regras da empresa, permissões e preferências do benefício APROVA.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-[#FFD700] px-5 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_16px_rgba(255,215,0,0.2)]"
          >
            <Save size={15} strokeWidth={2.5} />
            Salvar alterações
          </button>
        </div>

        {/* A — Dados da empresa */}
        <SectionCard title="Dados da Empresa" subtitle="Informações institucionais utilizadas em contratos e relatórios.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Razão social"      value={company.razaoSocial}     onChange={(v) => setCompany((c) => ({ ...c, razaoSocial: v }))} />
            <FormField label="Nome fantasia"     value={company.nomeFantasia}    onChange={(v) => setCompany((c) => ({ ...c, nomeFantasia: v }))} />
            <FormField label="CNPJ"              value={company.cnpj}            readOnly />
            <FormField label="Responsável RH"    value={company.responsavelRH}   onChange={(v) => setCompany((c) => ({ ...c, responsavelRH: v }))} />
            <FormField label="E-mail financeiro" value={company.emailFinanceiro} onChange={(v) => setCompany((c) => ({ ...c, emailFinanceiro: v }))} type="email" />
            <FormField label="Telefone"          value={company.telefone}        onChange={(v) => setCompany((c) => ({ ...c, telefone: v }))} />
            <div className="sm:col-span-2">
              <FormField label="Endereço" value={company.endereco} onChange={(v) => setCompany((c) => ({ ...c, endereco: v }))} />
            </div>
          </div>
        </SectionCard>

        {/* B — Regras do benefício */}
        <SectionCard
          title="Regras do Benefício"
          subtitle="A margem é calculada com base no salário líquido informado na folha."
        >
          {/* Percentual de margem */}
          <div className="mb-5 rounded-xl border border-[#FFD700]/20 bg-[#1A1A00] px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FFD700] mb-2">
              Percentual máximo de margem consignável
            </p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-[#FFD700]">{rules.marginPct}%</span>
              <div className="flex-1">
                <input
                  type="range" min={10} max={35} value={rules.marginPct}
                  onChange={(e) => setRule('marginPct', Number(e.target.value))}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, #FFD700 ${((rules.marginPct - 10) / 25) * 100}%, #2a2a2a ${((rules.marginPct - 10) / 25) * 100}%)` }}
                />
                <p className="text-[10px] text-[#555] mt-1">Regra padrão APROVA: limite de até 30% do salário líquido.</p>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div>
            <Toggle checked={rules.allowNewContracts}   onChange={(v) => setRule('allowNewContracts', v)}   label="Permitir novos contratos"                sub="Quando desativado, colaboradores não podem gerar tokens." />
            <Toggle checked={rules.requireRhApproval}   onChange={(v) => setRule('requireRhApproval', v)}   label="Exigir aprovação do RH antes do token"   sub="Token só é gerado após validação manual do RH." />
            <Toggle checked={rules.allowTrialEmployees}  onChange={(v) => setRule('allowTrialEmployees', v)}  label="Permitir colaboradores em experiência"    sub="Colaboradores em período de experiência podem usar o benefício." />
            <Toggle checked={rules.autoBlockDismissed}   onChange={(v) => setRule('autoBlockDismissed', v)}   label="Bloquear automaticamente colaboradores desligados" sub="Desligados devem permanecer no histórico para auditoria." />
          </div>

          {/* Dias de fechamento */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444] block mb-1.5">Dia limite de fechamento da folha</label>
              <input
                type="number" min={1} max={31} value={rules.payrollCloseDay}
                onChange={(e) => setRule('payrollCloseDay', Number(e.target.value))}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFD700]/40"
              />
              <p className="text-[10px] text-[#444] mt-1">O fechamento mensal consolida os descontos enviados à folha.</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444] block mb-1.5">Dia previsto de repasse</label>
              <input
                type="number" min={1} max={31} value={rules.payrollTransferDay}
                onChange={(e) => setRule('payrollTransferDay', Number(e.target.value))}
                className="w-full rounded-xl border border-[#1A1A1A] bg-[#161616] px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFD700]/40"
              />
            </div>
          </div>
        </SectionCard>

        {/* C — Permissões de acesso */}
        <SectionCard title="Permissões de Acesso" subtitle="Gerencie quem pode acessar e operar o Portal do RH.">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  {['Usuário', 'Perfil', 'Status', 'Último acesso', ''].map((h) => (
                    <th key={h} className="py-2.5 px-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0F0F0F] transition-colors">
                    <td className="py-3 px-3">
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      <p className="text-xs text-[#444]">{u.email}</p>
                    </td>
                    <td className="py-3 px-3 text-sm text-[#888]">{ROLE_LABEL[u.role]}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        u.status === 'active'
                          ? 'text-green-400 bg-green-400/10 border-green-400/20'
                          : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#555]">{u.lastAccess}</td>
                    <td className="py-3 px-3">
                      <button className="text-xs font-bold text-[#555] hover:text-[#FFD700] transition-colors">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setToast('Convite de usuário — integração com backend pendente.')}
            className="mt-4 flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#FFD700]/30 hover:text-[#FFD700] transition-all"
          >
            <UserPlus size={15} strokeWidth={2} />
            Convidar usuário
          </button>
        </SectionCard>

        {/* D — Integração de folha */}
        <SectionCard title="Integração de Folha" subtitle="Gerencie as importações de folha e modelos CSV.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Última importação',    value: IMPORT_HISTORY.lastImport,             color: 'text-white'      },
              { label: 'Registros processados', value: IMPORT_HISTORY.processed.toString(),   color: 'text-emerald-400' },
              { label: 'Erros encontrados',    value: IMPORT_HISTORY.errors.toString(),       color: IMPORT_HISTORY.errors > 0 ? 'text-red-400' : 'text-[#555]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444]">{label}</p>
                <p className={`mt-2 text-lg font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setToast('Download do modelo CSV — integração com backend pendente.')}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all"
            >
              <Download size={14} strokeWidth={2} /> Baixar modelo CSV
            </button>
            <button
              onClick={() => setToast('Importação de folha — use a página de Colaboradores.')}
              className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2.5 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all"
            >
              <Upload size={14} strokeWidth={2.5} /> Importar nova folha
            </button>
            <button
              onClick={() => setToast('Histórico de importações — integração com backend pendente.')}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm font-bold text-[#888] hover:border-[#444] hover:text-white transition-all"
            >
              Ver histórico de importações
            </button>
          </div>
        </SectionCard>

        {/* E — Notificações */}
        <SectionCard title="Notificações" subtitle="Configure os alertas enviados ao e-mail do responsável RH.">
          <Toggle checked={notifs.newPurchase}    onChange={(v) => setNotif('newPurchase', v)}    label="Nova compra aprovada"             sub="Avisar quando um colaborador finalizar uma compra com token." />
          <Toggle checked={notifs.nearClosing}    onChange={(v) => setNotif('nearClosing', v)}    label="Contratos próximos do fechamento" sub="Avisar contratos a vencer no próximo ciclo da folha." />
          <Toggle checked={notifs.weeklySummary}  onChange={(v) => setNotif('weeklySummary', v)}  label="Resumo semanal"                   sub="Enviar todo domingo um resumo do uso da margem." />
          <Toggle checked={notifs.criticalMargin} onChange={(v) => setNotif('criticalMargin', v)} label="Alerta de margem crítica"          sub="Notificar quando o uso ultrapassar 80% da margem empresarial." />
          <Toggle checked={notifs.importErrors}   onChange={(v) => setNotif('importErrors', v)}   label="Falhas na importação CSV"          sub="Receber alerta quando houver erros na importação de folha." />
        </SectionCard>

        {/* F — Segurança */}
        <SectionCard title="Segurança" subtitle="Gerencie acesso, autenticação e auditoria da conta.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Key,     label: 'Alterar senha',                 sub: 'Redefina a senha de acesso ao portal.',              action: 'Alterar' },
              { icon: Shield,  label: 'Autenticação em dois fatores',  sub: 'Adicione uma camada extra de segurança ao login.',    action: 'Configurar' },
              { icon: Bell,    label: 'Sessões ativas',                sub: 'Visualize e encerre sessões em outros dispositivos.', action: 'Ver sessões' },
              { icon: Save,    label: 'Log de auditoria',              sub: 'Histórico completo de ações no portal.',              action: 'Ver log' },
            ].map(({ icon: Icon, label, sub, action }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#161616]">
                  <Icon size={15} className="text-[#555]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-[#444] mt-0.5">{sub}</p>
                  <button
                    onClick={() => setToast(`${action} — integração com backend pendente.`)}
                    className="mt-2 text-xs font-bold text-[#FFD700] hover:underline"
                  >
                    {action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Sticky save bar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3 text-sm font-black text-[#0A0A0A] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
          >
            <Save size={15} strokeWidth={2.5} />
            Salvar todas as alterações
          </button>
        </div>

      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
