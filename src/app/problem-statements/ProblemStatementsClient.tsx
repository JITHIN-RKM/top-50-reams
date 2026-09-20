'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Activity, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PSMeta {
  id: string;
  title: string;
  organization: string;
  theme: string;
  category: string;
  innovation_scope: number | null;
  invention_effort: number | null;
}

interface Props {
  psData: PSMeta[];
  themes: string[];
  categories: string[];
}

export default function ProblemStatementsClient({ psData, themes, categories }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [theme, setTheme] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  const filtered = useMemo(() => {
    return psData.filter((ps) => {
      const q = search.toLowerCase();
      if (q && !ps.title.toLowerCase().includes(q) && !ps.id.toLowerCase().includes(q)) return false;
      if (category && ps.category !== category) return false;
      if (theme && ps.theme !== theme) return false;
      return true;
    });
  }, [psData, search, category, theme]);

  const visible = filtered.slice(0, visibleCount);

  const resetFilters = () => { setSearch(''); setCategory(''); setTheme(''); setVisibleCount(24); };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-4xl md:text-5xl text-sih-dark mb-2">
            Problem <span className="text-sih-blue">Statements</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Browse all {psData.length} SIH 2026 problem statements. Filter by category or theme to find your match.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or PS number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(24); }}
            className="w-full pl-12 pr-4 py-3 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white outline-none transition-[border-color,background-color] duration-150 font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setVisibleCount(24); }}
            className="px-4 py-3 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white outline-none transition-[border-color,background-color] duration-150 font-bold text-sm cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={theme}
            onChange={(e) => { setTheme(e.target.value); setVisibleCount(24); }}
            className="px-4 py-3 bg-sih-gray border-2 border-transparent focus:border-sih-blue focus:bg-white outline-none transition-[border-color,background-color] duration-150 font-bold text-sm max-w-[200px] truncate cursor-pointer"
          >
            <option value="">All Themes</option>
            {themes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(search || category || theme) && (
            <button
              onClick={resetFilters}
              className="px-4 py-3 border-2 border-gray-200 text-sm font-bold text-gray-500 hover:border-red-200 hover:text-red-600 transition-[border-color,color,transform] duration-150 active:scale-[0.97] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Showing <span className="text-sih-dark">{visible.length}</span> of{' '}
        <span className="text-sih-dark">{filtered.length}</span> Results
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visible.map((ps, i) => (
          <Link
            href={`/problem-statements/${ps.id}`}
            key={ps.id}
            className="group card-enter stagger-item flex"
            style={{ animationDelay: `${(i % 24) * 40}ms` }}
          >
            <div className="bg-white border-2 border-gray-200 p-6 hover:border-sih-blue hover:shadow-[4px_4px_0_0_#0072BC] transition-[border-color,box-shadow] duration-150 w-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-sih-dark text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                  {ps.id}
                </span>
                <span className={cn(
                  'text-[10px] font-bold px-3 py-1 uppercase tracking-widest border-2',
                  ps.category === 'Software'
                    ? 'border-sih-blue text-sih-blue bg-blue-50'
                    : 'border-sih-orange text-sih-orange bg-orange-50'
                )}>
                  {ps.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sih-blue transition-[color] duration-150">
                {ps.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-1">{ps.organization}</p>

              <div className="mt-auto pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                <div className="flex gap-4">
                  {ps.innovation_scope !== null && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-sih-orange" />
                      Inn: {ps.innovation_scope}/5
                    </div>
                  )}
                  {ps.invention_effort !== null && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5 text-sih-blue" />
                      Eff: {ps.invention_effort}/5
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-sih-blue group-hover:translate-x-1 transition-[color,transform] duration-150" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 p-16 text-center">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-400">No results found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
          <button onClick={resetFilters} className="mt-4 text-sm text-sih-blue font-bold hover:underline transition-[transform] duration-150 active:scale-[0.97] cursor-pointer">
            Clear all filters
          </button>
        </div>
      )}

      {/* Load More */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-12 mb-12">
          <button
            onClick={() => setVisibleCount((v) => v + 24)}
            className="btn-outline px-10 py-4"
          >
            Load More Statements
          </button>
        </div>
      )}
    </div>
  );
}