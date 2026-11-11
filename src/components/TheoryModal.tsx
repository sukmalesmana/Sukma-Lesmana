import React, { useState } from 'react';
import { BookOpen, X, Sparkles, Shield, Search, ArrowRight } from 'lucide-react';
import { THEORY_CONCEPTS } from '../data/cases';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = THEORY_CONCEPTS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in">
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl relative">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Kamus Teori & Konsep Akuntansi Keperilakuan
                </h3>
                <p className="text-[11px] text-slate-400">
                  Landasan teoritis untuk merumuskan argumen keputusan simulasi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari konsep (misal: Agency, Moral Hazard, Slack, Heuristik)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto my-3 pr-1 space-y-3 flex-grow">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Tidak ada konsep teori yang sesuai dengan kata kunci "{searchTerm}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{item.title}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold font-mono">
                    {item.author}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Agency Wars &bull; Modul Pembelajaran Interaktif</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
