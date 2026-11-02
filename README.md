# Tahfidz Kalamul Hafizh (Setoran Companion)

> **Sistem Manajemen Pencatatan Tahfidz Santri Berbasis Web & Cloud**  
> Live Demo: [https://setoran-companion.lovable.app](https://setoran-companion.lovable.app)

---

## Ringkasan Proyek

### Deskripsi Singkat
Sistem manajemen pencatatan setoran hafalan Al-Qur'an santri berbasis cloud untuk Pesantren Darul Ilmi, memantau ritme Sabaq, Sabqi, dan Manzil, manajemen ustadz pengampu, serta visualisasi analitik progres santri secara terstruktur.

### Deskripsi Panjang
**Tahfidz Kalamul Hafizh (Setoran Companion)** adalah aplikasi web manajemen hafalan Al-Qur'an yang dirancang untuk memodernisasi buku mutaba'ah fisik konvensional di lingkungan pesantren. Sistem membagi setoran ke dalam tiga pilar metodologi tahfidz autentik (Sabaq, Sabqi, Manzil), menyediakan antarmuka pencatatan harian cepat oleh ustadz pengampu, kalkulasi nilai mutu hafalan (Mumtaz, Jayyid Jiddan, Jayyid, Maqbul), pelaporan analitik bulanan santri, visualisasi grafik capaian juz/ayat, serta papan peringkat santri terbaik. Dibangun menggunakan arsitektur modern berbasis React, TypeScript, Tailwind CSS, Recharts, dan Supabase/Lovable Cloud.

---

## 4 Dokumen Teknis Resmi

1. [Dokumen 01: Arsitektur Sistem & Tech Stack](docs/01_SISTEM_DAN_ARSITEKTUR.md)
2. [Dokumen 02: Struktur Modul & Fitur Utama](docs/02_STRUKTUR_MODUL_DAN_FITUR.md)
3. [Dokumen 03: Pedagogi & Logika Bisnis Tahfidz](docs/03_PEDAGOGI_DAN_LOGIKA_TAHFIDZ.md)
4. [Dokumen 04: Skema Data & Model Relasi](docs/04_SKEMA_DATA_DAN_INTEGRASI.md)

---

## Fitur Utama

- **Executive Dashboard**: Ringkasan KPI santri, grafik perkembangan bulanan, komposisi hafalan, capaian per kelas, dan leaderboard santri terbaik.
- **Data Santri**: Database master santri terstruktur (NIS, kelas 7-12, halaqah, target juz).
- **Data Ustadz Pengampu**: Pengelolaan daftar musyrif pembina halaqah.
- **Input Setoran Cepat**: Form harian cerdas dengan seleksi surat, hitung ayat otomatis, dan predikat mutu.
- **Laporan Bulanan & Unduh PDF**: Ringkasan progres santri siap cetak untuk wali murid.
- **Pengaturan Fleksibel**: Kustomisasi profil pesantren, tahun ajaran aktif, dan template tema.

---

## Menjalankan Proyek Secara Lokal

```bash
# Clone repository
git clone https://github.com/DevisRoomi/Tahfidz-Kalamul-Hafizh.git
cd Tahfidz-Kalamul-Hafizh

# Install dependencies (Bun atau npm)
bun install
# atau: npm install

# Jalankan dev server
bun dev
# atau: npm run dev
```
