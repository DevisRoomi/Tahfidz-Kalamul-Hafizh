import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  JENIS_SETORAN,
  KELAS_LIST,
  PENJELASAN_JENIS,
  fetchSantri,
  fetchSetoran,
  fetchUstadz,
  hapusRow,
  kelancaranDariNilai,
  predikatDariNilai,
  upsertRow,
} from "@/lib/db";
import type { JenisSetoran, Setoran } from "@/lib/db";
import { angka, formatTanggal } from "@/lib/format";

export const Route = createFileRoute("/setoran")({
  head: () => ({
    meta: [
      { title: "Input Setoran Tahfidz — Darul Ilmi" },
      {
        name: "description",
        content:
          "Catat setoran hafalan Sabaq, Sabqi, dan Manzil santri lengkap dengan surah, ayat, dan nilai.",
      },
      { property: "og:title", content: "Input Setoran Tahfidz — Darul Ilmi" },
      {
        property: "og:description",
        content: "Formulir pencatatan setoran hafalan harian santri Pesantren Darul Ilmi.",
      },
    ],
  }),
  component: InputSetoran,
});

const HARI_INI = new Date().toISOString().slice(0, 10);

const KOSONG = {
  santri_id: "",
  ustadz_id: "",
  tanggal: HARI_INI,
  jenis: "Sabaq" as JenisSetoran,
  surah: "",
  juz: "30",
  ayat_mulai: "1",
  ayat_selesai: "5",
  nilai: "85",
  catatan: "",
};

