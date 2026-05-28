'use client';

import { useState } from 'react';
import { ArrowDown, X } from 'lucide-react';
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
    eyebrow: 'Parceiro em Destaque',
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
  { id: '1', name: 'Clínica Viva Mais',  initial: 'V', color: 'bg-emerald-700', featured: true,  plan: 'premium', category: 'Estética & Saúde', status: 'Agenda aberta'      },
  { id: '2', name: 'Sorriso Prime',       initial: 'S', color: 'bg-sky-700',     featured: true,  plan: 'premium', category: 'Odontologia',       status: 'Aceita token APROVA' },
  { id: '3', name: 'Obra Forte',          initial: 'O', color: 'bg-amber-700',   featured: false, plan: 'free'                                                                  },
  { id: '4', name: 'Next Skill Academy',  initial: 'N', color: 'bg-violet-700',  featured: false, plan: 'free'                                                                  },
  { id: '5', name: 'Mobility Store',      initial: 'M', color: 'bg-lime-700',    featured: false, plan: 'free'                                                                  },
  { id: '6', name: 'TurismoBrasil',       initial: 'T', color: 'bg-rose-700',    featured: false, plan: 'free'                                                                  },
  { id: '7', name: 'AutoCenter Plus',     initial: 'A', color: 'bg-orange-700',  featured: false, plan: 'free'                                                                  },
  { id: '8', name: 'MedFácil',            initial: 'M', color: 'bg-teal-700',    featured: true,  plan: 'premium', category: 'Saúde',             status: 'Ofertas ativas'      },
];

const MOCK_MINI_BANNER: MiniBannerData = {
  eyebrow: 'Oferta relâmpago',
  title: 'Viaje nas férias sem comprometer o salário',
  href: '/app?categoria=viagens',
  emoji: '✈️',
};

// Cupons exclusivos de parceiros pagantes (Plano Destaque)
// TODO: GET /api/v1/coupons/active?worker=:id — filtrar por margem e parceiros premium
const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    partnerId: '1',
    partnerName: 'Clínica Viva Mais',
    label: 'Avaliação grátis',
    description: 'Avaliação gratuita com qualquer procedimento estético',
    code: 'VIVA10',
    validUntil: 'Hoje',
    relatedProductId: 'combo-ozonio',
  },
  {
    id: 'c2',
    partnerId: '2',
    partnerName: 'Sorriso Prime',
    label: 'Sessão bônus',
    description: 'Ganhe uma sessão bônus na compra do pacote odonto',
    code: 'SORRI20',
    validUntil: 'Amanhã',
    relatedProductId: 'pacote-odonto',
  },
  {
    id: 'c3',
    partnerId: '8',
    partnerName: 'MedFácil',
    label: 'Retorno incluso',
    description: 'Consulta + retorno em 30 dias sem custo adicional',
    code: 'MED30',
    validUntil: 'Esta semana',
    relatedProductId: 'pacote-saude',
  },
];

// isFeatured = parceiro no Plano Destaque (R$197/mês) → badge ⭐ + posição prioritária
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
    details: ['Rede credenciada', 'Token de 6 dígitos'],
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
    details: ['2 dependentes inclusos', 'Resultado em 48h'],
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
    details: ['Retirada na loja', 'Parcelas fixas'],
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
    details: ['Certificado incluso', 'Início imediato'],
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
    details: ['Garantia do parceiro', 'Retirada agendada'],
    isFeatured: false,
  },
];

// ─── Tipos de modal ────────────────────────────────────────────────────────────
type Modal = 'detail' | 'token' | 'no-offer' | null;

// ─── Modal "Escolha uma oferta" (sem oferta selecionada) ──────────────────────
function NoOfferModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-3xl border border-white/[0.08] bg-[#161616] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] text-[#555] hover:text-white"
        >
          <X size={14} />
        </button>

        <div className="mb-5 text-center">
          <span className="text-5xl">🛍️</span>
          <h3 className="mt-3 text-lg font-black leading-tight text-white">
            Escolha uma oferta ou parceiro
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#666]">
            Para gerar seu token, selecione uma oferta que caiba na sua margem ou escolha um parceiro credenciado.
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD700] py-3.5 text-sm font-black text-[#0D0D0D] shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all hover:brightness-110"
        >
          <ArrowDown size={16} strokeWidth={2.5} />
          Ver ofertas que cabem na minha margem
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 text-sm font-bold text-[#555] transition-colors hover:text-white"
        >
          Fechar
        </button>
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkerMarketplacePage() {
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // packageItems = itens adicionados via upsell (além da oferta principal)
  const [packageItems, setPackageItems] = useState<Product[]>([]);

  // Abre o detalhe de uma oferta pelo objeto
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setPackageItems([]);
    setActiveModal('detail');
  };

  // Abre o detalhe de uma oferta pelo id (usado pelo CTA "Usar agora" dos cupons)
  // TODO: quando vier da API, buscar o produto por id no endpoint /api/v1/products/:id
  const handleOpenDetailById = (productId: string) => {
    const found = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (found) handleOpenDetail(found);
  };

  // Clique no TokenBar: se não há oferta selecionada, mostra modal explicativo
  const handleTokenBarClick = () => {
    if (activeModal === null) {
      setActiveModal('no-offer');
    }
  };

  // Fecha modal de detalhe e abre token
  // TODO: quando backend suportar múltiplos itens, enviar [selectedProduct, ...packageItems]
  //       para POST /api/v1/qr-codes como payload { items: [{productId, installments}] }
  const handleGerarTokenFromDetail = () => {
    setActiveModal('token');
  };

  const handleClose = () => {
    setActiveModal(null);
    setSelectedProduct(null);
    setPackageItems([]);
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
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoriesScroll active={activeCategory} onSelect={setActiveCategory} />
          <HeroBanner banners={MOCK_HERO_BANNERS} />

          {/* Parceiros em destaque — apenas plan:'premium' */}
          <PartnersScroll partners={MOCK_PARTNERS} />

          <MiniBanner data={MOCK_MINI_BANNER} />

          {/* Cupons — exclusivo parceiros pagantes; "Usar agora" abre o modal da oferta */}
          <CouponBlock coupons={MOCK_COUPONS} onViewOffer={handleOpenDetailById} />

          {/* Grade de ofertas — parceiros premium ordenados primeiro */}
          <ProductsGrid
            products={MOCK_PRODUCTS}
            userLimit={MOCK_USER.availableLimit}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSimular={handleOpenDetail}
          />
        </div>
      </div>

      {/* Barra inferior fixa — comportamento contextual */}
      <TokenBar onClick={handleTokenBarClick} />

      {/* Modal: usuário clicou no token sem ter oferta selecionada */}
      {activeModal === 'no-offer' && (
        <NoOfferModal onClose={handleClose} />
      )}

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

      {/* Modal de token (QR + código de 6 dígitos + countdown 15 min) */}
      {activeModal === 'token' && (
        <TokenModal onClose={handleClose} />
      )}
    </main>
  );
}
