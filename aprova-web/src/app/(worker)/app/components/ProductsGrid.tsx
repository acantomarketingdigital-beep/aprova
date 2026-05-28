'use client';

import ProductCard, { type Product } from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  userLimit: number;
  searchQuery: string;
  activeCategory: string | null;
  onSimular: (product: Product) => void;
}

export default function ProductsGrid({
  products,
  userLimit,
  searchQuery,
  activeCategory,
  onSimular,
}: ProductsGridProps) {
  function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const filtered = products.filter((p) => {
    const affordable = p.valorTotal <= userLimit;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || p.category.toLowerCase().replace(/\s+/g, '-') === activeCategory;
    return affordable && matchesSearch && matchesCategory;
  });

  return (
    <section className="px-4 pb-32 sm:px-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
            Com sua margem de {formatBRL(userLimit)}
          </p>
          <h2 className="mt-0.5 text-xl font-black tracking-tight text-white sm:text-2xl">
            Oportunidades para você
          </h2>
        </div>
        <p className="text-xs font-semibold text-[#444]">
          {filtered.length} {filtered.length === 1 ? 'oferta disponível' : 'ofertas disponíveis'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/[0.06] bg-[#161616] py-16 text-center">
          <span className="text-5xl">🔍</span>
          <p className="font-black text-white">Nenhuma oferta encontrada</p>
          <p className="text-sm text-[#555]">Tente outro termo ou categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSimular={onSimular} />
          ))}
        </div>
      )}
    </section>
  );
}
