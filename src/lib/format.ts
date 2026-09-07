export const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatTanggal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function bulanKey(iso: string) {
  return iso.slice(0, 7);
}

export function labelBulan(key: string) {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return `${BULAN[m - 1]} ${y}`;
}

export function rentangBulan(key: string) {
  const [y, m] = key.split("-").map(Number);
  const awal = `${key}-01`;
  const akhirDate = new Date(Date.UTC(y!, m!, 0));
  const akhir = akhirDate.toISOString().slice(0, 10);
  return { awal, akhir };
}

export function rata(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function angka(n: number, digits = 1) {
  return n.toLocaleString("id-ID", { maximumFractionDigits: digits });
}
