import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Clock,
  Lock,
  Send,
  FileText,
  Download,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { CaseData, ClassData, GroupId, UserSession } from '../types';
import { GROUPS_META } from '../data/cases';
import { computeTimers, formatSecondsToMS, generateComprehensiveReport, saveClassData } from '../utils/storage';
import { BehaviorChart } from './BehaviorChart';
import { sound } from '../utils/audio';

interface TeamRoomViewProps {
  currentUser: UserSession;
  classData: ClassData;
  activeCase: CaseData;
  onUpdateClassData: (newData: ClassData) => void;
  onDownloadReport: () => void;
  onOpenOfficialReport?: () => void;
  onDownloadCsv?: () => void;
}

export const TeamRoomView: React.FC<TeamRoomViewProps> = ({
  currentUser,
  classData,
  activeCase,
  onUpdateClassData,
  onDownloadReport,
  onOpenOfficialReport,
  onDownloadCsv
}) => {
  const currentGroupId = (currentUser.group || 'G1') as GroupId;
  const currentMeta = GROUPS_META[currentGroupId];
  const timers = computeTimers(classData);

  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [showHelperTips, setShowHelperTips] = useState(false);
  const [expandedDecisions, setExpandedDecisions] = useState<Record<string, boolean>>({});

  const isTriggerTeam = currentGroupId === activeCase.triggerTeam;
  const isTriggerWindowExpired = timers.triggerTimer <= 0;
  const decisionsObj = classData.decisions || {};
  const isTriggerTeamSubmitted = !!decisionsObj[activeCase.triggerTeam];
  const myExistingDecision = decisionsObj[currentGroupId];

  // Locking rules: non-trigger team cannot submit until trigger team submits OR 30m window expires
  const isLocked = !isTriggerTeam && !isTriggerTeamSubmitted && !isTriggerWindowExpired;

  // Initialize input with existing decision if already submitted
  React.useEffect(() => {
    if (myExistingDecision && !inputTitle && !inputContent) {
      setInputTitle(myExistingDecision.title);
      setInputContent(myExistingDecision.content);
    }
  }, [myExistingDecision]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim() || !inputContent.trim()) {
      sound.playAlert();
      alert('Mohon lengkapi judul dan uraian keputusan kelompok.');
      return;
    }

    const updatedDecisions = {
      ...classData.decisions,
      [currentGroupId]: {
        title: inputTitle.trim(),
        content: inputContent.trim(),
        timestamp: new Date().toLocaleTimeString('id-ID'),
        author: currentUser.name,
        submittedAt: Date.now()
      }
    };

    const updatedData: ClassData = {
      ...classData,
      decisions: updatedDecisions
    };

    saveClassData(currentUser.kelas, updatedData);
    onUpdateClassData(updatedData);
    sound.playSuccess();

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore
    }
  };

  const toggleExpandDecision = (gid: string) => {
    setExpandedDecisions((prev) => ({ ...prev, [gid]: !prev[gid] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Info Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Left: Team Identity */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${currentMeta.bgGlowClass} flex items-center justify-center font-black text-white text-xl shadow-lg flex-shrink-0`}
          >
            {currentMeta.id}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h2 className="text-base sm:text-xl font-black text-white truncate">
                {currentMeta.roleTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                {currentUser.kelas}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center space-x-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Perwakilan:</span>
              <span className="text-slate-200 font-semibold">{currentUser.name}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-cyan-400 font-semibold">{currentMeta.agencyRole}</span>
            </p>
          </div>
        </div>

        {/* Right: Real-time Live Timers */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end flex-wrap gap-2">
          {/* Total Sisa Waktu */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 text-center flex-1 sm:flex-initial">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Total Waktu Sesi</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {formatSecondsToMS(timers.globalTimer)}
            </div>
          </div>

          {/* Trigger Team Window Timer */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 text-center flex-1 sm:flex-initial">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Trigger Window</span>
            </div>
            <div
              className={`text-lg sm:text-2xl font-black font-mono mt-0.5 ${
                timers.triggerTimer <= 0 ? 'text-slate-500' : 'text-amber-400'
              }`}
            >
              {formatSecondsToMS(timers.triggerTimer)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Case & Instructions, Right = Decision Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skenario Kasus */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                  Kasus {classData.activeCase}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isTriggerTeam
                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                      : isLocked
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isTriggerTeam
                    ? '🎯 Anda adalah Trigger Team'
                    : isLocked
                    ? '⏳ Menunggu Trigger Team'
                    : '⚡ Fase Respons Aktif'}
                </span>
              </div>

              {/* Case Title & Story */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeCase.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                  {activeCase.desc}
                </p>
              </div>

              {/* Key Concept Chips */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Konsep Keperilakuan Relevan:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCase.keyConcepts.map((kc, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-medium"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific Group Instructions */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Instruksi Khusus Untuk {currentMeta.roleTitle}:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {isTriggerTeam
                    ? activeCase.instructions[currentGroupId] || activeCase.instructions.default
                    : activeCase.instructions.default}
                </p>
              </div>
            </div>

            {/* Helper Questions Drawer Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelperTips(!showHelperTips)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-between border border-slate-800 transition"
              >
                <span className="flex items-center space-x-1.5 text-cyan-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Panduan Berpikir Teori Agensi</span>
                </span>
                {showHelperTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHelperTips && (
                <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2 animate-in fade-in">
                  <div className="font-bold text-slate-200">Gunakan pertanyaan pemantik ini:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Apakah keputusan ini menguntungkan tujuan jangka panjang perusahaan (Goal Congruence)?</li>
                    <li>Apakah ada informasi yang sengaja disembunyikan atau belum transparan (Information Asymmetry)?</li>
                    <li>Bagaimana mekanisme pengawasan atau insentif dirancang agar agen tidak berbuat curang (Moral Hazard)?</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Decision Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Formulasi Keputusan & Argumen Kelompok</span>
                </h3>
                {myExistingDecision && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Tersubmit ({myExistingDecision.timestamp})</span>
                  </span>
                )}
              </div>

              {/* Locked Banner if applicable */}
              {isLocked && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start space-x-3">
                  <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Formulir Terkunci Sementara</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Kelompok non-trigger ({currentGroupId}) harus menunggu Trigger Team (
                      <strong>{activeCase.triggerRoleName}</strong>) mengirimkan keputusan awal, atau
                      menunggu jendela waktu 30 menit berakhir.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Judul Keputusan / Argumen Utama
                  </label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="cth: Pengajuan Budget Konservatif & Mitigasi Slack 6%..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Uraian Keputusan & Analisis Teori Agensi</span>
                    <span className="text-[10px] text-slate-400 normal-case">
                      {inputContent.length} karakter
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    disabled={isLocked}
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Jelaskan secara mendalam dasar analisis kelompok Anda: pertimbangan goal congruence, asimetri informasi kapasitas/biaya, mitigasi moral hazard, dan risiko manajerial..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLocked}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-lg ${
                    isLocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {myExistingDecision ? 'Perbarui Keputusan Kelompok' : 'Kirim Keputusan Kelompok'}
                  </span>
                </button>
              </form>
            </div>

            {myExistingDecision && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2 mt-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Keputusan Anda sudah disubmit dan tersinkronisasi ke Room Dosen serta kelompok lain. Anda tetap dapat mengeditnya jika diperlukan.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rekapitulasi Keputusan Semua Kelompok */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rekapitulasi Keputusan Semua Kelompok (6 Kelompok)
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Live Feed
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenOfficialReport) onOpenOfficialReport();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              title="Cetak Berita Acara Perkuliahan atau Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Berita Acara & Cetak PDF</span>
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                if (onDownloadCsv) onDownloadCsv();
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              title="Unduh Rekap Nilai ke format Microsoft Excel (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.CSV)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onDownloadReport();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
              title="Unduh Laporan Analisis Teks (.txt)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Teks (.txt)</span>
            </button>
          </div>
        </div>

        {/* Decisions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as GroupId[]).map((gid) => {
            const meta = GROUPS_META[gid];
            const dec = decisionsObj[gid];
            const isMine = gid === currentGroupId;
            const isExpanded = !!expandedDecisions[gid];

            return (
              <div
                key={gid}
                className={`p-4 rounded-2xl border transition ${
                  dec
                    ? 'bg-slate-900/90 border-emerald-500/30'
                    : 'bg-slate-900/50 border-slate-800/80'
                } ${isMine ? 'ring-1 ring-cyan-500/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        dec ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {gid}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      {meta.roleTitle.split('(')[0]}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dec
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {dec ? 'Sudah Submit' : 'Menunggu'}
                  </span>
                </div>

                {dec ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-100 line-clamp-1">
                      "{dec.title}"
                    </div>
                    <p
                      className={`text-xs text-slate-300 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-3'
                      }`}
                    >
                      {dec.content}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                      <span>Oleh: {dec.author}</span>
                      <button
                        onClick={() => toggleExpandDecision(gid)}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        {isExpanded ? 'Tutup' : 'Selengkapnya'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    Belum mengirimkan formulasi keputusan.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Behaviour Score Comparative Chart */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <BehaviorChart decisions={decisionsObj} accentColor="emerald" />
      </div>
    </div>
  );
};
