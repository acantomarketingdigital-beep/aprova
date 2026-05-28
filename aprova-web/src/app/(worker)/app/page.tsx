'use client';

import { useState } from 'react';
import MarketplaceHeader from './components/MarketplaceHeader';
import SearchBar from './components/SearchBar';
import CategoriesScroll from './components/CategoriesScroll';
import HeroBanner, { type HeroBannerItem } from './components/HeroBanner';
import PartnersScroll, { type Partner } from './components/PartnersScroll';
import MiniBanner, { type MiniBannerData } from './components/MiniBanner';
import CouponBlock, { type Coupon } from './components/CouponBlock';
import ProductsGrid from './components/ProductsGrid';
import OfferDetailModal from './components/OfferDetailModal';
import TokenModal from './components/TokenModal';
import TokenBar from './components/TokenBar';
import type { Product } from './components/ProductCard';

// ─── Mock data ─────────────────────────────────────────────────────────────────
// TODO: substituir por chamadas à API quando endpoints estiverem prontos:
//   GET /api/v1/workers/me          → MOCK_USER
//   GET /api/v1/products?worker=:id → MOCK_PRODUCTS
//   GET /api/v1/partners/featured   → MOCK_PARTNERS (plan=premium)
//   GET /api/v1/coupons/active      → MOCK_COUPONS

const MOCK_USER = {
  name: 'Marina',
  availableLimit: 4820,
};

const MOCK_HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'flash-estetica',
    eyebrow: 'Flash Sale — Só hoje',
    title: 'Condição especial para usar sua margem hoje',
    subtitle: 'Check-up estético: pague em até 12x direto na folha, sem cartão.',
    href: '/app/oferta/combo-ozonio',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/55 to-transparent',
  },
  {
    id: 'reforma-casa',
    eyebrow: 'Parceiro Destaque da Semana',
    title: 'Reforma sem apertar o caixa do mês',
    subtitle: 'Materiais e ferramentas em parcelas previsíveis na sua folha.',
    href: '/app/oferta/material-construcao',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
  {
    id: 'saude-familia',
    eyebrow: 'Saúde da Família',
    title: 'Odonto e consultas — gere o token na hora',
    subtitle: 'Apresente o código no balcão do parceiro e parcele na folha.',
    href: '/app/oferta/pacote-odonto',
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
  {
    id: 'educacao-tech',
    eyebrow: 'Invista em Você',
    title: 'Cursos de tecnologia com início imediato',
    subtitle: 'Trilhas com certificado e mentoria — parcele sem juros na folha.',
    href: '/app/oferta/curso-tecnologia',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
];

// plan: 'premium' = paga R$197/mês (Plano Destaque) → aparece no carrossel e espaços premium
// plan: 'free'    = só comissão de 12% → aparece apenas organicamente na listagem
const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'Clínica Viva Mais',  initial: 'V', color: 'bg-emerald-700', featured: true,  plan: 'premium' },
  { id: '2', name: 'Sorriso Prime',       initial: 'S', color: 'bg-sky-700',     featured: true,  plan: 'premium' },
  { id: '3', name: 'Obra Forte',          initial: 'O', color: 'bg-amber-700',   featured: false, plan: 'free'    },
  { id: '4', name: 'Next Skill Academy',  initial: 'N', color: 'bg-violet-700',  featured: false, plan: 'free'    },
  { id: '5', name: 'Mobility Store',      initial: 'M', color: 'bg-lime-700',    featured: false, plan: 'free'    },
  { id: '6', name: 'TurismoBrasil',       initial: 'T', color: 'bg-rose-700',    featured: false, plan: 'free'    },
  { id: '7', name: 'AutoCenter Plus',     initial: 'A', color: 'bg-orange-700',  featured: false, plan: 'free'    },
  { id: '8', name: 'MedFácil',            initial: 'M', color: 'bg-teal-700',    featured: true,  plan: 'premium' },
];

const MOCK_MINI_BANNER: MiniBannerData = {
  eyebrow: 'Oferta relâmpago',
  title: 'Viaje nas férias sem comprometer o salário',
  href: '/app?categoria=viagens',
  emoji: '✈️',
};

