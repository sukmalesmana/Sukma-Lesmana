import React from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { CaseData, ClassData, GroupId } from '../types';
import { GROUPS_META } from '../data/cases';
import { evaluateDecisionScores, downloadCsvReport } from '../utils/storage';
import { sound } from '../utils/audio';

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelas: string;
  classData: ClassData;
  activeCase: CaseData;
  onDownloadTxt: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  onClose,
  kelas,
  classData,
  activeCase,
  onDownloadTxt
}) => {
  if (!isOpen) return null;

  const groups: GroupId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  const decisions = classData.decisions || {};
  const scores = groups.map((g) => evaluateDecisionScores(decisions[g]));
  const submittedCount = groups.filter((g) => !!decisions[g]).length;
  const avgScore =
    submittedCount > 0
      ? Math.round(scores.reduce((acc, s) => acc + s.total, 0) / submittedCount)
      : 0;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownloadCsv = () => {
    sound.playSuccess();
    downloadCsvReport(kelas, classData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in">
        {/* Header Controls (Hidden during print) */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Berita Acara & Rekapitulasi Evaluasi Perkuliahan
              </h3>
              <p className="text-[11px] text-slate-400">
                Format dokumen akademik resmi siap cetak / simpan PDF dan ekspor Excel
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow"
              title="Cetak Berita Acara atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow"
              title="Unduh Rekap Nilai ke format Microsoft Excel (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.CSV)</span>
            </button>

            <button
              onClick={onDownloadTxt}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-1.5"
              title="Unduh format teks ringkas (.txt)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Teks (.txt)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-900/60 print:bg-white print:text-black print:p-0">
          <div
            id="printable-official-document"
            className="bg-slate-950 print:bg-white text-slate-100 print:text-black p-6 sm:p-10 rounded-2xl border border-slate-800 print:border-none shadow-xl print:shadow-none space-y-6 max-w-3xl mx-auto"
          >
            {/* Kop Resmi Surat / Dokumen Perkuliahan */}
            <div className="border-b-2 border-slate-700 print:border-black pb-4 text-center space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold tracking-wider uppercase text-cyan-400 print:text-black">
                BERITA ACARA & EVALUASI SIMULASI AKUNTANSI KEPERILAKUAN
              </h2>
              <h1 className="text-lg sm:text-xl font-black text-white print:text-black">
                AGENCY WARS SIMULATION SYSTEM
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-700">
                Mata Kuliah: Akuntansi Keperilakuan / Akuntansi Manajemen &bull; Modul Praktik Teori Keagenan
              </p>
              <p className="text-[11px] text-cyan-300 print:text-gray-600 font-medium">
                Developed by Sukma Lesmana,Ph.D &bull;{' '}
                <a
                  href="https://sukmassp.blogspot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  https://sukmassp.blogspot.com
                </a>
              </p>
            </div>

            {/* Session Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/90 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                  Kelas Kuliah:
                </span>
                <span className="font-bold text-white print:text-black">{kelas}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                  Waktu Pelaksanaan:
                </span>
                <span className="font-bold text-white print:text-black">
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                  Skenario Kasus:
                </span>
                <span className="font-bold text-white print:text-black">
                  Kasus {classData.activeCase}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                  Rata-rata Skor:
                </span>
                <span className="font-bold text-emerald-400 print:text-black">
                  {avgScore} / 100 Poin
                </span>
              </div>
            </div>

            {/* Case Synopsis */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase text-slate-400 print:text-gray-600 tracking-wider text-[11px]">
                Topik Kasus: {activeCase.title}
              </span>
              <p className="text-slate-300 print:text-gray-800 leading-relaxed text-[11px]">
                {activeCase.desc}
              </p>
            </div>

            {/* Score & Evaluation Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-300 print:text-black">
                  Rekapitulasi Nilai & Kinerja Keagenan 6 Kelompok:
                </span>
                <span className="text-[11px] text-slate-400 print:text-gray-600">
                  Partisipasi: {submittedCount}/6 Kelompok Selesai
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 print:border-gray-400 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 print:bg-gray-200 border-b border-slate-800 print:border-gray-400 text-[10px] uppercase font-bold text-slate-300 print:text-black">
                      <th className="p-2.5">Kelompok</th>
                      <th className="p-2.5">Peran Keagenan</th>
                      <th className="p-2.5">Mahasiswa</th>
                      <th className="p-2.5 text-center">Goal Cong.</th>
                      <th className="p-2.5 text-center">Asimetri</th>
                      <th className="p-2.5 text-center">Moral Haz.</th>
                      <th className="p-2.5 text-center">Strategis</th>
                      <th className="p-2.5 text-center font-black">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 print:divide-gray-300 text-[11px]">
                    {groups.map((gid) => {
                      const meta = GROUPS_META[gid];
                      const dec = decisions[gid];
                      const sc = evaluateDecisionScores(dec);

                      return (
                        <tr
                          key={gid}
                          className="hover:bg-slate-900/50 print:hover:bg-transparent"
                        >
                          <td className="p-2.5 font-bold text-cyan-400 print:text-black">{gid}</td>
                          <td className="p-2.5 text-slate-200 print:text-gray-800">
                            {meta.roleTitle.split('(')[0]}
                          </td>
                          <td className="p-2.5 text-slate-300 print:text-gray-700">
                            {dec ? dec.author : <span className="italic text-slate-500">Belum Submit</span>}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300 print:text-black">
                            {dec ? `${sc.goalCongruence}/25` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300 print:text-black">
                            {dec ? `${sc.infoTransparency}/25` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300 print:text-black">
                            {dec ? `${sc.agencyMitigation}/25` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300 print:text-black">
                            {dec ? `${sc.strategicDepth}/25` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-400 print:text-black">
                            {dec ? `${sc.total}` : '0'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decisions Summary Detail */}
            <div className="space-y-3 pt-2">
              <span className="font-bold uppercase tracking-wider text-slate-300 print:text-black text-xs block">
                Ringkasan Formulasi Keputusan Kelompok:
              </span>
              <div className="space-y-2 text-xs">
                {groups.map((gid) => {
                  const dec = decisions[gid];
                  if (!dec) return null;
                  return (
                    <div
                      key={gid}
                      className="p-3 bg-slate-900/80 print:bg-gray-50 rounded-xl border border-slate-800 print:border-gray-300 text-[11px] space-y-1"
                    >
                      <div className="font-bold text-white print:text-black flex justify-between">
                        <span>
                          [{gid}] {GROUPS_META[gid].roleTitle} - "{dec.title}"
                        </span>
                        <span className="text-slate-400 print:text-gray-600">
                          {dec.author} ({dec.timestamp})
                        </span>
                      </div>
                      <p className="text-slate-300 print:text-gray-700 leading-relaxed">
                        {dec.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lecturer Assessment Notes */}
            {classData.gmNotes && (
              <div className="p-3.5 bg-amber-950/20 print:bg-gray-100 rounded-xl border border-amber-500/30 print:border-gray-400 text-xs space-y-1">
                <span className="font-bold text-amber-400 print:text-black text-[11px] uppercase block">
                  Catatan Evaluasi Dosen Pengampu:
                </span>
                <p className="text-slate-300 print:text-gray-800 text-[11px] leading-relaxed">
                  {classData.gmNotes}
                </p>
              </div>
            )}

            {/* Signature Block for Dosen */}
            <div className="pt-6 border-t border-slate-800 print:border-gray-400 flex justify-between items-end text-xs">
              <div className="text-slate-400 print:text-gray-600 text-[10px] space-y-0.5">
                <div>Dokumen Verifikasi Otentik Agency Wars</div>
                <div>ID Kelas: {kelas}</div>
                <div>Cloud Firestore Synced: agency-war-778c7</div>
              </div>

              <div className="text-center space-y-12">
                <div className="text-slate-300 print:text-gray-700">
                  Dosen Pengampu Mata Kuliah,
                </div>
                <div className="border-t border-slate-600 print:border-black pt-1 font-bold text-white print:text-black">
                  Sukma Lesmana, Ph.D
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden during print) */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>Gunakan tombol "Cetak / PDF" untuk menyimpan salinan resmi ke laptop/perangkat Anda.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
