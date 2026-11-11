import React, { useState } from 'react';
import {
  Users,
  Shield,
  ArrowRight,
  GraduationCap,
  Sparkles,
  KeyRound,
  User,
  Info,
  Lock,
  X
} from 'lucide-react';
import { GroupId } from '../types';
import { DEFAULT_CLASSES, GROUPS_META } from '../data/cases';
import { sound } from '../utils/audio';

interface LoginViewProps {
  onStudentLogin: (kelas: string, group: GroupId, name: string, pin: string) => void;
  onGmQuickLogin: (kelas: string) => void;
  onLoadDemoSimulation: (kelas: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onStudentLogin,
  onGmQuickLogin,
  onLoadDemoSimulation
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(DEFAULT_CLASSES[0]);
  const [customClass, setCustomClass] = useState<string>('');
  const [isCustomClass, setIsCustomClass] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupId>('G5'); // default to G5 (popular trigger)
  const [studentName, setStudentName] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // GM authentication state
  const [showGmPinModal, setShowGmPinModal] = useState<boolean>(false);
  const [gmPinInput, setGmPinInput] = useState<string>('');
  const [gmPinError, setGmPinError] = useState<boolean>(false);

  const PIN_DOSEN = '140299';

  const activeGroupMeta = GROUPS_META[selectedGroup];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const finalClass = isCustomClass ? customClass.trim() : selectedClass;

    if (!finalClass) {
      setErrorMsg('Silakan pilih atau masukkan kelas kuliah terlebih dahulu.');
      sound.playAlert();
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('Silakan masukkan nama mahasiswa / perwakilan.');
      sound.playAlert();
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Silakan masukkan PIN akses kelompok (minimal 4-6 karakter).');
      sound.playAlert();
      return;
    }

    sound.playSuccess();
    onStudentLogin(finalClass, selectedGroup, studentName.trim(), pin.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Title & Concept Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center space-x-2 flex-wrap gap-2 mb-1">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Akuntansi Manajemen & Perilaku
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Shield className="w-3.5 h-3.5 mr-1.5" /> Teori Agensi (Principal-Agent)
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Portal Simulasi Akuntansi Keperilakuan
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pilih kelas kuliah, tentukan kelompok peran keagenan Anda, dan rumuskan keputusan strategis
          untuk memitigasi asimetri informasi dan moral hazard secara real-time.
        </p>
      </div>

      {/* Main Card Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Pilih Kelas Kuliah</span>
              <button
                type="button"
                onClick={() => setIsCustomClass(!isCustomClass)}
                className="text-[11px] text-cyan-400 hover:underline normal-case font-medium"
              >
                {isCustomClass ? '← Pilih dari daftar kelas' : '+ Tambah kelas khusus'}
              </button>
            </label>

            {isCustomClass ? (
              <input
                type="text"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="Ketik nama kelas baru (misal: 5B Akuntansi Reguler)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            ) : (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              >
                {DEFAULT_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Group / Role Selection (Visual Grid of 6 roles) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Pilih Kelompok & Peran Keagenan
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as GroupId[]).map((gid) => {
                const meta = GROUPS_META[gid];
                const isSelected = selectedGroup === gid;
                return (
                  <button
                    type="button"
                    key={gid}
                    onClick={() => {
                      sound.playClick();
                      setSelectedGroup(gid);
                    }}
                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? `${meta.borderClass} bg-slate-800/90 ring-2 ring-cyan-400/50 shadow-lg`
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-white">{meta.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                          {meta.agencyRole.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-200 line-clamp-1">
                        {meta.roleTitle.split('(')[0]}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center">
                        <Sparkles className="w-2.5 h-2.5 mr-1" /> Terpilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Insight Box */}
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 mt-0.5">
                {activeGroupMeta.id}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span>{activeGroupMeta.roleTitle}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                    Posisi: {activeGroupMeta.agencyRole}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeGroupMeta.description}
                </p>
              </div>
            </div>
          </div>

          {/* Student Name & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nama Mahasiswa / Perwakilan</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>PIN Akses Kelompok</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan 4-6 digit PIN..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              Simpan PIN Anda. Jika lupa PIN, Dosen dapat melihat atau me-reset PIN melalui Room Dosen.
            </span>
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            <span>Mulai Simulasi Role Play</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Preload & GM Entry Shortcut */}
        <div className="border-t border-slate-800/80 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Sebagai pengajar / penguji?</span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowGmPinModal(true);
                setGmPinError(false);
                setGmPinInput('');
              }}
              className="text-amber-400 hover:underline font-bold flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Ruang Dosen</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const target = isCustomClass ? customClass : selectedClass;
              onLoadDemoSimulation(target);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center space-x-1.5 transition"
            title="Muat data simulasi contoh (Kasus 1 Budget Slack) dengan 6 keputusan kelompok sudah terisi"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Muat Demo Simulasi Lengkap</span>
          </button>
        </div>
      </div>

      {/* Secure GM PIN Modal */}
      {showGmPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel-amber p-6 rounded-3xl border border-amber-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Otentikasi Akses Dosen</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGmPinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (gmPinInput.trim() === PIN_DOSEN) {
                  sound.playSuccess();
                  setShowGmPinModal(false);
                  const targetClass = isCustomClass ? customClass.trim() : selectedClass;
                  onGmQuickLogin(targetClass);
                } else {
                  sound.playAlert();
                  setGmPinError(true);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  PIN Akses Dosen
                </label>
                <input
                  type="password"
                  value={gmPinInput}
                  onChange={(e) => setGmPinInput(e.target.value)}
                  placeholder="Masukkan PIN Dosen..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                {gmPinError && (
                  <p className="text-[11px] text-rose-400 mt-1.5">
                    PIN akses Dosen tidak valid. Silakan coba kembali.
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGmPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition shadow flex items-center justify-center space-x-1"
                >
                  <span>Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
