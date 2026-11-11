import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Shield,
  FileText,
  Download,
  Trash2,
  Key,
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Layers,
  GraduationCap,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { CaseData, CaseId, ClassData, GroupId } from '../types';
import { CASES_DATA, DEFAULT_CLASSES, GROUPS_META } from '../data/cases';
import { computeTimers, formatSecondsToMS, generateComprehensiveReport, saveClassData, populateDemoDataForClass } from '../utils/storage';
import { BehaviorChart } from './BehaviorChart';
import { sound } from '../utils/audio';

interface GMRoomViewProps {
  currentClass: string;
  classData: ClassData;
  activeCase: CaseData;
  onChangeClass: (kelas: string) => void;
  onUpdateClassData: (newData: ClassData) => void;
  onDownloadReport: () => void;
  onOpenOfficialReport?: () => void;
  onDownloadCsv?: () => void;
}

export const GMRoomView: React.FC<GMRoomViewProps> = ({
  currentClass,
  classData,
  activeCase,
  onChangeClass,
  onUpdateClassData,
  onDownloadReport,
  onOpenOfficialReport,
  onDownloadCsv
}) => {
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [showConfirmDeleteStudent, setShowConfirmDeleteStudent] = useState<string | null>(null);
  const [gmNotesInput, setGmNotesInput] = useState(classData.gmNotes || '');

  const timers = computeTimers(classData);
  const decisions = classData.decisions || {};
  const studentProfiles = classData.studentProfiles || {};
  const profileKeys = Object.keys(studentProfiles);

  const toggleTimer = () => {
    sound.playClick();
    const now = Date.now();
    let updated: ClassData;

    if (classData.timerRunning) {
      // Pause
      const elapsed = classData.absoluteStartTime
        ? Math.floor((now - classData.absoluteStartTime) / 1000)
        : 0;
      updated = {
        ...classData,
        timerRunning: false,
        absoluteStartTime: null,
        accumulatedPausedTime: (classData.accumulatedPausedTime || 0) + elapsed
      };
    } else {
      // Start or Resume
      updated = {
        ...classData,
        timerRunning: true,
        absoluteStartTime: now
      };
    }

    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
  };

  const resetTimer = () => {
    sound.playAlert();
    const updated: ClassData = {
      ...classData,
      timerRunning: false,
      absoluteStartTime: null,
      accumulatedPausedTime: 0
    };
    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
  };

  const handleCaseChange = (newCaseId: CaseId) => {
    sound.playClick();
    const updated: ClassData = {
      ...classData,
      activeCase: newCaseId
    };
    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
  };

  const handleDeleteStudent = (key: string) => {
    sound.playAlert();
    const updatedProfiles = { ...studentProfiles };
    delete updatedProfiles[key];
    const updated: ClassData = {
      ...classData,
      studentProfiles: updatedProfiles
    };
    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
    setShowConfirmDeleteStudent(null);
  };

  const handleResetAllStudents = () => {
    sound.playAlert();
    const updated: ClassData = {
      ...classData,
      studentProfiles: {},
      decisions: {}
    };
    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
    setShowConfirmResetModal(false);
  };

  const handleSaveNotes = () => {
    sound.playSuccess();
    const updated: ClassData = {
      ...classData,
      gmNotes: gmNotesInput
    };
    saveClassData(currentClass, updated);
    onUpdateClassData(updated);
    alert('Catatan evaluasi Dosen berhasil disimpan!');
  };

  const handleLoadDemo = () => {
    sound.playSuccess();
    const demoData = populateDemoDataForClass(currentClass);
    onUpdateClassData(demoData);
  };

  return (
    <div className="space-y-6">
      {/* Top Control Bar for Dosen */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* GM Badge & Current Class */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-white text-xl shadow-lg flex-shrink-0 glow-amber">
            GM
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-white truncate">
                Game Master Control Panel
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                Ruang Dosen Pengampu
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelas Terpilih: <span className="text-amber-400 font-semibold">{currentClass}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Timers */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Class Switcher */}
          <select
            value={currentClass}
            onChange={(e) => onChangeClass(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            {DEFAULT_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Timer Display */}
          <div className="px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-2">Waktu:</span>
            <span className="text-base font-black text-cyan-400 font-mono">
              {formatSecondsToMS(timers.globalTimer)}
            </span>
          </div>

          {/* Timer Toggle Play/Pause */}
          <button
            onClick={toggleTimer}
            className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs transition flex items-center space-x-1.5 shadow ${
              classData.timerRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {classData.timerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda Waktu</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Mulai (60m)</span>
              </>
            )}
          </button>

          {/* Reset Timer */}
          <button
            onClick={resetTimer}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 flex items-center space-x-1"
            title="Reset Timer ke 60 Menit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Preload Demo Button */}
          <button
            onClick={handleLoadDemo}
            className="px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-300 font-bold text-xs transition border border-purple-500/30 flex items-center space-x-1"
            title="Isi data simulasi demo lengkap dengan 6 keputusan kelompok"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Muat Demo</span>
          </button>
        </div>
      </div>

      {/* Case Scenario Selector & 6 Groups Live Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Case Switcher */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Pilih Skenario Kasus Aktif</span>
            </h3>

            <div className="space-y-2">
              {(['1', '2', '3', '4', '5'] as CaseId[]).map((cid) => {
                const c = CASES_DATA[cid];
                const isActive = classData.activeCase === cid;
                return (
                  <button
                    key={cid}
                    onClick={() => handleCaseChange(cid)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{c.title}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">
                        Trigger: {c.triggerRoleName}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Status Jendela Trigger:</div>
              <div className="flex justify-between items-center text-xs">
                <span>Sisa Waktu Trigger Team:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatSecondsToMS(timers.triggerTimer)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                *Kelompok non-trigger akan otomatis terbuka setelah Trigger Team submit atau jendela 30 menit berakhir.
              </p>
            </div>
          </div>
        </div>

        {/* Right: 6-Group Status Overview Grid */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Monitoring Real-Time 6 Kelompok Mahasiswa</span>
              </h3>
              <span className="text-xs text-slate-400">
                {Object.keys(decisions).length} dari 6 kelompok submit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as GroupId[]).map((gid) => {
                const meta = GROUPS_META[gid];
                const dec = decisions[gid];
                const isTrigger = gid === activeCase.triggerTeam;

                return (
                  <div
                    key={gid}
                    className={`p-3.5 rounded-2xl border transition ${
                      dec
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-white">{gid}</span>
                        {isTrigger && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            TRIGGER
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          dec
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dec ? 'Sudah Submit' : 'Belum Submit'}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-200 line-clamp-1">
                      {meta.roleTitle.split('(')[0]}
                    </div>

                    {dec ? (
                      <div className="mt-2 text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-white line-clamp-1">"{dec.title}"</div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>{dec.author}</span>
                          <span>{dec.timestamp}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-slate-500 italic">
                        Menunggu keputusan...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Student Registration Manager for Dosen */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Kelola Mahasiswa Terdaftar (Bantuan Lupa PIN & Presensi)
            </h3>
          </div>
          <button
            onClick={() => setShowConfirmResetModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Seluruh Data Kelas</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Daftar mahasiswa yang terdaftar pada kelas <strong className="text-white">{currentClass}</strong>.
          Dosen dapat melihat PIN kelompok jika mahasiswa lupa kata sandi.
        </p>

        {profileKeys.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-900/50 rounded-2xl border border-slate-800">
            Belum ada mahasiswa yang melakukan registrasi di kelas ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profileKeys.map((key) => {
              const prof = studentProfiles[key];
              return (
                <div
                  key={key}
                  className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{prof.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="text-cyan-400 font-bold">Kelompok {prof.group}</span>
                      <span>&bull;</span>
                      <span className="flex items-center text-amber-300">
                        <Key className="w-2.5 h-2.5 mr-1" /> PIN: {prof.pin}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirmDeleteStudent(key)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
                    title="Hapus Akun Mahasiswa Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Pedagogical Guide for Active Case */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Panduan Dosen & Arahan Tugas Khusus Tiap Kelompok ({activeCase.title})
          </h3>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-bold text-amber-400">{activeCase.title}</h4>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
              Trigger Team: {activeCase.triggerRoleName}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Esensi Keperilakuan:</strong> {activeCase.gmGuide.summary}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Tujuan Pembelajaran:</strong> {activeCase.gmGuide.learningGoal}
          </p>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Arahan Tugas Spesifik Tiap Kelompok:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeCase.gmGuide.groupTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span className="text-cyan-400">{item.group}</span>
                    <span>- {item.name}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Behaviour Score Chart */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <BehaviorChart decisions={decisions} accentColor="cyan" />
      </div>

      {/* Auto-Generated Evaluation Report & GM Assessment Notes */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Laporan Evaluasi & Catatan Dosen
            </h3>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenOfficialReport) onOpenOfficialReport();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              title="Cetak Berita Acara Kuliah atau Simpan PDF Resmi"
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
              title="Unduh Laporan Lengkap Teks (.txt)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Teks (.txt)</span>
            </button>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Catatan Tambahan / Umpan Balik Dosen untuk Kelas Ini:
          </label>
          <textarea
            rows={3}
            value={gmNotesInput}
            onChange={(e) => setGmNotesInput(e.target.value)}
            placeholder="Tuliskan catatan evaluasi atau poin diskusi untuk sesi kelas berikutnya..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition leading-relaxed"
          ></textarea>
          <button
            onClick={handleSaveNotes}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            Simpan Catatan Dosen
          </button>
        </div>
      </div>

      {/* Modal Confirm Reset All Students */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Konfirmasi Reset Seluruh Data</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan menghapus seluruh data registrasi mahasiswa dan keputusan yang telah dikirimkan pada kelas ini. Lanjutkan?
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmResetModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={handleResetAllStudents}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Ya, Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Single Student */}
      {showConfirmDeleteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Hapus Akun Mahasiswa</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus mahasiswa ini dari registrasi kelas?
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmDeleteStudent(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteStudent(showConfirmDeleteStudent)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
