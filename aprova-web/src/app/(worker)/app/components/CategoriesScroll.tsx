'use client';

const CATEGORIES = [
  { slug: 'estetica',   emoji: '💆‍♀️', label: 'Estética',   bg: 'bg-rose-950/60',    border: 'border-rose-500/20',    text: 'text-rose-200'    },
  { slug: 'odonto',     emoji: '🦷',   label: 'Odonto',     bg: 'bg-sky-950/60',     border: 'border-sky-500/20',     text: 'text-sky-200'     },
  { slug: 'viagens',    emoji: '✈️',   label: 'Viagens',    bg: 'bg-violet-950/60',  border: 'border-violet-500/20',  text: 'text-violet-200'  },
  { slug: 'construcao', emoji: '🧱',   label: 'Construção', bg: 'bg-amber-950/60',   border: 'border-amber-500/20',   text: 'text-amber-200'   },
  { slug: 'veiculos',   emoji: '🚗',   label: 'Veículos',   bg: 'bg-lime-950/60',    border: 'border-lime-500/20',    text: 'text-lime-200'    },
  { slug: 'educacao',   emoji: '📚',   label: 'Educação',   bg: 'bg-indigo-950/60',  border: 'border-indigo-500/20',  text: 'text-indigo-200'  },
  { slug: 'saude',      emoji: '🏥',   label: 'Saúde',      bg: 'bg-emerald-950/60', border: 'border-emerald-500/20', text: 'text-emerald-200' },
  { slug: 'tecnologia', emoji: '💻',   label: 'Tecnologia', bg: 'bg-cyan-950/60',    border: 'border-cyan-500/20',    text: 'text-cyan-200'    },
];

interface CategoriesScrollProps {
  active: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoriesScroll({ active, onSelect }: CategoriesScrollProps) {
  return (
    <section className="px-4 pb-4 sm:px-6">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelect(isActive ? null : cat.slug)}
              className={`group flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110
                ${cat.bg} ${cat.border}
                ${isActive ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-[#0D0D0D]' : ''}`}
            >
              <span className="text-3xl leading-none">{cat.emoji}</span>
              <span className={`text-[11px] font-black uppercase tracking-wide ${cat.text}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
