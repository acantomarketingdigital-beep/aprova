'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="px-4 py-3 sm:px-6">
      <label className="flex h-13 items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#161616] px-4 transition-colors focus-within:border-[#FFD700]/40 focus-within:bg-[#1A1A1A]">
        <Search size={18} className="flex-shrink-0 text-[#444]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3 text-sm font-semibold text-white outline-none placeholder:font-medium placeholder:text-[#444]"
          placeholder="Busque por clínicas, lojas ou serviços..."
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="flex-shrink-0 rounded-full p-1 text-[#444] transition-colors hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </label>
    </div>
  );
}
