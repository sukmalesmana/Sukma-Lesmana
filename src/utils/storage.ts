import { CaseId, ClassData, DecisionData, GroupId, TimerComputation } from '../types';
import { CASES_DATA } from '../data/cases';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, ensureFirebaseAuth, handleFirestoreError, OperationType } from '../firebase';

const STORAGE_PREFIX = 'agency_wars_class_';
const CHANNEL_NAME = 'agency_wars_broadcast_channel';

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Fallback to storage event
}

export function getClassStorageKey(kelas: string): string {
  const sanitized = kelas.replace(/[^a-zA-Z0-9]/g, '_');
  return `${STORAGE_PREFIX}${sanitized}`;
}

export function getFirestoreDocId(kelas: string): string {
  return kelas.replace(/[^a-zA-Z0-9]/g, '_');
}

export function getInitialClassData(activeCase: CaseId = '1'): ClassData {
  return {
    activeCase,
    timerRunning: false,
    absoluteStartTime: null,
    accumulatedPausedTime: 0,
    decisions: {},
    studentProfiles: {},
    gmNotes: '',
    updatedAt: Date.now()
  };
}

export function loadClassData(kelas: string): ClassData {
  if (typeof window === 'undefined') return getInitialClassData();
  const key = getClassStorageKey(kelas);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.decisions) parsed.decisions = {};
      if (!parsed.studentProfiles) parsed.studentProfiles = {};
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse class data from storage:', err);
  }
  return getInitialClassData();
}

export function saveClassData(kelas: string, data: ClassData) {
  if (typeof window === 'undefined') return;
  const key = getClassStorageKey(kelas);
  data.updatedAt = Date.now();
  
  // 1. Local Cache
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'CLASS_UPDATED', kelas, data });
    }
  } catch (err) {
    console.warn('Failed to save class data locally:', err);
  }

  // 2. Cloud Firestore Realtime Sync
  const docId = getFirestoreDocId(kelas);
  const docRef = doc(db, 'classes', docId);
  setDoc(docRef, data, { merge: true }).catch((err) => {
    handleFirestoreError(err, OperationType.WRITE, `classes/${docId}`);
  });
}

