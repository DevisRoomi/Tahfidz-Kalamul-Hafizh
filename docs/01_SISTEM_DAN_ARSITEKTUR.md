# Dokumen 01: Arsitektur Sistem & Tech Stack

## 1. Ikhtisar Arsitektur
**Tahfidz Kalamul Hafizh** (Setoran Companion) dibangun sebagai Progressive Web Application (PWA) / Single Page Application (SPA) modern yang menghubungkan frontend interaktif dengan backend serverless/BaaS (Lovable Cloud / Supabase).

## 2. Tech Stack Inti
- **Runtime & Bundler:** Bun / Vite
- **Framework UI:** React 18/19 + TypeScript (Strict Type Safety)
- **Styling:** Tailwind CSS + Radix UI Primitives (komponen modal, popover, dialog, dropdown)
- **Visualisasi Data:** Recharts (grafik batang per bulan, radar/doughnut komposisi setoran, tren capaian)
- **State & Data Management:** TanStack Query (React Query) untuk sinkronisasi state data asynchronous
- **Backend / Database:** Lovable Cloud / Supabase PostgreSQL (Auth, Realtime Tables, RPC)
- **Iconography:** Lucide React

## 3. Topologi Komponen
- `src/components/`: Atom & molekul UI (Button, Card, Form, Table, Sidebar)
- `src/hooks/`: Custom hooks (mutasi setoran, query analitik)
- `src/integrations/`: Integrasi Supabase client & types
- `src/pages/`: Tampilan rute utama (Dashboard, Santri, Ustadz, Setoran, Laporan, Pengaturan)
- `src/lib/`: Utility matematika, kalkulasi juz/halaman, formatter tanggal hijri/masehi
- `src/types/`: Type definitions entitas tahfidz
