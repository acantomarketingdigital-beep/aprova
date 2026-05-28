// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatPct(v: number, d = 1) {
  return `${v.toFixed(d)}%`;
}
export function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

// ─── Partner profile ──────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me

export const MOCK_PARTNER = {
  id: 'partner-1',
  name: 'Clínica Viva Mais',
  category: 'Estética & Saúde',
  initials: 'CV',
  plan: 'free' as 'free' | 'premium',
  hasCompletedSale: true,
  planActivatedAt: null as string | null,
};

// ─── Plan ─────────────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/plan

export const MOCK_PLAN = {
  monthlyPrice: 197,
  takeRate: 12,
  chargeMethod: 'discount_from_receivables' as const,
  isActive: false,
  eligibleToActivate: true,
  nextBillingDate: null as string | null,
};

// ─── Sales metrics by period ──────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/metrics?period=X

export const MOCK_METRICS = {
  today: {
    salesGross: 12400, tokensGenerated: 8, tokensConverted: 3,
    conversionRate: 37.5, ticketAvg: 820, upsellRate: 25, campaignROI: 0,
  },
  '7d': {
    salesGross: 42600, tokensGenerated: 21, tokensConverted: 11,
    conversionRate: 52.4, ticketAvg: 790, upsellRate: 31.2, campaignROI: 2.8,
  },
  '30d': {
    salesGross: 87400, tokensGenerated: 42, tokensConverted: 18,
    conversionRate: 42.8, ticketAvg: 820, upsellRate: 34.2, campaignROI: 3.8,
  },
  month: {
    salesGross: 87400, tokensGenerated: 42, tokensConverted: 18,
    conversionRate: 42.8, ticketAvg: 820, upsellRate: 34.2, campaignROI: 3.8,
  },
};

// ─── Conversion funnel ────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/funnel?period=X

export const MOCK_FUNNEL = {
  views: 2430,
  clicks: 312,
  simulations: 186,
  tokensGenerated: 42,
  tokensValidated: 18,
  salesCompleted: 16,
};

// ─── Transactions ──────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/transactions

export type TxStatus = 'token_generated' | 'pending' | 'approved' | 'completed' | 'rejected' | 'expired' | 'cancelled';

export interface Transaction {
  id: string;
  clientName: string;
  offer: string;
  amount: number;
  installments: number;
  token: string;
  createdAt: string;
  status: TxStatus;
}

export const TX_STATUS_CFG: Record<TxStatus, { label: string; cls: string }> = {
  token_generated: { label: 'Token gerado',          cls: 'text-sky-400     bg-sky-400/10     border-sky-400/20'     },
  pending:         { label: 'Aguardando validação',  cls: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20'  },
  approved:        { label: 'Aprovado',              cls: 'text-green-400   bg-green-400/10   border-green-400/20'   },
  completed:       { label: 'Concluído',             cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  rejected:        { label: 'Rejeitado',             cls: 'text-red-400     bg-red-400/10     border-red-400/20'     },
  expired:         { label: 'Expirado',              cls: 'text-orange-400  bg-orange-400/10  border-orange-400/20'  },
  cancelled:       { label: 'Cancelado',             cls: 'text-[#555]      bg-[#1A1A1A]      border-[#2A2A2A]'      },
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', clientName: 'João Silva',      offer: 'Combo Ozônio + Recovery', amount: 1080, installments: 12, token: 'ABX-4F2', createdAt: new Date().toISOString(),                           status: 'approved'        },
  { id: 't2', clientName: 'Maria Santos',    offer: 'Pacote Facial Premium',   amount: 720,  installments: 10, token: 'GHK-7R1', createdAt: new Date(Date.now() - 3600000).toISOString(),        status: 'completed'       },
  { id: 't3', clientName: 'Carlos Oliveira', offer: 'Botox Facial',            amount: 890,  installments: 6,  token: 'MNP-2Q9', createdAt: new Date(Date.now() - 7200000).toISOString(),        status: 'pending'         },
  { id: 't4', clientName: 'Ana Costa',       offer: 'Limpeza de Pele',         amount: 480,  installments: 6,  token: 'RST-8W3', createdAt: new Date(Date.now() - 10800000).toISOString(),       status: 'completed'       },
  { id: 't5', clientName: 'Pedro Lima',      offer: 'Combo Ozônio + Recovery', amount: 1080, installments: 12, token: 'UVX-1K5', createdAt: new Date(Date.now() - 86400000).toISOString(),       status: 'rejected'        },
  { id: 't6', clientName: 'Fernanda Rocha',  offer: 'Hidratação Profunda',     amount: 360,  installments: 6,  token: 'YZA-6P7', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),   status: 'token_generated' },
  { id: 't7', clientName: 'Lucas Mendes',    offer: 'Pacote Facial Premium',   amount: 720,  installments: 10, token: 'BCD-3E1', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),   status: 'expired'         },
];

