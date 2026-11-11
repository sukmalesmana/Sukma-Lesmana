import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  BookOpen,
  UserCheck,
  LogOut,
  Sparkles,
  Lock,
  X,
  ArrowRight
} from 'lucide-react';
import { GroupId, UserSession } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentUser: UserSession | null;
  onLogout: () => void;
  onOpenTheory: () => void;
  onSwitchRole: (role: 'student' | 'gm', group?: GroupId, name?: string) => void;
  onGmLoginSuccess: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenTheory,
  onSwitchRole,
  onGmLoginSuccess,
  soundEnabled,
  onToggleSound,
  isCloudConnected = true
}) => {
  const [showGmDropdown, setShowGmDropdown] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const PIN_DOSEN = '140299';

  const handleGmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === PIN_DOSEN) {
      sound.playSuccess();
      setShowGmDropdown(false);
      setPinInput('');
      setPinError(false);
      onGmLoginSuccess();
    } else {
      sound.playAlert();
      setPinError(true);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        {/* Logo and Titles */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan shadow-lg flex-shrink-0 text-white">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-wider text-white">
                AGENCY WARS
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold tracking-wide">
                The Behaviour Simulation
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Simulasi Akuntansi Keperilakuan & Teori Agensi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Cloud Firestore Sync Badge */}
          <div
            className={`hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
              isCloudConnected
                ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/70 border-amber-500/30 text-amber-400'
            }`}
            title="Sinkronisasi Cloud Firestore aktif (agency-war-778c7)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span>
              {isCloudConnected ? 'Cloud Firestore Connected' : 'Local Sync Active'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theory Reference Modal Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTheory();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kamus Teori</span>
          </button>

          {/* Quick Demo Switcher if logged in */}
          {currentUser && (
            <div className="relative group">
              <button
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                title="Ganti Peran Cepat (Fitur Pengujian / Simulasi)"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Ganti Peran:</span>
                <span className="font-bold text-white uppercase">
                  {currentUser.role === 'gm' ? 'GM (Dosen)' : currentUser.group}
                </span>
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl p-1.5 space-y-1 hidden group-hover:block z-50">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Uji Coba Peran
                </div>
                {(['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as GroupId[]).map((gid) => (
                  <button
                    key={gid}
                    onClick={() => {
                      sound.playClick();
                      onSwitchRole('student', gid, `Mahasiswa (${gid})`);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      currentUser.role === 'student' && currentUser.group === gid
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Kelompok {gid}</span>
                    {currentUser.role === 'student' && currentUser.group === gid && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (currentUser.role === 'gm') return;
                    setShowGmDropdown(true);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    currentUser.role === 'gm'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-amber-300 hover:bg-amber-950/40'
                  }`}
                >
                  <span className="flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    <span>Dosen (Game Master)</span>
                  </span>
                  {currentUser.role === 'gm' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Dosen Login Button or Popover */}
          <div className="relative">
            {(!currentUser || currentUser.role !== 'gm') && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowGmDropdown(!showGmDropdown);
                }}
                className="px-3 sm:px-4 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold transition border border-amber-500/30 flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Login Dosen</span>
              </button>
            )}

            {/* GM Login Dropdown Form */}
            {showGmDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-panel-amber p-4 rounded-2xl border border-amber-500/40 space-y-3 z-50 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Otentikasi Dosen / Game Master</span>
                  </span>
                  <button
                    onClick={() => setShowGmDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleGmSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      PIN Akses Dosen
                    </label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Masukkan PIN Akses Dosen..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                    {pinError && (
                      <p className="text-[11px] text-rose-400 mt-1">
                        PIN akses Dosen tidak valid. Silakan coba kembali.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition shadow flex items-center justify-center space-x-1.5"
                  >
                    <span>Masuk Ruang Dosen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition border border-slate-700 flex items-center space-x-1"
              title="Keluar Sesi"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