// Cupons exclusivos de parceiros pagantes (Plano Destaque)
// TODO: GET /api/v1/coupons/active?worker=:id — filtrar por margem do trabalhador
const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    partnerId: '1',
    partnerName: 'Clínica Viva Mais',
    label: 'Avaliação grátis',
    description: 'Avaliação gratuita com qualquer procedimento estético',
    code: 'VIVA10',
    validUntil: 'Hoje',
  },
  {
    id: 'c2',
    partnerId: '2',
    partnerName: 'Sorriso Prime',
    label: 'Sessão bônus',
    description: 'Ganhe uma sessão bônus na compra do pacote odonto',
    code: 'SORRI20',
    validUntil: 'Amanhã',
  },
  {
    id: 'c3',
    partnerId: '8',
    partnerName: 'MedFácil',
    label: 'Retorno incluso',
    description: 'Consulta + retorno em 30 dias sem custo adicional',
    code: 'MED30',
    validUntil: 'Esta semana',
  },
];

// isFeatured = parceiro no Plano Destaque (R$197/mês) → aparece primeiro + badge ⭐
// isSponsored = aparece em banner principal (futuro controle via API)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'combo-ozonio',
    title: 'Combo Ozônio + Recovery',
    partner: 'Clínica Viva Mais',
    partnerId: '1',
    category: 'estetica',
    description: 'Sessão combinada para bem-estar, recuperação e cuidado estético com agendamento prioritário.',
    valorTotal: 1080,
    installments: 12,
    emoji: '💆‍♀️',
    bgGradient: 'bg-gradient-to-br from-rose-950/80 to-[#161616]',
    accent: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
    badge: 'Mais buscado',
    details: ['Avaliação inclusa', 'Agenda prioritária', 'Token aceito no balcão'],
    destaque: true,
    isFeatured: true,
  },
  {
    id: 'pacote-odonto',
    title: 'Pacote Odonto Preventivo',
    partner: 'Sorriso Prime',
    partnerId: '2',
    category: 'odonto',
    description: 'Limpeza, avaliação e radiografia com pagamento por desconto em folha.',
    valorTotal: 720,
    installments: 10,
    emoji: '🦷',
    bgGradient: 'bg-gradient-to-br from-sky-950/80 to-[#161616]',
    accent: 'bg-sky-400/15 text-sky-200 border-sky-400/30',
    badge: 'Agenda aberta',
    details: ['Rede credenciada', 'Sem cartão de crédito', 'Token de 6 dígitos'],
    isFeatured: true,
  },
  {
    id: 'pacote-saude',
    title: 'Check-up Completo Família',
    partner: 'MedFácil',
    partnerId: '8',
    category: 'saude',
    description: 'Consulta, hemograma e ultrassonografia para você e mais um dependente.',
    valorTotal: 840,
    installments: 10,
    emoji: '🏥',
    bgGradient: 'bg-gradient-to-br from-teal-950/80 to-[#161616]',
    accent: 'bg-teal-400/15 text-teal-200 border-teal-400/30',
    badge: 'Novidade',
    details: ['2 dependentes inclusos', 'Resultado em 48h', 'Token no balcão'],
    isFeatured: true,
  },
  {
    id: 'material-construcao',
    title: 'Material de Construção',
    partner: 'Obra Forte',
    partnerId: '3',
    category: 'construcao',
    description: 'Crédito para compra de cimento, pisos, ferramentas e itens essenciais de reforma.',
    valorTotal: 1440,
    installments: 12,
    emoji: '🧱',
    bgGradient: 'bg-gradient-to-br from-amber-950/80 to-[#161616]',
    accent: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    badge: 'Flash sale',
    details: ['Retirada na loja', 'Parcelas fixas', 'Válido para itens selecionados'],
    isFeatured: false,
  },
  {
    id: 'curso-tecnologia',
    title: 'Curso de Tecnologia',
    partner: 'Next Skill Academy',
    partnerId: '4',
    category: 'educacao',
    description: 'Trilha profissionalizante com aulas online, mentoria e certificado final.',
    valorTotal: 960,
    installments: 12,
    emoji: '💻',
    bgGradient: 'bg-gradient-to-br from-violet-950/80 to-[#161616]',
    accent: 'bg-violet-400/15 text-violet-200 border-violet-400/30',
    badge: 'Carreira',
    details: ['Certificado incluso', 'Acesso por 12 meses', 'Início imediato'],
    isFeatured: false,
  },
  {
    id: 'bike-eletrica',
    title: 'Bike Elétrica Urbana',
    partner: 'Mobility Store',
    partnerId: '5',
    category: 'veiculos',
    description: 'Mobilidade diária com manutenção inicial e retirada no parceiro autorizado.',
    valorTotal: 2160,
    installments: 12,
    emoji: '🚲',
    bgGradient: 'bg-gradient-to-br from-lime-950/80 to-[#161616]',
    accent: 'bg-lime-400/15 text-lime-200 border-lime-400/30',
    badge: 'Entrega rápida',
    details: ['Garantia do parceiro', 'Retirada agendada', 'Parcelas na folha'],
    isFeatured: false,
  },
];