// ─── Campaigns ─────────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/campaigns

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type CampaignType = 'banner' | 'partner_highlight' | 'premium_card' | 'related_offer' | 'sponsored_coupon';

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  banner:            'Banner Principal',
  partner_highlight: 'Parceiro em Destaque',
  premium_card:      'Card Premium',
  related_offer:     'Oferta Relacionada',
  sponsored_coupon:  'Cupom Patrocinado',
};

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  tokens: number;
  sales: number;
  revenue: number;
}

export const MOCK_CAMPAIGNS: Campaign[] = [];

// ─── Art specifications ───────────────────────────────────────────────────────

export const ART_SPECS: Record<CampaignType, { desktop?: string; mobile?: string; square?: string; logo?: string; note: string }> = {
  banner: {
    desktop: '1600 × 500 px',
    mobile:  '900 × 900 px',
    note: 'Use imagem sem muito texto para evitar corte. Área segura central.',
  },
  partner_highlight: {
    logo:    '512 × 512 px',
    desktop: '1200 × 600 px (capa opcional)',
    note: 'Logo com fundo transparente (PNG recomendado).',
  },
  premium_card: {
    square: '1000 × 1000 px',
    note: 'Imagem quadrada. Evite texto pequeno — o card tem overlay de preço.',
  },
  related_offer: {
    square: '1000 × 1000 px',
    note: 'Mesmo padrão do card premium. Foco no produto/serviço.',
  },
  sponsored_coupon: {
    note: 'Cupons patrocinados não precisam de imagem obrigatória. Usam cor e selo de destaque.',
  },
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/coupons

export type CouponBenefit = 'free_eval' | 'bonus_session' | 'return_included' | 'discount_brl' | 'discount_pct' | 'gift' | 'priority';

export const COUPON_BENEFIT_LABELS: Record<CouponBenefit, string> = {
  free_eval:       'Avaliação grátis',
  bonus_session:   'Sessão bônus',
  return_included: 'Retorno incluso',
  discount_brl:    'Desconto em reais',
  discount_pct:    'Desconto percentual',
  gift:            'Brinde',
  priority:        'Agendamento prioritário',
};

export interface Coupon {
  id: string;
  name: string;
  code: string;
  benefit: CouponBenefit;
  description: string;
  offer: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  tokensGenerated: number;
  salesAttribued: number;
  status: 'active' | 'paused' | 'ended';
  showInMarketplace: boolean;
}

export const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', name: 'Avaliação Grátis Verão', code: 'VIVA10',  benefit: 'free_eval',       description: 'Avaliação gratuita em qualquer procedimento estético', offer: 'Combo Ozônio + Recovery', expiresAt: '30/06/2026', maxUses: 100, usedCount: 23, tokensGenerated: 31, salesAttribued: 18, status: 'active', showInMarketplace: true  },
  { id: 'c2', name: 'Sessão Bônus Facial',    code: 'BONUS15', benefit: 'bonus_session',    description: 'Sessão bônus na compra do pacote facial',               offer: 'Pacote Facial Premium',   expiresAt: '31/05/2026', maxUses: 50,  usedCount: 12, tokensGenerated: 15, salesAttribued: 9,  status: 'active', showInMarketplace: true  },
  { id: 'c3', name: 'Retorno Incluso',        code: 'RETORNO', benefit: 'return_included',  description: 'Consulta + retorno em 30 dias sem custo adicional',    offer: 'Limpeza de Pele',         expiresAt: '15/07/2026', maxUses: 200, usedCount: 8,  tokensGenerated: 10, salesAttribued: 7,  status: 'paused', showInMarketplace: false },
];

