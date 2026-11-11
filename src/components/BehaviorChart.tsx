import React, { useState } from 'react';
import { GroupId, DecisionData } from '../types';
import { GROUPS_META } from '../data/cases';
import { evaluateDecisionScores } from '../utils/storage';
import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

interface BehaviorChartProps {
  decisions: { [key in GroupId]?: DecisionData };
  accentColor?: 'cyan' | 'emerald';
}

export const BehaviorChart: React.FC<BehaviorChartProps> = ({
  decisions,
  accentColor = 'cyan'
}) => {
  const groups: GroupId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  const [hoveredGroup, setHoveredGroup] = useState<GroupId | null>(null);

  const scores = groups.map((gid) => {
    const dec = decisions[gid];
    const evaluated = evaluateDecisionScores(dec);
    return {
      gid,
      meta: GROUPS_META[gid],
      decision: dec,
      ...evaluated
    };
  });

  const activeHoverData = hoveredGroup ? scores.find((s) => s.gid === hoveredGroup) : null;

  return (
    <div className="space-y-4">
      {/* Chart Canvas Area */}
      <div className="p-4 sm:p-5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className={`w-4 h-4 ${accentColor === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Grafik Komparatif Behaviour Score Antar Kelompok
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Skala Penilaian: 0 - 100 Poin
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="w-full h-52 sm:h-60 relative flex items-end justify-between px-2 sm:px-6 pt-6 pb-8 border-b border-slate-800">
          {/* Background Grid Lines */}
          <div className="absolute inset-x-0 top-6 border-t border-slate-800/40 text-[9px] text-slate-600 pl-1 font-mono">100</div>
          <div className="absolute inset-x-0 top-[35%] border-t border-slate-800/40 text-[9px] text-slate-600 pl-1 font-mono">75</div>
          <div className="absolute inset-x-0 top-[60%] border-t border-slate-800/40 text-[9px] text-slate-600 pl-1 font-mono">50</div>
          <div className="absolute inset-x-0 top-[85%] border-t border-slate-800/40 text-[9px] text-slate-600 pl-1 font-mono">25</div>

          {scores.map((item) => {
            const hasSubmitted = !!item.decision;
            const barHeightPercent = Math.max(item.total, 4); // at least 4% for visual presence

            return (
              <div
                key={item.gid}
                onMouseEnter={() => setHoveredGroup(item.gid)}
                onMouseLeave={() => setHoveredGroup(null)}
                className="flex-1 max-w-[58px] sm:max-w-[72px] mx-1 sm:mx-2 h-full flex flex-col justify-end items-center group cursor-pointer relative"
              >
                {/* Score Number Above Bar */}
                <span
                  className={`text-[10px] sm:text-xs font-bold mb-1.5 transition-all ${
                    hasSubmitted ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {hasSubmitted ? `${item.total}` : '0'}
                </span>

                {/* Bar Stack */}
                <div className="w-full bg-slate-800/50 rounded-t-xl overflow-hidden h-full flex flex-col justify-end relative">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-700 ease-out flex flex-col justify-between ${
                      hasSubmitted
                        ? accentColor === 'cyan'
                          ? 'bg-gradient-to-t from-cyan-600 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-gradient-to-t from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800/60'
                    }`}
                  >
                    {/* Inner glossy highlight */}
                    <div className="w-full h-1 bg-white/30 rounded-t-lg"></div>
                  </div>
                </div>

                {/* Group Label Below Bar */}
                <div className="absolute -bottom-7 flex flex-col items-center">
                  <span
                    className={`text-[10px] sm:text-xs font-bold transition-colors ${
                      hoveredGroup === item.gid ? 'text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {item.gid}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Legend */}
        <div className="mt-7 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2 pt-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className={`w-3 h-3 rounded-md ${accentColor === 'cyan' ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
              <span>Sudah Submit</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-800"></span>
              <span>Menunggu Submit</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-500">
            Arahkan kursor ke tiap batang untuk melihat rincian 4 indikator perilaku.
          </span>
        </div>
      </div>

      {/* Hovered Group Score Breakdown Detail */}
      {activeHoverData && (
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">
                {activeHoverData.gid} - {activeHoverData.meta.roleTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {activeHoverData.meta.agencyRole}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {activeHoverData.decision ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Total Skor: {activeHoverData.total}/100</span>
                </span>
              ) : (
                <span className="text-xs text-amber-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Belum Mengirim Keputusan</span>
                </span>
              )}
            </div>
          </div>

          {activeHoverData.decision ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Goal Congruence</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeHoverData.goalCongruence}/25</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Asimetri Informasi</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeHoverData.infoTransparency}/25</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Mitigasi Moral Hazard</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeHoverData.agencyMitigation}/25</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Kedalaman Analisis</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeHoverData.strategicDepth}/25</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Keputusan belum diajukan oleh kelompok ini. Formulir keputusan akan dievaluasi setelah di-submit.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