// ─── Tipos de modal ────────────────────────────────────────────────────────────

type Modal = 'detail' | 'token' | null;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkerMarketplacePage() {
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // packageItems = itens adicionados via upsell (além da oferta principal)
  const [packageItems, setPackageItems] = useState<Product[]>([]);

  // Abre o detalhe da oferta (substitui o SimuladorModal anterior)
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setPackageItems([]);
    setActiveModal('detail');
  };

  // Abre o TokenModal a partir do detalhe ou da barra inferior
  const handleOpenToken = () => {
    setActiveModal('token');
  };

  // Fecha qualquer modal e limpa o pacote
  const handleClose = () => {
    setActiveModal(null);
    setSelectedProduct(null);
    setPackageItems([]);
  };

  // Fecha só o detalhe e abre o token (chamado pelo CTA do OfferDetailModal)
  const handleGerarTokenFromDetail = () => {
    // TODO: quando backend suportar múltiplos itens no token,
    // enviar [selectedProduct, ...packageItems] como payload de /api/v1/qr-codes
    setActiveModal('token');
  };

  const handleAddToPackage = (product: Product) => {
    setPackageItems((prev) =>
      prev.some((p) => p.id === product.id) ? prev : [...prev, product],
    );
  };

  const handleRemoveFromPackage = (id: string) => {
    setPackageItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <MarketplaceHeader
        workerName={MOCK_USER.name}
        availableLimit={MOCK_USER.availableLimit}
      />

      <div className="mx-auto w-full max-w-[1400px]">
        <div className="pt-4">
          {/* Busca */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Categorias */}
          <CategoriesScroll active={activeCategory} onSelect={setActiveCategory} />

          {/* Banner hero — patrocinado por parceiros pagantes */}
          <HeroBanner banners={MOCK_HERO_BANNERS} />

          {/* Parceiros em destaque — apenas plan: 'premium' */}
          <PartnersScroll partners={MOCK_PARTNERS} />

          {/* Mini banner relâmpago */}
          <MiniBanner data={MOCK_MINI_BANNER} />

          {/* Cupons — exclusivo parceiros pagantes */}
          <CouponBlock coupons={MOCK_COUPONS} />

          {/* Grade de ofertas */}
          <ProductsGrid
            products={MOCK_PRODUCTS}
            userLimit={MOCK_USER.availableLimit}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSimular={handleOpenDetail}
          />
        </div>
      </div>

      {/* Barra inferior fixa */}
      <TokenBar onClick={handleOpenToken} />

      {/* Modal de detalhe da oferta + upsell + pacote */}
      {activeModal === 'detail' && selectedProduct && (
        <OfferDetailModal
          product={selectedProduct}
          allProducts={MOCK_PRODUCTS}
          userLimit={MOCK_USER.availableLimit}
          packageItems={packageItems}
          onClose={handleClose}
          onGerarToken={handleGerarTokenFromDetail}
          onAddToPackage={handleAddToPackage}
          onRemoveFromPackage={handleRemoveFromPackage}
        />
      )}

      {/* Modal de token (gerar QR + código 6 dígitos) */}
      {activeModal === 'token' && (
        <TokenModal onClose={handleClose} />
      )}
    </main>
  );
}