// ─── Offers ───────────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/partners/me/products

export interface Offer {
  id: string;
  name: string;
  category: string;
  description: string;
  totalValue: number;
  installments: number;
  status: 'active' | 'paused' | 'draft';
  showInMarketplace: boolean;
  allowUpsell: boolean;
  campaignLinked: string | null;
}

export const MOCK_OFFERS: Offer[] = [
  { id: 'o1', name: 'Combo Ozônio + Recovery', category: 'Estética', description: 'Sessão combinada para bem-estar e cuidado estético', totalValue: 1080, installments: 12, status: 'active', showInMarketplace: true,  allowUpsell: true,  campaignLinked: null },
  { id: 'o2', name: 'Pacote Facial Premium',   category: 'Estética', description: 'Tratamento completo facial com produtos premium',   totalValue: 720,  installments: 10, status: 'active', showInMarketplace: true,  allowUpsell: true,  campaignLinked: null },
  { id: 'o3', name: 'Botox Facial',            category: 'Estética', description: 'Aplicação de botox com avaliação inclusa',          totalValue: 890,  installments: 6,  status: 'active', showInMarketplace: true,  allowUpsell: false, campaignLinked: null },
  { id: 'o4', name: 'Limpeza de Pele',         category: 'Estética', description: 'Limpeza profunda com hidratação',                   totalValue: 480,  installments: 6,  status: 'active', showInMarketplace: false, allowUpsell: true,  campaignLinked: null },
  { id: 'o5', name: 'Hidratação Profunda',     category: 'Estética', description: 'Tratamento hidratante intensivo',                   totalValue: 360,  installments: 6,  status: 'paused', showInMarketplace: false, allowUpsell: false, campaignLinked: null },
];

// ─── Documents ────────────────────────────────────────────────────────────────
// TODO: substituir por GET /api/v1/documents?type=partner

export interface Document {
  id: string;
  title: string;
  description: string;
  version: string;
  updatedAt: string;
  accepted: boolean;
}

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', title: 'Termo de Adesão do Parceiro',           description: 'Contrato de parceria com o APROVA',               version: '2.1', updatedAt: '01/05/2026', accepted: true  },
  { id: 'd2', title: 'Regulamento de Campanhas Inteligentes', description: 'Regras para criação e veiculação de campanhas',   version: '1.3', updatedAt: '15/04/2026', accepted: false },
  { id: 'd3', title: 'Manual de Uso do Token APROVA',         description: 'Como validar tokens no balcão',                   version: '1.0', updatedAt: '01/03/2026', accepted: true  },
  { id: 'd4', title: 'Guia de Criação de Artes',              description: 'Dimensões, formatos e boas práticas visuais',     version: '1.1', updatedAt: '10/04/2026', accepted: true  },
  { id: 'd5', title: 'Política de Repasse',                   description: 'Como funciona o repasse financeiro ao parceiro',  version: '1.2', updatedAt: '20/04/2026', accepted: true  },
  { id: 'd6', title: 'Política de Cancelamento',              description: 'Regras para cancelamento e estornos',             version: '1.0', updatedAt: '01/03/2026', accepted: true  },
];