function InputSetoran() {
  const qc = useQueryClient();
  const santriQ = useQuery({ queryKey: ["santri"], queryFn: fetchSantri });
  const ustadzQ = useQuery({ queryKey: ["ustadz"], queryFn: fetchUstadz });
  const setoranQ = useQuery({ queryKey: ["setoran"], queryFn: () => fetchSetoran() });

  const [cari, setCari] = useState("");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kelasFilter, setKelasFilter] = useState("semua");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...KOSONG });

  const santri = santriQ.data ?? [];
  const ustadz = ustadzQ.data ?? [];
  const setoran = setoranQ.data ?? [];

  const santriMap = useMemo(() => new Map(santri.map((s) => [s.id, s])), [santri]);

  const hasil = setoran.filter((s) => {
    const st = santriMap.get(s.santri_id);
    const q = cari.trim().toLowerCase();
    if (q && !(st?.nama.toLowerCase().includes(q) || s.surah.toLowerCase().includes(q)))
      return false;
    if (jenisFilter !== "semua" && s.jenis !== jenisFilter) return false;
    if (kelasFilter !== "semua" && String(st?.kelas) !== kelasFilter) return false;
    if (dari && s.tanggal < dari) return false;
    if (sampai && s.tanggal > sampai) return false;
    return true;
  });

  const perHalaman = 25;
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / perHalaman));
  const halamanAman = Math.min(halaman, totalHalaman);
  const tampil = hasil.slice((halamanAman - 1) * perHalaman, halamanAman * perHalaman);

  const jumlahAyat = Math.max(1, Number(form.ayat_selesai) - Number(form.ayat_mulai) + 1);

  const simpan = useMutation({
    mutationFn: async () => {
      if (!form.santri_id) throw new Error("Pilih santri terlebih dahulu");
      if (!form.surah.trim()) throw new Error("Nama surah wajib diisi");
      const nilai = Number(form.nilai);
      if (Number.isNaN(nilai) || nilai < 0 || nilai > 100)
        throw new Error("Nilai harus antara 0 sampai 100");
      if (Number(form.ayat_selesai) < Number(form.ayat_mulai))
        throw new Error("Ayat selesai tidak boleh lebih kecil dari ayat mulai");
      await upsertRow(
        "setoran",
        {
          santri_id: form.santri_id,
          ustadz_id: form.ustadz_id || null,
          tanggal: form.tanggal,
          jenis: form.jenis,
          surah: form.surah.trim(),
          juz: form.juz ? Number(form.juz) : null,
          ayat_mulai: Number(form.ayat_mulai),
          ayat_selesai: Number(form.ayat_selesai),
          jumlah_ayat: jumlahAyat,
          nilai,
          kelancaran: kelancaranDariNilai(nilai),
          predikat: predikatDariNilai(nilai),
          catatan: form.catatan || null,
        },
        editId ?? undefined,
      );
    },
    onSuccess: () => {
      toast.success(editId ? "Setoran diperbarui" : "Setoran tersimpan");
      qc.invalidateQueries({ queryKey: ["setoran"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hapus = useMutation({
    mutationFn: (id: string) => hapusRow("setoran", id),
    onSuccess: () => {
      toast.success("Setoran dihapus");
      qc.invalidateQueries({ queryKey: ["setoran"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function bukaTambah() {
    setEditId(null);
    setForm({ ...KOSONG });
    setOpen(true);
  }

  function bukaEdit(s: Setoran) {
    setEditId(s.id);
    setForm({
      santri_id: s.santri_id,
      ustadz_id: s.ustadz_id ?? "",
      tanggal: s.tanggal,
      jenis: s.jenis,
      surah: s.surah,
      juz: s.juz ? String(s.juz) : "",
      ayat_mulai: String(s.ayat_mulai),
      ayat_selesai: String(s.ayat_selesai),
      nilai: String(Number(s.nilai)),
      catatan: s.catatan ?? "",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Input Setoran Tahfidz"
        description={`${angka(hasil.length, 0)} catatan setoran sesuai filter.`}
        action={
          <Button onClick={bukaTambah}>
            <Plus className="mr-2 h-4 w-4" /> Input Setoran
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {JENIS_SETORAN.map((j) => {
          const list = hasil.filter((s) => s.jenis === j);
          return (
            <Card key={j}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Badge>{j}</Badge>
                  <span className="text-xl font-bold">{angka(list.length, 0)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{PENJELASAN_JENIS[j]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari nama santri atau surah…"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
            />
          </div>
          <Select
            value={jenisFilter}
            onValueChange={(v) => {
              setJenisFilter(v);
              setHalaman(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Jenis</SelectItem>
              {JENIS_SETORAN.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={kelasFilter}
            onValueChange={(v) => {
              setKelasFilter(v);
              setHalaman(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kelas</SelectItem>
              {KELAS_LIST.map((k) => (
                <SelectItem key={k} value={String(k)}>
                  Kelas {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-40"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
          />
          <Input
            type="date"
            className="w-40"
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Santri</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Surah / Ayat</TableHead>
                <TableHead className="text-right">Juz</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Kelancaran</TableHead>
                <TableHead>Predikat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tampil.map((s) => {
                const st = santriMap.get(s.santri_id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatTanggal(s.tanggal)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {st?.nama ?? "-"}
                      <span className="block text-xs text-muted-foreground">
                        Kelas {st?.kelas ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.jenis}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.surah} {s.ayat_mulai}–{s.ayat_selesai}
                      <span className="block text-xs text-muted-foreground">
                        {s.jumlah_ayat} ayat
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{s.juz ?? "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {angka(Number(s.nilai))}
                    </TableCell>
                    <TableCell className="text-sm">{s.kelancaran}</TableCell>
                    <TableCell className="text-sm">{s.predikat}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => bukaEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Hapus catatan setoran ini?")) hapus.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {tampil.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    {setoranQ.isLoading ? "Memuat data…" : "Belum ada setoran yang cocok."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Halaman {halamanAman} dari {totalHalaman}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={halamanAman <= 1}
                onClick={() => setHalaman(halamanAman - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={halamanAman >= totalHalaman}
                onClick={() => setHalaman(halamanAman + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Ubah Setoran" : "Input Setoran Tahfidz"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Santri" full>
              <Select
                value={form.santri_id}
                onValueChange={(v) => {
                  const st = santri.find((s) => s.id === v);
                  setForm({ ...form, santri_id: v, ustadz_id: st?.ustadz_id ?? form.ustadz_id });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {santri.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} — Kelas {s.kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ustadz Penyimak">
              <Select
                value={form.ustadz_id || "none"}
                onValueChange={(v) => setForm({ ...form, ustadz_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih ustadz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Belum ditentukan</SelectItem>
                  {ustadz.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tanggal">
              <Input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </Field>
            <Field label="Jenis Setoran" full>
              <Select
                value={form.jenis}
                onValueChange={(v) => setForm({ ...form, jenis: v as JenisSetoran })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_SETORAN.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j} — {PENJELASAN_JENIS[j]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Surah">
              <Input
                value={form.surah}
                onChange={(e) => setForm({ ...form, surah: e.target.value })}
                placeholder="Al-Baqarah"
              />
            </Field>
            <Field label="Juz">
              <Input
                type="number"
                min={1}
                max={30}
                value={form.juz}
                onChange={(e) => setForm({ ...form, juz: e.target.value })}
              />
            </Field>
            <Field label="Ayat Mulai">
              <Input
                type="number"
                min={1}
                value={form.ayat_mulai}
                onChange={(e) => setForm({ ...form, ayat_mulai: e.target.value })}
              />
            </Field>
            <Field label="Ayat Selesai">
              <Input
                type="number"
                min={1}
                value={form.ayat_selesai}
                onChange={(e) => setForm({ ...form, ayat_selesai: e.target.value })}
              />
            </Field>
            <Field label={`Nilai (0–100) · ${jumlahAyat} ayat`} full>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Otomatis: {kelancaranDariNilai(Number(form.nilai) || 0)} ·{" "}
                {predikatDariNilai(Number(form.nilai) || 0)}
              </p>
            </Field>
            <Field label="Catatan" full>
              <Textarea
                rows={3}
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Catatan ustadz untuk santri"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => simpan.mutate()} disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan…" : "Simpan Setoran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
