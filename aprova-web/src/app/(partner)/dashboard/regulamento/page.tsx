'use client';

import { useState } from 'react';
import { FileText, Download, Eye, ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import PartnerNav from '../../components/PartnerNav';
import { MOCK_DOCUMENTS, type Document } from '../../components/partner-data';

const RULES = [
  { title: 'Taxa APROVA de 12%',              content: 'Sobre cada venda concluída via token APROVA, o sistema retém 12% como taxa de serviço. O valor é descontado automaticamente antes do repasse ao parceiro.' },
  { title: 'Repasse ao parceiro',             content: 'O repasse ocorre conforme o ciclo de fechamento da folha de pagamento do empregador do cliente. A previsão de repasse é informada no dashboard de transações.' },
  { title: 'Validação por token',             content: 'Toda venda deve ser confirmada via token APROVA gerado pelo trabalhador. Vendas sem validação de token não são reconhecidas pelo sistema.' },
  { title: 'Cancelamentos e estornos',        content: 'Cancelamentos devem ser solicitados em até 24h após a venda. Após esse prazo, o processo segue a política de cancelamento disponível nos documentos.' },
  { title: 'Prazo de fechamento da folha',    content: 'O fechamento ocorre no dia especificado pelo RH do empregador. Vendas realizadas após o fechamento entram no ciclo seguinte.' },
  { title: 'Regras para anúncios e campanhas', content: 'Campanhas Inteligentes exigem assinatura do regulamento de campanhas. Conteúdo impróprio ou enganoso resulta em suspensão imediata. Apenas imagens estáticas são permitidas no MVP.' },
  { title: 'Uso permitido de imagens',        content: 'Apenas PNG e JPG são aceitos. Imagens devem respeitar as dimensões recomendadas. Vídeos não são permitidos nesta versão.' },
  { title: 'Regras de cupons',                content: 'Cupons patrocinados fazem parte do Plano de Anúncios. Cupons orgânicos podem ser criados gratuitamente, mas não aparecem nos espaços premium.' },
];

const ART_GUIDE = [
  { format: 'Banner Desktop',    size: '1600 × 500 px', tips: 'Área segura central. Evite texto nas bordas.' },
  { format: 'Banner Mobile',     size: '900 × 900 px',  tips: 'Quadrado. Foco no produto/serviço central.' },
  { format: 'Card de Oferta',    size: '1000 × 1000 px',tips: 'Imagem quadrada. Overlay de preço no canto.' },
  { format: 'Logo do Parceiro',  size: '512 × 512 px',  tips: 'Fundo transparente (PNG). Sem texto extra.' },
  { format: 'Capa do Parceiro',  size: '1200 × 600 px', tips: 'Opcional. Banner de capa no perfil do parceiro.' },
];

const TERMS_STATUS = [
  { label: 'Termo de parceiro',         accepted: true,  docId: 'd1' },
  { label: 'Regulamento de campanhas',  accepted: false, docId: 'd2' },
  { label: 'Política de anúncios',      accepted: true,  docId: 'd5' },
];

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1A1A1A] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-bold text-white">{title}</span>
        {open ? <ChevronDown size={15} className="text-[#555] flex-shrink-0" /> : <ChevronRight size={15} className="text-[#555] flex-shrink-0" />}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[#888]">{content}</p>
      )}
    </div>
  );
}

export default function RegulamentoPage() {
  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <PartnerNav />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">Portal do Parceiro</p>
          <h1 className="mt-1 text-2xl font-black text-white">Regulamento e Documentos</h1>
          <p className="mt-1 text-sm text-[#555]">
            Consulte as regras comerciais, documentos e orientações de uso do APROVA.
          </p>
        </div>

        {/* A — Regras comerciais */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <h2 className="font-black text-white">Regras Comerciais</h2>
          </div>
          <div className="px-6">
            {RULES.map((r) => <Accordion key={r.title} title={r.title} content={r.content} />)}
          </div>
        </div>

        {/* B — Documentos */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <h2 className="font-black text-white">Documentos Disponíveis</h2>
            <p className="mt-0.5 text-xs text-[#555]">
              TODO: conectar links de download reais via GET /api/v1/documents/:id/download
            </p>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {MOCK_DOCUMENTS.map((doc: Document) => (
              <div key={doc.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#0F0F0F] transition-colors">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#161616]">
                  <FileText size={16} className="text-[#555]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{doc.title}</p>
                  <p className="text-xs text-[#555] mt-0.5">{doc.description}</p>
                  <p className="text-[10px] text-[#333] mt-1">v{doc.version} · Atualizado em {doc.updatedAt}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(`Visualizando ${doc.title} — integração pendente.`)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-xs font-bold text-[#888] hover:text-white transition-all"
                  >
                    <Eye size={12} strokeWidth={2} /> Visualizar
                  </button>
                  <button
                    onClick={() => handleAction(`Download ${doc.title} — integração pendente.`)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-xs font-bold text-[#888] hover:text-white transition-all"
                  >
                    <Download size={12} strokeWidth={2} /> Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C — Guia de artes */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <h2 className="font-black text-white">Guia Rápido de Artes</h2>
            <p className="mt-0.5 text-xs text-[#555]">
              Use as dimensões corretas para evitar imagens cortadas no marketplace.
            </p>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {ART_GUIDE.map((a) => (
                <div key={a.format} className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]">{a.format}</p>
                  <p className="mt-1 text-xl font-black text-white">{a.size}</p>
                  <p className="mt-1 text-xs text-[#555]">{a.tips}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-xs font-bold text-red-400">
                🚫 Vídeos não são aceitos nesta versão. Apenas imagens PNG e JPG são suportadas.
              </p>
            </div>
          </div>
        </div>

        {/* D — Status dos termos */}
        <div className="rounded-2xl border border-[#1A1A1A] bg-[#111] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <h2 className="font-black text-white">Aceite de Termos</h2>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {TERMS_STATUS.map((t) => (
              <div key={t.label} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {t.accepted
                    ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                    : <AlertCircle  size={16} className="text-orange-400  flex-shrink-0" strokeWidth={2.5} />}
                  <span className="text-sm font-semibold text-white">{t.label}</span>
                </div>
                {t.accepted ? (
                  <span className="text-xs font-bold text-emerald-400">Aceito</span>
                ) : (
                  <button
                    onClick={() => handleAction(`Revisando ${t.label} — integração pendente.`)}
                    className="rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-xs font-black text-orange-400 hover:bg-orange-400/20 transition-all"
                  >
                    Revisar e aceitar →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-[#FFD700]/30 bg-[#1A1A00] px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <span className="text-[#FFD700] text-sm font-bold">{toast}</span>
          <button onClick={() => setToast(null)} className="text-[#555] hover:text-white text-xs font-bold">✕</button>
        </div>
      )}
    </div>
  );
}
