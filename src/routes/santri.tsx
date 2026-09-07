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
import { KELAS_LIST, fetchSantri, fetchSetoran, fetchUstadz, hapusRow, upsertRow } from "@/lib/db";
import type { Santri } from "@/lib/db";
import { angka } from "@/lib/format";

export const Route = createFileRoute("/santri")({
  head: () => ({
    meta: [
      { title: "Data Santri — Tahfidz Darul Ilmi" },
      {
        name: "description",
        content: "Kelola data santri kelas 7 sampai 12 beserta ustadz pengampu dan capaian hafalan.",
      },
      { property: "og:title", content: "Data Santri — Tahfidz Darul Ilmi" },
      {
        property: "og:description",
        content: "Tambah, ubah, cari, dan filter data santri tahfidz Pesantren Darul Ilmi.",
      },
    ],
  }),
  component: DataSantri,
});

const KOSONG = {
  nis: "",
  nama: "",
  kelas: "7",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  alamat: "",
  nama_wali: "",
  no_hp_wali: "",
  ustadz_id: "",
  status: "Aktif",
};

function DataSantri() {
  const qc = useQueryClient();
  const santriQ = useQuery({ queryKey: ["santri"], queryFn: fetchSantri });
  const ustadzQ = useQuery({ queryKey: ["ustadz"], queryFn: fetchUstadz });
  const setoranQ = useQuery({ queryKey: ["setoran"], queryFn: () => fetchSetoran() });

  const [cari, setCari] = useState("");
  const [kelas, setKelas] = useState("semua");
  const [pengampu, setPengampu] = useState("semua");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...KOSONG });

  const santri = santriQ.data ?? [];
  const ustadz = ustadzQ.data ?? [];
  const setoran = setoranQ.data ?? [];

  const statistik = useMemo(() => {
    const map = new Map<string, { setoran: number; ayat: number }>();
    for (const s of setoran) {
      const cur = map.get(s.santri_id) ?? { setoran: 0, ayat: 0 };
      cur.setoran += 1;
      cur.ayat += s.jumlah_ayat;
      map.set(s.santri_id, cur);
    }
    return map;
  }, [setoran]);

  const hasil = santri.filter((s) => {
    const q = cari.trim().toLowerCase();
    const cocok = !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
    const cocokKelas = kelas === "semua" || String(s.kelas) === kelas;
    const cocokUstadz = pengampu === "semua" || s.ustadz_id === pengampu;
    return cocok && cocokKelas && cocokUstadz;
  });

  const simpan = useMutation({
    mutationFn: async () => {
      if (!form.nis.trim() || !form.nama.trim()) throw new Error("NIS dan nama wajib diisi");
      await upsertRow(
        "santri",
        {
          nis: form.nis.trim(),
          nama: form.nama.trim(),
          kelas: Number(form.kelas),
          jenis_kelamin: form.jenis_kelamin,
          tanggal_lahir: form.tanggal_lahir || null,
          alamat: form.alamat || null,
          nama_wali: form.nama_wali || null,
          no_hp_wali: form.no_hp_wali || null,
          ustadz_id: form.ustadz_id || null,
          status: form.status,
        },
        editId ?? undefined,
      );
    },
    onSuccess: () => {
      toast.success(editId ? "Data santri diperbarui" : "Santri baru ditambahkan");
      qc.invalidateQueries({ queryKey: ["santri"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hapus = useMutation({
    mutationFn: (id: string) => hapusRow("santri", id),
    onSuccess: () => {
      toast.success("Data santri dihapus");
      qc.invalidateQueries({ queryKey: ["santri"] });
      qc.invalidateQueries({ queryKey: ["setoran"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function bukaTambah() {
    setEditId(null);
    setForm({ ...KOSONG });
    setOpen(true);
  }

  function bukaEdit(s: Santri) {
    setEditId(s.id);
    setForm({
      nis: s.nis,
      nama: s.nama,
      kelas: String(s.kelas),
      jenis_kelamin: s.jenis_kelamin,
      tanggal_lahir: s.tanggal_lahir ?? "",
      alamat: s.alamat ?? "",
      nama_wali: s.nama_wali ?? "",
      no_hp_wali: s.no_hp_wali ?? "",
      ustadz_id: s.ustadz_id ?? "",
      status: s.status,
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Data Santri"
        description={`${hasil.length} dari ${santri.length} santri ditampilkan.`}
        action={
          <Button onClick={bukaTambah}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Santri
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIS santri…"
              className="pl-9"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
          <Select value={kelas} onValueChange={setKelas}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kelas" />
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
          <Select value={pengampu} onValueChange={setPengampu}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Ustadz pengampu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Pengampu</SelectItem>
              {ustadz.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>Ustadz Pengampu</TableHead>
                <TableHead className="text-right">Setoran</TableHead>
                <TableHead className="text-right">Total Ayat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasil.map((s) => {
                const st = statistik.get(s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                    <TableCell className="font-medium">{s.nama}</TableCell>
                    <TableCell>{s.kelas}</TableCell>
                    <TableCell>{s.jenis_kelamin}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ustadz.find((u) => u.id === s.ustadz_id)?.nama ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">{angka(st?.setoran ?? 0, 0)}</TableCell>
                    <TableCell className="text-right">{angka(st?.ayat ?? 0, 0)}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Aktif" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => bukaEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Hapus data santri ${s.nama}? Setorannya ikut terhapus.`))
                            hapus.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {hasil.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    {santriQ.isLoading ? "Memuat data…" : "Tidak ada santri yang cocok."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Ubah Data Santri" : "Tambah Santri"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="NIS">
              <Input
                value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                placeholder="2026051"
              />
            </Field>
            <Field label="Nama Lengkap">
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </Field>
            <Field label="Kelas">
              <Select value={form.kelas} onValueChange={(v) => setForm({ ...form, kelas: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KELAS_LIST.map((k) => (
                    <SelectItem key={k} value={String(k)}>
                      Kelas {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Jenis Kelamin">
              <Select
                value={form.jenis_kelamin}
                onValueChange={(v) => setForm({ ...form, jenis_kelamin: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tanggal Lahir">
              <Input
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
              />
            </Field>
            <Field label="Ustadz Pengampu">
              <Select
                value={form.ustadz_id || "none"}
                onValueChange={(v) => setForm({ ...form, ustadz_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pengampu" />
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
            <Field label="Nama Wali">
              <Input
                value={form.nama_wali}
                onChange={(e) => setForm({ ...form, nama_wali: e.target.value })}
              />
            </Field>
            <Field label="No. HP Wali">
              <Input
                value={form.no_hp_wali}
                onChange={(e) => setForm({ ...form, no_hp_wali: e.target.value })}
              />
            </Field>
            <Field label="Alamat" full>
              <Input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                  <SelectItem value="Lulus">Lulus</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => simpan.mutate()} disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
