# Dokumen 04: Skema Data & Model Relasi

## 1. Entitas Relasional Inti
- **Santri:** `id`, `nis`, `nama`, `kelas`, `halaqah_id`, `target_juz`, `total_halaman_hafal`, `status_aktif`.
- **Ustadz:** `id`, `nip`, `nama`, `halaqah_name`, `kontak`.
- **Setoran_Tahfidz:** `id`, `santri_id`, `ustadz_id`, `tanggal`, `jenis` (`sabaq` | `sabqi` | `manzil`), `surat_mulai`, `ayat_mulai`, `surat_selesai`, `ayat_selesai`, `total_ayat`, `nilai` (`mumtaz` | `jayyid_jiddan` | `jayyid` | `maqbul`), `catatan`, `created_at`.
- **Laporan_Bulanan:** `id`, `santri_id`, `periode_bulan`, `total_setoran`, `rata_nilai`, `rekomendasi_ujian`.

## 2. API & Data Access Pattern
- **Query Caching:** Dikelola oleh `@tanstack/react-query` dengan stale-time terukur untuk efisiensi transfer data.
- **Realtime Listener:** Opsional melalui channel subscription Supabase Realtime untuk pembaruan dashboard instan saat ustadz menginput setoran di halaqah.
