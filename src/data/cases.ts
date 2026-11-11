import { CaseData, CaseId, GroupId, GroupMeta } from '../types';

export const GROUPS_META: Record<GroupId, GroupMeta> = {
  G1: {
    id: 'G1',
    name: 'Kelompok 1',
    roleTitle: 'Shareholder (Pemegang Saham)',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/40',
    bgGlowClass: 'from-emerald-500 to-teal-600',
    iconName: 'Building2',
    agencyRole: 'Prinsipal',
    description: 'Pemilik modal yang mendelegasikan wewenang pengelolaan perusahaan kepada dewan direksi (CEO). Berfokus pada return on investment (ROI), dividen, pengawasan agency cost, dan keselarasan tujuan (goal congruence).'
  },
  G2: {
    id: 'G2',
    name: 'Kelompok 2',
    roleTitle: 'CEO (Chief Executive Officer)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/40',
    bgGlowClass: 'from-amber-500 to-orange-600',
    iconName: 'Crown',
    agencyRole: 'Agen Utama',
    description: 'Pemimpin eksekutif yang menghadapi tekanan target kinerja jangka pendek dari prinsipal, sekaligus mengarahkan manajer divisi di bawahnya. Bertanggung jawab atas desain insentif dan kompensasi manajerial.'
  },
  G3: {
    id: 'G3',
    name: 'Kelompok 3',
    roleTitle: 'Finance Department (Keuangan / CFO)',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/40',
    bgGlowClass: 'from-blue-500 to-indigo-600',
    iconName: 'Coins',
    agencyRole: 'Pengawas / Manajer',
    description: 'Pengelola modal dan pelaporan keuangan. Bertanggung jawab atas penganggaran modal (capital budgeting), analisis varians, hurdle rate, dan penentuan kelayakan ekspansi bisnis.'
  },
  G4: {
    id: 'G4',
    name: 'Kelompok 4',
    roleTitle: 'Sales & Marketing (Pemasaran)',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/40',
    bgGlowClass: 'from-purple-500 to-pink-600',
    iconName: 'TrendingUp',
    agencyRole: 'Agen Operasional',
    description: 'Penggerak pendapatan perusahaan yang berinteraksi langsung dengan dinamika pasar. Rentan terhadap bias kognitif (heuristic, overconfidence, anchoring) dalam memproyeksikan target dan penetapan harga.'
  },
  G5: {
    id: 'G5',
    name: 'Kelompok 5',
    roleTitle: 'Operational (Operasional Pabrik)',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-500/40',
    bgGlowClass: 'from-rose-500 to-red-600',
    iconName: 'Factory',
    agencyRole: 'Agen Operasional',
    description: 'Pelaksana teknis di lantai produksi yang memiliki informasi asimetris paling akurat mengenai kapasitas dan biaya riil. Memiliki insentif perilaku untuk menciptakan budgetary slack demi keamanan pencapaian target.'
  },
  G6: {
    id: 'G6',
    name: 'Kelompok 6',
    roleTitle: 'Internal Auditor',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-500/40',
    bgGlowClass: 'from-cyan-500 to-blue-600',
    iconName: 'ShieldAlert',
    agencyRole: 'Pengawas / Manajer',
    description: 'Pilar tata kelola independen yang mengawasi kepatuhan prosedur, mendeteksi kecurangan (fraud), mitigasi moral hazard, dan menjaga integritas pelaporan manajemen.'
  }
};

