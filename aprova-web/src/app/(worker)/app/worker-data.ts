export type WorkerOffer = {
  id: string;
  title: string;
  partner: string;
  category: string;
  description: string;
  price: number;
  installments: number;
  image: string;
  accent: string;
  badge: string;
  details: string[];
};

export type WorkerBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  tone: string;
};

export const workerName = 'Marina';
export const availableLimit = 4820;

export const workerBanners: WorkerBanner[] = [
  {
    id: 'flash-clinicas',
    eyebrow: 'Flash Sale Clinicas',
    title: 'Check-up estetico com condicoes de folha',
    subtitle: 'Reserve hoje e pague em ate 12x direto no beneficio APROVA.',
    href: '/app/oferta/combo-ozonio',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#06140f] via-[#111111]/65 to-[#0a0a0a]',
  },
  {
    id: 'casa-reforma',
    eyebrow: 'Parceiros da Semana',
    title: 'Reforma sem apertar o caixa do mes',
    subtitle: 'Materiais, ferramentas e acabamento em parcelas previsiveis.',
    href: '/app/oferta/material-construcao',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#171009] via-[#111111]/60 to-[#0a0a0a]',
  },
  {
    id: 'saude-familia',
    eyebrow: 'Saude da Familia',
    title: 'Odonto e consultas com token na hora',
    subtitle: 'Gere o codigo no celular ou no PC e apresente no balcao.',
    href: '/app/oferta/pacote-odonto',
    image:
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80',
    tone: 'from-[#0d1224] via-[#111111]/60 to-[#0a0a0a]',
  },
];

export const workerOffers: WorkerOffer[] = [
  {
    id: 'combo-ozonio',
    title: 'Combo Ozonio + Recovery',
    partner: 'Clinica Viva Mais',
    category: 'Estetica e saude',
    description:
      'Sessao combinada para bem-estar, recuperacao e cuidado estetico com agendamento prioritario.',
    price: 1080,
    installments: 12,
    image:
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80',
    accent: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    badge: 'Mais buscado',
    details: ['Avaliacao inclusa', 'Agenda prioritaria', 'Token aceito no balcao'],
  },
  {
    id: 'material-construcao',
    title: 'Material de Construcao',
    partner: 'Obra Forte',
    category: 'Casa e reforma',
    description:
      'Credito para compra de cimento, pisos, ferramentas e itens essenciais de reforma.',
    price: 1440,
    installments: 12,
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    accent: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    badge: 'Flash sale',
    details: ['Retirada na loja', 'Parcelas fixas', 'Valido para itens selecionados'],
  },
  {
    id: 'pacote-odonto',
    title: 'Pacote Odonto Preventivo',
    partner: 'Sorriso Prime',
    category: 'Odontologia',
    description:
      'Limpeza, avaliacao e radiografia com pagamento por desconto em folha.',
    price: 720,
    installments: 10,
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    accent: 'bg-sky-400/15 text-sky-200 border-sky-400/30',
    badge: 'Agenda aberta',
    details: ['Rede credenciada', 'Sem cartao de credito', 'Token de 6 digitos'],
  },
  {
    id: 'curso-tecnologia',
    title: 'Curso de Tecnologia',
    partner: 'Next Skill Academy',
    category: 'Educacao',
    description:
      'Trilha profissionalizante com aulas online, mentoria e certificado final.',
    price: 960,
    installments: 12,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    accent: 'bg-violet-400/15 text-violet-200 border-violet-400/30',
    badge: 'Carreira',
    details: ['Certificado incluso', 'Acesso por 12 meses', 'Inicio imediato'],
  },
  {
    id: 'bike-eletrica',
    title: 'Bike Eletrica Urbana',
    partner: 'Mobility Store',
    category: 'Mobilidade',
    description:
      'Mobilidade diaria com manutencao inicial e retirada no parceiro autorizado.',
    price: 2160,
    installments: 12,
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80',
    accent: 'bg-lime-400/15 text-lime-200 border-lime-400/30',
    badge: 'Entrega rapida',
    details: ['Garantia do parceiro', 'Retirada agendada', 'Parcelas na folha'],
  },
];

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getWorkerOffer(id: string) {
  return workerOffers.find((offer) => offer.id === id);
}
