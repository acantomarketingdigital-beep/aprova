'use client';

import { useState } from 'react';
import MarketplaceHeader from './components/MarketplaceHeader';
import SearchBar from './components/SearchBar';
import CategoriesScroll from './components/CategoriesScroll';
import HeroBanner, { type HeroBannerItem } from './components/HeroBanner';
import PartnersScroll, { type Partner } from './components/PartnersScroll';
import MiniBanner, { type MiniBannerData } from './components/MiniBanner';
import ProductsGrid from './components/ProductsGrid';
import SimuladorModal from './components/SimuladorModal';
import TokenModal from './components/TokenModal';
import TokenBar from './components/TokenBar';
import type { Product } from './components/ProductCard';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'Marina',
  availableLimit: 4820,
};

const MOCK_HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'flash-estetica',
    eyebrow: 'Flash Sale — Só hoje',
    title: 'Check-up estético com condições de folha',
    subtitle: 'Reserve hoje e pague em até 12x no benefício APROVA.',
    href: '/app/oferta/combo-ozonio',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/55 to-transparent',
  },
  {
    id: 'reforma-casa',
    eyebrow: 'Parceiros da Semana',
    title: 'Reforma sem apertar o caixa do mês',
    subtitle: 'Materiais, ferramentas e acabamento em parcelas previsíveis.',
    href: '/app/oferta/material-construcao',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
  {
    id: 'saude-familia',
    eyebrow: 'Saúde da Família',
    title: 'Odonto e consultas com token na hora',
    subtitle: 'Gere o código no celular ou no PC e apresente no balcão.',
    href: '/app/oferta/pacote-odonto',
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
  {
    id: 'educacao-tech',
    eyebrow: 'Invista em Você',
    title: 'Cursos de tecnologia com início imediato',
    subtitle: 'Trilhas online com certificado e mentoria inclusa.',
    href: '/app/oferta/curso-tecnologia',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0A0A0A]/95 via-[#0A0A0A]/50 to-transparent',
  },
];

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'Clínica Viva Mais',   initial: 'V', color: 'bg-emerald-700', featured: true  },
  { id: '2', name: 'Sorriso Prime',        initial: 'S', color: 'bg-sky-700',     featured: true  },
  { id: '3', name: 'Obra Forte',           initial: 'O', color: 'bg-amber-700',   featured: false },
  { id: '4', name: 'Next Skill Academy',   initial: 'N', color: 'bg-violet-700',  featured: false },
  { id: '5', name: 'Mobility Store',       initial: 'M', color: 'bg-lime-700',    featured: false },
  { id: '6', name: 'TurismoBrasil',        initial: 'T', color: 'bg-rose-700',    featured: false },
  { id: '7', name: 'AutoCenter Plus',      initial: 'A', color: 'bg-orange-700',  featured: false },
  { id: '8', name: 'MedFácil',             initial: 'M', color: 'bg-teal-700',    featured: true  },
];

const MOCK_MINI_BANNER: MiniBannerData = {
  eyebrow: 'Oferta relâmpago',
  title: 'Viaje nas férias sem comprometer o salário',
  href: '/app?categoria=viagens',
  emoji: '✈️',
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'combo-ozonio',
    title: 'Combo Ozônio + Recovery',
    partner: 'Clínica Viva Mais',
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
  },
  {
    id: 'material-construcao',
    title: 'Material de Construção',
    partner: 'Obra Forte',
    category: 'construcao',
    description: 'Crédito para compra de cimento, pisos, ferramentas e itens essenciais de reforma.',
    valorTotal: 1440,
    installments: 12,
    emoji: '🧱',
    bgGradient: 'bg-gradient-to-br from-amber-950/80 to-[#161616]',
    accent: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    badge: 'Flash sale',
    details: ['Retirada na loja', 'Parcelas fixas', 'Válido para itens selecionados'],
  },
  {
    id: 'pacote-odonto',
    title: 'Pacote Odonto Preventivo',
    partner: 'Sorriso Prime',
    category: 'odonto',
    description: 'Limpeza, avaliação e radiografia com pagamento por desconto em folha.',
    valorTotal: 720,
    installments: 10,
    emoji: '🦷',
    bgGradient: 'bg-gradient-to-br from-sky-950/80 to-[#161616]',
    accent: 'bg-sky-400/15 text-sky-200 border-sky-400/30',
    badge: 'Agenda aberta',
    details: ['Rede credenciada', 'Sem cartão de crédito', 'Token de 6 dígitos'],
  },
  {
    id: 'curso-tecnologia',
    title: 'Curso de Tecnologia',
    partner: 'Next Skill Academy',
    category: 'educacao',
    description: 'Trilha profissionalizante com aulas online, mentoria e certificado final.',
    valorTotal: 960,
    installments: 12,
    emoji: '💻',
    bgGradient: 'bg-gradient-to-br from-violet-950/80 to-[#161616]',
    accent: 'bg-violet-400/15 text-violet-200 border-violet-400/30',
    badge: 'Carreira',
    details: ['Certificado incluso', 'Acesso por 12 meses', 'Início imediato'],
  },
  {
    id: 'bike-eletrica',
    title: 'Bike Elétrica Urbana',
    partner: 'Mobility Store',
    category: 'veiculos',
    description: 'Mobilidade diária com manutenção inicial e retirada no parceiro autorizado.',
    valorTotal: 2160,
    installments: 12,
    emoji: '🚲',
    bgGradient: 'bg-gradient-to-br from-lime-950/80 to-[#161616]',
    accent: 'bg-lime-400/15 text-lime-200 border-lime-400/30',
    badge: 'Entrega rápida',
    details: ['Garantia do parceiro', 'Retirada agendada', 'Parcelas na folha'],
  },
  {
    id: 'pacote-saude',
    title: 'Check-up Completo Família',
    partner: 'MedFácil',
    category: 'saude',
    description: 'Consulta, hemograma e ultrassonografia para você e mais um dependente.',
    valorTotal: 840,
    installments: 10,
    emoji: '🏥',
    bgGradient: 'bg-gradient-to-br from-teal-950/80 to-[#161616]',
    accent: 'bg-teal-400/15 text-teal-200 border-teal-400/30',
    badge: 'Novidade',
    details: ['2 dependentes inclusos', 'Resultado em 48h', 'Token no balcão'],
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

type Modal = 'simulador' | 'token' | null;

export default function WorkerMarketplacePage() {
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSimular = (product: Product) => {
    setSelectedProduct(product);
    setActiveModal('simulador');
  };

  const handleOpenToken = () => {
    setActiveModal('token');
  };

  const handleClose = () => {
    setActiveModal(null);
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
          <PartnersScroll partners={MOCK_PARTNERS} />
          <MiniBanner data={MOCK_MINI_BANNER} />
          <ProductsGrid
            products={MOCK_PRODUCTS}
            userLimit={MOCK_USER.availableLimit}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSimular={handleSimular}
          />
        </div>
      </div>

      <TokenBar onClick={handleOpenToken} />

      {activeModal === 'simulador' && (
        <SimuladorModal
          product={selectedProduct}
          userLimit={MOCK_USER.availableLimit}
          onClose={handleClose}
          onGerarToken={handleOpenToken}
        />
      )}

      {activeModal === 'token' && (
        <TokenModal onClose={handleClose} />
      )}
    </main>
  );
}
