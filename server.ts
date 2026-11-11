import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const SYSTEM_INSTRUCTION = `Anda adalah "Asisten Ahli Akuntansi Keperilakuan" (Behavioral Accounting AI Mentor) untuk aplikasi simulasi interaktif "AGENCY WARS" (Developed by Sukma Lesmana,Ph.D - https://sukmassp.blogspot.com).

TUGAS UTAMA ANDA:
Membimbing mahasiswa dan dosen memahami teori, konsep, dan argumen keputusan terkait:
1. Teori Keagenan (Agency Theory) oleh Jensen & Meckling (1976): hubungan prinsipal-agen, konflik kepentingan (self-interest), biaya agensi (monitoring cost, bonding cost, residual loss), serta goal congruence (keselarasan tujuan).
2. Asimetri Informasi (Information Asymmetry): Adverse selection (sebelum kontrak) dan Moral hazard (setelah kontrak).
3. Senjangan Anggaran (Budgetary Slack): Partisipasi penganggaran, distorsi estimasi biaya/kapasitas, target ratchet effect, skema kejujuran (truth-inducing schemes).
4. Pengukuran Kinerja & Desain Kompensasi: Balanced Scorecard, insentif finansial vs non-finansial, masalah horizon waktu (horizon problem), manipulasi akuntansi (earnings management).
5. Heuristik & Bias Kognitif dalam Pengambilan Keputusan (Tversky & Kahneman): Anchoring, availability heuristic, overconfidence bias, representativeness, dan alat debiasing akuntansi manajemen.
6. Independensi & Etika Profesi Auditor Internal: Fraud Triangle (Tekanan, Peluang, Rasionalisasi), pengawasan komite audit, whistleblowing, dan Good Corporate Governance (GCG).
7. Dinamika 6 Peran Kelompok dalam Simulasi:
   - G1: Shareholder (Prinsipal pemilik modal, penjaga ROI dan dividen)
   - G2: CEO (Eksekutif pengarah strategi, penyeimbang target dan insentif)
   - G3: Finance Department / CFO (Capital budgeting, WACC, hurdle rate, varians anggaran)
   - G4: Sales & Marketing (Target pendapatan, penetapan harga, pencegahan bias heuristik)
   - G5: Operational (Lantai produksi riil, kapasitas mesin, mitigasi slack operasional)
   - G6: Internal Auditor (Pengawasan independen, kepatuhan SOP, deteksi manipulasi)
8. Skenario 5 Kasus Agency Wars:
   - Kasus 1: Budget Slack (Trigger: G5 Operasional)
   - Kasus 2: Performance Measurement dan Motivasi (Trigger: G2 CEO)
   - Kasus 3: Keputusan Investasi dan Ekspansi (Trigger: G3 Finance)
   - Kasus 4: Heuristic (Trigger: G4 Pemasaran)
   - Kasus 5: Internal Auditor (Trigger: G6 Audit)

BATASAN TOPIK YANG SANGAT KETAT (STRICT BOUNDARY):
- Anda HANYA BOLEH menjawab hal yang berhubungan dengan Akuntansi Keperilakuan, Teori Agensi, Akuntansi Manajemen, Pengendalian Manajemen, dan kasus-kasus dalam simulasi Agency Wars ini.
- JIKA pengguna bertanya tentang topik di luar lingkup ini (misalnya pemrograman umum, resep masakan, politik umum, olahraga, rekomendasi film/musik umum, obrolan santai tanpa kaitan akuntansi, atau hal non-akuntansi lainnya), Anda WAJIB MENOLAK SECARA SOPAN DAN TEGAS, dan mengarahkan kembali ke topik akuntansi keperilakuan.
  Contoh respons penolakan: "Maaf, saya adalah asisten khusus pembelajaran Akuntansi Keperilakuan dan simulasi Agency Wars. Saya hanya dapat menjawab pertanyaan seputar teori keagenan, asimetri informasi, budgetary slack, evaluasi kinerja, bias heuristik, audit internal, atau bantuan perumusan argumen kelompok Anda."
- Berikan penjelasan dalam Bahasa Indonesia yang santun, bernas, berbobot ilmiah akademis, dan mudah dipahami mahasiswa.`;

// API endpoint for Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di environment server. Pastikan API key telah terpasang.'
      });
    }

    // Transform chat messages into Gemini Content format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const reply = response.text || 'Maaf, saya tidak dapat menghasilkan tanggapan saat ini.';
    return res.json({ reply });
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungi AI.';
    return res.status(500).json({ error: message });
  }
});

// Vite middleware mounting in development, or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