export const CASES_DATA: Record<CaseId, CaseData> = {
  '1': {
    id: '1',
    title: 'Kasus 1: Budget Slack',
    desc: 'Divisi Operasional (G5) memiliki informasi asimetris terkait kapasitas produksi riil. Shareholder (G1) menuntut efisiensi anggaran maksimal, sementara CEO (G2) menghadapi tekanan target kinerja tahunan.',
    triggerTeam: 'G5',
    triggerRoleName: 'G5 - Divisi Operasional',
    keyConcepts: ['Budgetary Slack', 'Asimetri Informasi', 'Partisipasi Anggaran', 'Target Rachet Effect'],
    instructions: {
      G5: 'Sebagai Divisi Operasional (Trigger Team), tentukan tingkat budget slack (penyangga anggaran) yang akan Anda ajukan pada rancangan anggaran tahunan beserta justifikasi operasionalnya.',
      default: 'Berikan tanggapan dan analisis kritis terhadap pengajuan budget slack dari Divisi Operasional (G5) dari sudut pandang pengendalian manajemen dan keselarasan tujuan korporasi.'
    },
    gmGuide: {
      trigger: 'Kelompok 5 (Divisi Operasional)',
      summary: 'Kasus ini mengeksplorasi fenomena Information Asymmetry dan Budgetary Slack dalam proses penyusunan anggaran partisipatif (participative budgeting).',
      learningGoal: 'Mahasiswa memahami motif agen dalam menyembunyikan kapasitas produktif riil serta cara prinsipal mendesain mekanisme insentif kebenaran (truth-inducing scheme).',
      groupTasks: [
        { group: 'G1', name: 'Shareholder', task: 'Menilai dampak budget slack terhadap return on investment (ROI) dan menetapkan batasan toleransi penyangga anggaran.' },
        { group: 'G2', name: 'CEO', task: 'Menyeimbangkan tekanan dari pemegang saham dengan realitas kapasitas operasional bawah agar tidak memicu frustrasi tim.' },
        { group: 'G3', name: 'Finance', task: 'Melakukan analisis varians anggaran historis untuk mendeteksi potensi slack tersembunyi.' },
        { group: 'G4', name: 'Sales & Marketing', task: 'Mengevaluasi proyeksi penjualan hubungannya dengan kapasitas maksimum yang disanggupi operasional.' },
        { group: 'G5', name: 'Trigger Team - Operasional', task: 'Merumuskan pengajuan besaran budget slack dan alasan rasionalisasi kapasitas pabrik serta ketidakpastian mesin.' },
        { group: 'G6', name: 'Internal Auditor', task: 'Memeriksa kepatuhan prosedur penganggaran dan memberikan rekomendasi audit pengendalian internal atas moral hazard.' }
      ]
    }
  },
  '2': {
    id: '2',
    title: 'Kasus 2: Performance Measurement dan Motivasi',
    desc: 'Perancangan sistem kompensasi berbasis kinerja (KPI) oleh CEO (G2) untuk memotivasi manajer bawah tanpa memicu manipulasi angka akuntansi (earnings management) dan moral hazard.',
    triggerTeam: 'G2',
    triggerRoleName: 'G2 - CEO (Chief Executive Officer)',
    keyConcepts: ['Balanced Scorecard', 'Desain Insentif', 'Earnings Management', 'Moral Hazard', 'Goal Congruence'],
    instructions: {
      G2: 'Sebagai CEO (Trigger Team), rancanglah skema performance measurement multi-dimensi (keuangan & non-keuangan) dan struktur bonus agar agen termotivasi tanpa memicu perilaku distorsi.',
      default: 'Evaluasi skema pengukuran kinerja CEO dan berikan masukan mitigasi atas potensi manipulasi metrik atau pengorbanan kualitas jangka panjang demi target sesaat.'
    },
    gmGuide: {
      trigger: 'Kelompok 2 (CEO / Chief Executive Officer)',
      summary: 'Kasus ini berfokus pada desain sistem kompensasi eksekutif, trade-off antara metrik finansial jangka pendek dan non-finansial jangka panjang.',
      learningGoal: 'Mahasiswa mengidentifikasi efek samping negatif dari ukuran kinerja tunggal (misal target laba bersih saja) dan pentingnya balanced scorecard.',
      groupTasks: [
        { group: 'G1', name: 'Shareholder', task: 'Memastikan struktur insentif CEO selaras dengan pertumbuhan nilai intrinsik jangka panjang (Economic Value Added).' },
        { group: 'G2', name: 'Trigger Team - CEO', task: 'Merancang indikator Balanced Scorecard (Finansial, Pelanggan, Proses Internal, Pembelajaran) dan proporsi bonus kinerja.' },
        { group: 'G3', name: 'Finance', task: 'Menghitung simulasi dampak pencairan bonus terhadap likuiditas dan arus kas operasional.' },
        { group: 'G4', name: 'Sales & Marketing', task: 'Menilai apakah metrik komisi penjualan mendorong relasi pelanggan berkelanjutan atau sekadar dumping volume diskon.' },
        { group: 'G5', name: 'Operational', task: 'Mengevaluasi keadilan target efisiensi dan OEE (Overall Equipment Effectiveness) dalam skema penilaian manajer.' },
        { group: 'G6', name: 'Internal Auditor', task: 'Menguji potensi celah gaming the system (misal mempercepat pengakuan pendapatan atau menunda biaya perawatan).' }
      ]
    }
  },
  '3': {
    id: '3',
    title: 'Kasus 3: Keputusan Investasi dan Ekspansi',
    desc: 'Usulan proyek ekspansi pabrik baru bernilai investasi tinggi oleh Departemen Keuangan / CFO (G3) dengan tingkat risiko ketidakpastian pasar dan potensi benturan horizon waktu.',
    triggerTeam: 'G3',
    triggerRoleName: 'G3 - Finance Department / CFO',
    keyConcepts: ['Capital Budgeting', 'Horizon Problem', 'Hurdle Rate / WACC', 'Risk Preference Prinsipal vs Agen'],
    instructions: {
      G3: 'Sebagai Departemen Keuangan / CFO (Trigger Team), lakukan analisis kelayakan investasi (NPV, IRR, Payback) dan tentukan hurdle rate serta skema pembiayaan yang optimal.',
      default: 'Analisis keputusan investasi CFO terhadap potensi konflik kepentingan horizon waktu antara pemegang saham (jangka panjang) dan eksekutif (jangka pendek).'
    },
    gmGuide: {
      trigger: 'Kelompok 3 (Finance Department / CFO)',
      summary: 'Kasus ini menyoroti evaluasi penganggaran modal dan masalah horizon waktu (horizon problem) di mana manajer mungkin enggan berinvestasi jika payback melebihi masa jabatannya.',
      learningGoal: 'Mahasiswa memahami bias penghindaran risiko (risk aversion) agen vs diversifikasi risiko prinsipal dalam keputusan investasi modal besar.',
      groupTasks: [
        { group: 'G1', name: 'Shareholder', task: 'Menilai apakah tingkat pengembalian modal (NPV/IRR) memadai untuk menutupi risiko penanaman ekuitas investor.' },
        { group: 'G2', name: 'CEO', task: 'Mendukung ekspansi strategis demi memperluas pangsa pasar dan reputasi perusahaan.' },
        { group: 'G3', name: 'Trigger Team - Finance', task: 'Menyajikan analisis komparatif NPV, IRR, hurdle rate (WACC), serta simulasi sensitivitas risiko makroekonomi.' },
        { group: 'G4', name: 'Sales & Marketing', task: 'Menyediakan validasi data riset pasar dan proyeksi volume serapan permintaan produk fasilitas baru.' },
        { group: 'G5', name: 'Operational', task: 'Menilai kesiapan kapasitas pabrik baru, kurva pembelajaran tenaga kerja, dan estimasi biaya pemeliharaan awal.' },
        { group: 'G6', name: 'Internal Auditor', task: 'Mengevaluasi objektivitas dan independensi asumsi estimasi arus kas dalam proposal investasi.' }
      ]
    }
  },
  '4': {
    id: '4',
    title: 'Kasus 4: Heuristic',
    desc: 'Pengambilan keputusan manajerial dalam kondisi ketidakpastian tinggi menggunakan aturan praktis (heuristic) oleh Divisi Sales & Marketing (G4) yang rentan terhadap bias kognitif.',
    triggerTeam: 'G4',
    triggerRoleName: 'G4 - Sales & Marketing Division',
    keyConcepts: ['Availability Heuristic', 'Anchoring Bias', 'Overconfidence Bias', 'Behavioral Decision Theory'],
    instructions: {
      G4: 'Sebagai Sales & Marketing (Trigger Team), putuskan strategi penetapan harga dan penetrasi pasar produk baru berdasarkan intuisi pasar dan aturan praktis (heuristic).',
      default: 'Evaluasi bias kognitif (anchoring, representativeness, overconfidence) dalam usulan pemasaran G4 dan usulkan pendekatan rasional berbasis data empiris.'
    },
    gmGuide: {
      trigger: 'Kelompok 4 (Sales & Marketing Division)',
      summary: 'Kasus ini menguji perilaku pengambilan keputusan di bawah ketidakpastian (behavioral decision making) dan dampak bias kognitif terhadap kalkulasi profitabilitas.',
      learningGoal: 'Mahasiswa mampu mengidentifikasi kesalahan sistematis akibat ketergantungan pada intuisi heuristik dan cara menyusun sistem akuntansi manajemen sebagai debiasing tool.',
      groupTasks: [
        { group: 'G1', name: 'Shareholder', task: 'Mempertanyakan dasar rasionalitas penetapan harga diskon dan memastikan perlindungan marjin laba bersih.' },
        { group: 'G2', name: 'CEO', task: 'Menilai kecepatan respons strategi pasar terhadap ancaman agresif dari para pesaing baru.' },
        { group: 'G3', name: 'Finance', task: 'Menghitung break-even point (BEP) dan analisis sensitivitas jika asumsi elastisitas harga pemasaran meleset.' },
        { group: 'G4', name: 'Trigger Team - Sales & Marketing', task: 'Menetapkan strategi penetapan harga berbasis aturan praktis (heuristic pricing) di tengah situasi pasar yang bergejolak.' },
        { group: 'G5', name: 'Operational', task: 'Memastikan rantai pasok dan lantai produksi mampu merespons lonjakan pesanan mendadak tanpa menyebabkan bottleneck.' },
        { group: 'G6', name: 'Internal Auditor', task: 'Mengidentifikasi risiko penyimpangan dari SOP penetapan diskon dan prosedur otorisasi kredit komersial.' }
      ]
    }
  },
  '5': {
    id: '5',
    title: 'Kasus 5: Internal Auditor',
    desc: 'Temuan penyimpangan prosedur kepatuhan dan manipulasi pelaporan keuangan internal oleh Internal Auditor (G6) yang harus bersikap independen di tengah tekanan manajemen.',
    triggerTeam: 'G6',
    triggerRoleName: 'G6 - Internal Auditor',
    keyConcepts: ['Independensi Auditor', 'Fraud Triangle', 'Whistleblowing', 'Good Corporate Governance (GCG)', 'Audit Committee'],
    instructions: {
      G6: 'Sebagai Internal Auditor (Trigger Team), laporkan temuan audit investigatif, tingkat materialitas pelanggaran, dan rekomendasi pengendalian internal tanpa kompromi.',
      default: 'Berikan tinjauan atas independensi auditor internal, mitigasi potensi konflik kepentingan, dan langkah perbaikan tata kelola korporasi (GCG).'
    },
    gmGuide: {
      trigger: 'Kelompok 6 (Internal Auditor)',
      summary: 'Kasus ini menyoroti peran strategis independensi auditor internal, dilema etika profesi saat menghadapi tekanan direksi, serta deteksi Fraud Triangle.',
      learningGoal: 'Mahasiswa memahami pentingnya garis pelaporan ganda (dual reporting line) ke Komite Audit dan Direktur Utama untuk melindungi independensi auditor.',
      groupTasks: [
        { group: 'G1', name: 'Shareholder', task: 'Menuntut transparansi investigasi penuh atas temuan audit dan memperkuat wewenang Komite Audit Dewan Komisaris.' },
        { group: 'G2', name: 'CEO', task: 'Memberikan klarifikasi atas tata kelola manajemen dan menjamin perlindungan bagi pelapor pelanggaran (whistleblower).' },
        { group: 'G3', name: 'Finance', task: 'Menilai perlunya penyesuaian (restatement) akun laporan keuangan serta perbaikan rekonsiliasi internal.' },
        { group: 'G4', name: 'Sales & Marketing', task: 'Mengevaluasi dampak temuan kecurangan terhadap kepercayaan publik dan reputasi merek di pasar.' },
        { group: 'G5', name: 'Operational', task: 'Memperbaiki celah prosedur fisik (segregation of duties) dan kontrol akses gudang yang ditemukan auditor.' },
        { group: 'G6', name: 'Trigger Team - Internal Auditor', task: 'Memaparkan laporan audit investigatif, analisis akar penyebab (root cause), dan rekomendasi tata kelola.' }
      ]
    }
  }
};

