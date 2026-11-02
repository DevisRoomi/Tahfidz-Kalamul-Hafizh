# Dokumen 02: Struktur Modul & Fitur Utama

Aplikasi memiliki 6 pilar modul utama yang diakses melalui Sidebar navigasi:

### 1. Executive Dashboard (`/`)
- **Kartu Ringkasan (KPI):** Total Santri Aktif, Ustadz Pengampu, Setoran Bulan Ini, dan Rata-rata Nilai Mutu.
- **Grafik Analitik:**
  - Perkembangan Setoran per Bulan (Batang & Garis tren).
  - Komposisi Jenis Setoran (Persentase Sabaq vs Sabqi vs Manzil).
  - Distribusi Nilai per Bulan (Mumtaz, Jayyid Jiddan, Jayyid, Maqbul).
  - Capaian Ayat per Kelas (Kelas 7 s.d. Kelas 12).
- **Papan Peringkat:** Top 10 Santri Paling Konsisten berdasarkan akumulasi halaman dan kualitas predikat.
- **Feed Setoran Realtime:** Log riwayat setoran terbaru yang baru saja disetorkan oleh santri ke ustadz.

### 2. Manajemen Data Santri (`/santri`)
- Tabel data master santri: NIS, Nama, Kelas (7–12), Halaqah, Target Juz, dan Akumulasi Halaman.
- Pencarian multi-parameter (berdasarkan nama santri atau kelas).
- Filter status aktif dan filter pembimbing halaqah.
- Form CRUD penambahan dan pembaharuan profil santri.

### 3. Data Ustadz Pengampu (`/ustadz`)
- Daftar musyrif pembimbing halaqah tahfidz.
- Alokasi jumlah santri binaan per halaqah.
- Kontak, jadwal sima'an, dan riwayat setoran yang diverifikasi ustadz terkait.

### 4. Input Setoran Tahfidz (`/setoran`)
- Antarmuka pencatatan cepat di halaqah:
  - Pemilihan santri dan tanggal setoran.
  - Pemilihan jenis: **Sabaq**, **Sabqi**, atau **Manzil**.
  - Pilihan Surat & Rentang Ayat (otomatis menghitung jumlah ayat).
  - Penilaian mutu kelancaran & tajwid (Mumtaz / Jayyid Jiddan / Jayyid / Maqbul).
  - Kolom catatan ustadz untuk rekomendasi perbaikan hukum bacaan atau waqaf.

### 5. Laporan Bulanan Santri (`/laporan`)
- Rekapitulasi progres hafalan berkala per santri per semester.
- Analisis rasio kelancaran muraja'ah vs hafalan baru.
- Fitur ekspor/unduh laporan format cetak (PDF / Print-ready layout) untuk wali santri.

### 6. Pengaturan Sistem (`/pengaturan`)
- Konfigurasi profil instansi / pesantren (nama, logo, kontak).
- Penetapan tahun ajaran dan semester aktif.
- Pilihan template tema visual antarmuka dashboard.