export function subscribeToClassUpdates(
  targetKelas: string,
  onUpdate: (data: ClassData) => void,
  onCloudStatusChange?: (connected: boolean) => void
): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'CLASS_UPDATED' && event.data.kelas === targetKelas) {
      onUpdate(event.data.data);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    const targetKey = getClassStorageKey(targetKelas);
    if (event.key === targetKey && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        onUpdate(parsed);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  // Firestore Real-Time Listener
  let unsubscribeFirestore: (() => void) | null = null;
  const docId = getFirestoreDocId(targetKelas);
  const docRef = doc(db, 'classes', docId);

  ensureFirebaseAuth().then(() => {
    unsubscribeFirestore = onSnapshot(
      docRef,
      (docSnap) => {
        if (onCloudStatusChange) onCloudStatusChange(true);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as ClassData;
          // Update local cache
          try {
            localStorage.setItem(getClassStorageKey(targetKelas), JSON.stringify(remoteData));
          } catch {}
          onUpdate(remoteData);
        } else {
          // If remote does not exist yet, seed initial data
          const initial = loadClassData(targetKelas);
          setDoc(docRef, initial, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `classes/${docId}`);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `classes/${docId}`);
        if (onCloudStatusChange) onCloudStatusChange(false);
      }
    );
  }).catch((err) => {
    console.warn('Firebase Auth note:', err);
    if (onCloudStatusChange) onCloudStatusChange(false);
  });

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

export function computeTimers(classData: ClassData): TimerComputation {
  if (!classData.timerRunning || !classData.absoluteStartTime) {
    const paused = classData.accumulatedPausedTime || 0;
    const globalTimer = Math.max(0, 3600 - paused);
    const triggerTimer = Math.max(0, 1800 - paused);
    return { globalTimer, triggerTimer };
  }

  const now = Date.now();
  const elapsedSinceResume = Math.floor((now - classData.absoluteStartTime) / 1000);
  const totalElapsed = (classData.accumulatedPausedTime || 0) + elapsedSinceResume;

  const globalTimer = Math.max(0, 3600 - totalElapsed);
  const triggerTimer = Math.max(0, 1800 - totalElapsed);
  return { globalTimer, triggerTimer };
}

export function formatSecondsToMS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function evaluateDecisionScores(decision: DecisionData | undefined) {
  if (!decision || !decision.content) {
    return {
      total: 0,
      goalCongruence: 0,
      infoTransparency: 0,
      agencyMitigation: 0,
      strategicDepth: 0
    };
  }

  const text = `${decision.title} ${decision.content}`.toLowerCase();
  
  let goalCongruence = 15;
  if (text.includes('goal congruence') || text.includes('keselarasan') || text.includes('kepentingan bersama') || text.includes('insentif')) goalCongruence += 10;
  if (text.includes('shareholder') || text.includes('pemegang saham') || text.includes('nilai jangka panjang') || text.includes('roi')) goalCongruence += 5;
  goalCongruence = Math.min(25, goalCongruence);

  let infoTransparency = 15;
  if (text.includes('asimetri') || text.includes('transparansi') || text.includes('informasi') || text.includes('disclosure')) infoTransparency += 10;
  if (text.includes('pelaporan') || text.includes('verifikasi') || text.includes('data riil')) infoTransparency += 5;
  infoTransparency = Math.min(25, infoTransparency);

  let agencyMitigation = 15;
  if (text.includes('moral hazard') || text.includes('mitigasi') || text.includes('slack') || text.includes('pengawasan')) agencyMitigation += 10;
  if (text.includes('audit') || text.includes('pengendalian') || text.includes('kepatuhan') || text.includes('independen')) agencyMitigation += 5;
  agencyMitigation = Math.min(25, agencyMitigation);

  let strategicDepth = 15;
  if (text.includes('analisis') || text.includes('strategi') || text.includes('risiko') || text.includes('efisiensi')) strategicDepth += 10;
  if (text.length > 200) strategicDepth += 5;
  strategicDepth = Math.min(25, strategicDepth);

  const total = goalCongruence + infoTransparency + agencyMitigation + strategicDepth;

  return {
    total,
    goalCongruence,
    infoTransparency,
    agencyMitigation,
    strategicDepth
  };
}

export function generateComprehensiveReport(kelas: string, classData: ClassData): string {
  const activeCase = CASES_DATA[classData.activeCase];
  const groups: GroupId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  const groupNames: Record<GroupId, string> = {
    G1: 'Shareholder (Pemegang Saham)',
    G2: 'CEO (Chief Executive Officer)',
    G3: 'Finance Department (Keuangan / CFO)',
    G4: 'Sales & Marketing (Pemasaran)',
    G5: 'Operational (Operasional Pabrik)',
    G6: 'Internal Auditor'
  };

  const scores = groups.map(g => evaluateDecisionScores(classData.decisions[g]));
  const submittedCount = groups.filter(g => !!classData.decisions[g]).length;
  const avgScore = submittedCount > 0 
    ? Math.round(scores.reduce((acc, s) => acc + s.total, 0) / submittedCount) 
    : 0;

  let rep = `================================================================================\n`;
  rep += `           LAPORAN EVALUASI & ANALISIS SIMULASI AKUNTANSI KEPERILAKUAN\n`;
  rep += `                               AGENCY WARS SYSTEM\n`;
  rep += `================================================================================\n\n`;
  rep += `Tanggal & Waktu   : ${new Date().toLocaleString('id-ID')}\n`;
  rep += `Kelas Kuliah      : ${kelas}\n`;
  rep += `Skenario Kasus    : ${activeCase.title}\n`;
  rep += `Trigger Team      : ${activeCase.triggerRoleName}\n`;
  rep += `Partisipasi Tim   : ${submittedCount} dari 6 Kelompok Selesai Submit\n`;
  rep += `Rata-rata Skor    : ${avgScore} / 100\n\n`;

  rep += `--------------------------------------------------------------------------------\n`;
  rep += `1. RINGKASAN & KONSEP UTAMA TEORI KEAGENAN KASUS\n`;
  rep += `--------------------------------------------------------------------------------\n`;
  rep += `Esensi Kasus:\n${activeCase.gmGuide.summary}\n\n`;
  rep += `Tujuan Pedagogis:\n${activeCase.gmGuide.learningGoal}\n\n`;
  rep += `Konsep Kunci Terkait:\n- ${activeCase.keyConcepts.join('\n- ')}\n\n`;

  rep += `--------------------------------------------------------------------------------\n`;
  rep += `2. EVALUASI DAN SINTESIS KEPUTUSAN TIAP KELOMPOK\n`;
  rep += `--------------------------------------------------------------------------------\n`;

  groups.forEach((g) => {
    const dec = classData.decisions[g];
    const sc = evaluateDecisionScores(dec);
    rep += `[KELOMPOK ${g} - ${groupNames[g]}]\n`;
    rep += `Status            : ${dec ? 'SUDAH SUBMIT' : 'BELUM SUBMIT'}\n`;
    if (dec) {
      rep += `Perwakilan Mahasiswa: ${dec.author}\n`;
      rep += `Waktu Pengiriman    : ${dec.timestamp}\n`;
      rep += `Behaviour Score     : ${sc.total}/100\n`;
      rep += `  - Goal Congruence        : ${sc.goalCongruence}/25\n`;
      rep += `  - Transparansi Informasi : ${sc.infoTransparency}/25\n`;
      rep += `  - Mitigasi Agency Cost   : ${sc.agencyMitigation}/25\n`;
      rep += `  - Kedalaman Strategis    : ${sc.strategicDepth}/25\n`;
      rep += `Judul Keputusan     : "${dec.title}"\n`;
      rep += `Uraian & Analisis   :\n${dec.content}\n`;
    } else {
      rep += `Catatan: Kelompok ini belum mengumpulkan formulasi keputusan.\n`;
    }
    rep += `\n--------------------------------------------------------------------------------\n`;
  });

  rep += `3. KESIMPULAN & REFLEKSI AKUNTANSI KEPERILAKUAN\n`;
  rep += `--------------------------------------------------------------------------------\n`;
  if (submittedCount >= 4) {
    rep += `Dinamika interaksi kelompok menunjukkan terbentuknya proses negosiasi keagenan yang dinamis.\n`;
    rep += `Masing-masing kelompok berhasil mengidentifikasi trade-off antara kepentingan individu (self-interest)\n`;
    rep += `dan pencapaian tujuan organisasi (organizational goal congruence).\n`;
    rep += `Rekomendasi tindak lanjut adalah memperkuat kontrak insentif berbasis metrik kinerja berimbang\n`;
    rep += `serta penataan garis pelaporan independen auditor internal kepada komite audit.\n`;
  } else {
    rep += `Simulasi masih berlangsung. Dosen dapat memandu kelompok yang belum submit untuk segera merumuskan\n`;
    rep += `argumen berdasarkan perannya masing-masing dalam struktur keagenan.\n`;
  }
  rep += `\n================================================================================\n`;
  rep += `Dihasilkan secara otomatis oleh Agency Wars Simulation Engine\n`;
  rep += `Developed by Sukma Lesmana,Ph.D (https://sukmassp.blogspot.com)\n`;

  return rep;
}

export function generateCsvReport(kelas: string, classData: ClassData): string {
  const activeCase = CASES_DATA[classData.activeCase];
  const groups: GroupId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  const groupNames: Record<GroupId, string> = {
    G1: 'Shareholder (Pemegang Saham)',
    G2: 'CEO (Chief Executive Officer)',
    G3: 'Finance Department (Keuangan / CFO)',
    G4: 'Sales & Marketing (Pemasaran)',
    G5: 'Operational (Operasional Pabrik)',
    G6: 'Internal Auditor'
  };

  const headers = [
    'Kelas Kuliah',
    'Skenario Kasus',
    'Kelompok ID',
    'Peran Keagenan',
    'Nama Mahasiswa',
    'Status Submit',
    'Behaviour Score Total (0-100)',
    'Goal Congruence (0-25)',
    'Transparansi Informasi (0-25)',
    'Mitigasi Moral Hazard (0-25)',
    'Kedalaman Analisis (0-25)',
    'Waktu Submit',
    'Judul Keputusan',
    'Uraian & Analisis'
  ];

  const escapeCsv = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [headers.join(',')];

  groups.forEach((gid) => {
    const dec = classData.decisions[gid];
    const sc = evaluateDecisionScores(dec);
    const row = [
      escapeCsv(kelas),
      escapeCsv(activeCase.title),
      escapeCsv(gid),
      escapeCsv(groupNames[gid]),
      escapeCsv(dec ? dec.author : 'Belum Terdaftar'),
      escapeCsv(dec ? 'SUDAH SUBMIT' : 'BELUM SUBMIT'),
      escapeCsv(sc.total),
      escapeCsv(sc.goalCongruence),
      escapeCsv(sc.infoTransparency),
      escapeCsv(sc.agencyMitigation),
      escapeCsv(sc.strategicDepth),
      escapeCsv(dec ? dec.timestamp : '-'),
      escapeCsv(dec ? dec.title : '-'),
      escapeCsv(dec ? dec.content : '-')
    ];
    rows.push(row.join(','));
  });

  return '\uFEFF' + rows.join('\r\n');
}

export function downloadCsvReport(kelas: string, classData: ClassData): void {
  const csvContent = generateCsvReport(kelas, classData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rekap_Nilai_${kelas.replace(/\s+/g, '_')}_Kasus_${classData.activeCase}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function populateDemoDataForClass(kelas: string): ClassData {
  const data = getInitialClassData('1');
  data.decisions = {
    G5: {
      title: 'Pengajuan Buffer Slack 8% & Realokasi Preventive Maintenance',
      content: 'Divisi Operasional mengusulkan penyangga anggaran sebesar 8% pada pos biaya pemeliharaan mesin. Hal ini didasarkan pada asimetri informasi usia teknis mesin cetak utama yang kerap mengalami downtime 15 jam per bulan. Buffer ini bukan untuk moral hazard pribadi, melainkan memastikan kontinuitas produksi agar tidak gagal memenuhi kuota kuartalan.',
      timestamp: '10:14:22',
      author: 'Ahmad Fauzi (G5)'
    },
    G1: {
      title: 'Persetujuan Bersyarat dengan Cap Slack Maksimal 4% dan Audit Berkala',
      content: 'Sebagai Pemegang Saham, kami membatasi toleransi budget slack maksimal 4%. Selisih anggaran harus dikaitkan langsung dengan KPI pemeliharaan preventif yang diaudit oleh Auditor Internal secara berkala demi melindungi ROI pemegang saham dari agency loss.',
      timestamp: '10:20:05',
      author: 'Dewi Lestari (G1)'
    },
    G2: {
      title: 'Harmonisasi Target: Bonus Berbasis Efisiensi Downtime',
      content: 'CEO merumuskan skema kompromi: mengabulkan alokasi buffer 6% dengan syarat manajer operasional menerima klausul pembagian bonus penghematan (gain-sharing) jika waktu henti mesin berhasil ditekan di bawah 5 jam.',
      timestamp: '10:25:40',
      author: 'Budi Santoso (G2)'
    },
    G3: {
      title: 'Analisis Varians Historis & Pengawasan Standar Biaya Fleksibel',
      content: 'Departemen Keuangan menyajikan data varians penganggaran 3 tahun terakhir yang membuktikan rata-rata over-budgeting hanya berkisar 3.2%. Kami merekomendasikan sistem anggaran fleksibel (flexible budgeting) berbasis jam mesin aktual.',
      timestamp: '10:28:18',
      author: 'Rina Pratiwi (G3)'
    },
    G4: {
      title: 'Sinkronisasi Jadwal Kampanye Marketing dengan Siklus Pemeliharaan',
      content: 'Pemasaran membutuhkan kepastian pengiriman produk untuk kontrak retail baru. Kami mendukung kepastian uptime mesin operasional dan meminta data kapasitas riil dibagikan transparan agar strategi penetapan harga promosi tidak menyebabkan pesanan menumpuk.',
      timestamp: '10:31:02',
      author: 'Kevin Wijaya (G4)'
    },
    G6: {
      title: 'Audit Kepatuhan & Implementasi Continuous Monitoring',
      content: 'Internal Auditor merekomendasikan verifikasi logbook fisik mesin oleh tim audit independen setiap minggu serta penegakan SOP pengadaan suku cadang untuk mencegah manipulasi faktur dan mark-up anggaran.',
      timestamp: '10:35:10',
      author: 'Siti Nurhaliza (G6)'
    }
  };

  data.studentProfiles = {
    ahmad_fauzi_g5: { name: 'Ahmad Fauzi', pin: '112233', group: 'G5', registeredAt: '10:02:11' },
    dewi_lestari_g1: { name: 'Dewi Lestari', pin: '223344', group: 'G1', registeredAt: '10:04:15' },
    budi_santoso_g2: { name: 'Budi Santoso', pin: '334455', group: 'G2', registeredAt: '10:05:40' },
    rina_pratiwi_g3: { name: 'Rina Pratiwi', pin: '445566', group: 'G3', registeredAt: '10:07:02' },
    kevin_wijaya_g4: { name: 'Kevin Wijaya', pin: '556677', group: 'G4', registeredAt: '10:08:29' },
    siti_nurhaliza_g6: { name: 'Siti Nurhaliza', pin: '667788', group: 'G6', registeredAt: '10:09:55' }
  };

  saveClassData(kelas, data);
  return data;
}