export const DEFAULT_CLASSES = [
  '5 Akuntansi International',
  '5A Akuntansi Malam',
  '5C Akuntansi Pagi',
  '5D Akuntansi Pagi',
  '5E Akuntansi Pagi',
  '5 Test'
];

export const THEORY_CONCEPTS = [
  {
    title: 'Teori Keagenan (Agency Theory)',
    author: 'Jensen & Meckling (1976)',
    desc: 'Kontrak di mana satu pihak (prinsipal/pemegang saham) mendelegasikan wewenang pengambilan keputusan kepada pihak lain (agen/manajer). Konflik muncul karena perbedaan kepentingan, asimetri informasi, dan sifat manusia yang mementingkan diri sendiri (self-interest).'
  },
  {
    title: 'Asimetri Informasi (Information Asymmetry)',
    author: 'Akerlof (1970) & Stiglitz',
    desc: 'Kondisi di mana salah satu pihak (biasanya agen) memiliki informasi operasional yang lebih lengkap dan mendalam daripada pihak prinsipal. Melahirkan dua masalah utama: Adverse Selection (sebelum kontrak) dan Moral Hazard (setelah kontrak).'
  },
  {
    title: 'Senjangan Anggaran (Budgetary Slack)',
    author: 'Young (1985), Merchant (1985)',
    desc: 'Kecenderungan manajer bawahan untuk meremehkan proyeksi pendapatan atau melebih-lebihkan proyeksi biaya dalam anggaran partisipatif, sehingga target anggaran menjadi lebih mudah dicapai dan bonus kinerja lebih aman.'
  },
  {
    title: 'Goal Congruence (Keselarasan Tujuan)',
    author: 'Anthony & Govindarajan',
    desc: 'Tingkat di mana tindakan yang diambil oleh manajer demi kepentingan pribadinya secara otomatis juga memaksimalkan kepentingan organisasi dan pemegang saham.'
  },
  {
    title: 'Heuristik & Bias Kognitif',
    author: 'Tversky & Kahneman (1974)',
    desc: 'Penggunaan jalan pintas mental (heuristik ketersediaan, penjangkaran/anchoring, keterwakilan) dalam pengambilan keputusan akuntansi dan manajerial yang dapat menyebabkan kesalahan estimasi sistematis.'
  },
  {
    title: 'Segitiga Kecurangan (Fraud Triangle)',
    author: 'Donald Cressey (1953)',
    desc: 'Tiga elemen penyebab kecurangan pelaporan keuangan: Tekanan (Pressure), Peluang (Opportunity karena lemahnya pengendalian), dan Rasionalisasi (Rationalization pembenaran moral pelaku).'
  }
];
