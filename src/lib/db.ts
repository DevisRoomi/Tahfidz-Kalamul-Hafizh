import { supabase } from "@/integrations/supabase/client";

export type Ustadz = {
  id: string;
  nama: string;
  nip: string | null;
  no_hp: string | null;
  jenis_kelamin: string;
  keterangan: string | null;
};

export type Santri = {
  id: string;
  nis: string;
  nama: string;
  kelas: number;
  jenis_kelamin: string;
  tanggal_lahir: string | null;
  alamat: string | null;
  nama_wali: string | null;
  no_hp_wali: string | null;
  ustadz_id: string | null;
  status: string;
};

export type JenisSetoran = "Sabaq" | "Sabqi" | "Manzil";

export type Setoran = {
  id: string;
  santri_id: string;
  ustadz_id: string | null;
  tanggal: string;
  jenis: JenisSetoran;
  surah: string;
  juz: number | null;
  ayat_mulai: number;
  ayat_selesai: number;
  jumlah_ayat: number;
  nilai: number;
  kelancaran: string;
  predikat: string;
  catatan: string | null;
};

export type Pengaturan = {
  id: number;
  nama_pesantren: string;
  logo_url: string | null;
  tema: string;
  tahun_ajaran: string;
  semester: string;
  alamat: string | null;
};

const client = supabase as unknown as {
  from: (table: string) => any;
};

export const JENIS_SETORAN: JenisSetoran[] = ["Sabaq", "Sabqi", "Manzil"];

export const KELAS_LIST = [7, 8, 9, 10, 11, 12];

export const PENJELASAN_JENIS: Record<JenisSetoran, string> = {
  Sabaq: "Hafalan baru yang disetorkan hari ini",
  Sabqi: "Murajaah hafalan pekan/bulan terakhir",
  Manzil: "Murajaah hafalan lama yang sudah jauh",
};

export function predikatDariNilai(nilai: number) {
  if (nilai >= 90) return "Mumtaz";
  if (nilai >= 80) return "Jayyid Jiddan";
  if (nilai >= 70) return "Jayyid";
  return "Maqbul";
}

export function kelancaranDariNilai(nilai: number) {
  if (nilai >= 90) return "Sangat Lancar";
  if (nilai >= 80) return "Lancar";
  if (nilai >= 70) return "Cukup Lancar";
  return "Kurang Lancar";
}

export async function fetchUstadz(): Promise<Ustadz[]> {
  const { data, error } = await client.from("ustadz").select("*").order("nama");
  if (error) throw error;
  return data ?? [];
}

export async function fetchSantri(): Promise<Santri[]> {
  const { data, error } = await client.from("santri").select("*").order("kelas").order("nama");
  if (error) throw error;
  return data ?? [];
}

export async function fetchSetoran(filter?: {
  from?: string;
  to?: string;
  santriId?: string;
}): Promise<Setoran[]> {
  let q = client.from("setoran").select("*").order("tanggal", { ascending: false });
  if (filter?.from) q = q.gte("tanggal", filter.from);
  if (filter?.to) q = q.lte("tanggal", filter.to);
  if (filter?.santriId) q = q.eq("santri_id", filter.santriId);
  const { data, error } = await q.limit(20000);
  if (error) throw error;
  return data ?? [];
}

export async function fetchPengaturan(): Promise<Pengaturan> {
  const { data, error } = await client.from("pengaturan").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function simpanPengaturan(values: Partial<Pengaturan>) {
  const { error } = await client.from("pengaturan").update(values).eq("id", 1);
  if (error) throw error;
}

export async function upsertRow(table: string, values: Record<string, unknown>, id?: string) {
  if (id) {
    const { error } = await client.from(table).update(values).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await client.from(table).insert(values);
    if (error) throw error;
  }
}

export async function hapusRow(table: string, id: string) {
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw error;
}
