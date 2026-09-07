import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { fetchSantri, fetchSetoran, fetchUstadz, hapusRow, upsertRow } from "@/lib/db";
import type { Ustadz } from "@/lib/db";
import { angka, rata } from "@/lib/format";

export const Route = createFileRoute("/ustadz")({
  head: () => ({
    meta: [
      { title: "Data Ustadz Pengampu — Tahfidz Darul Ilmi" },
      {
        name: "description",
        content: "Daftar ustadz pengampu tahfidz beserta jumlah santri bimbingan dan setorannya.",
      },
      { property: "og:title", content: "Data Ustadz Pengampu — Tahfidz Darul Ilmi" },
      {
        property: "og:description",
        content: "Kelola data ustadz pembimbing hafalan santri Pesantren Darul Ilmi.",
      },
    ],
  }),
  component: DataUstadz,
});

const KOSONG = { nama: "", nip: "", no_hp: "", jenis_kelamin: "L", keterangan: "" };

function DataUstadz() {
  const qc = useQueryClient();
  const ustadzQ = useQuery({ queryKey: ["ustadz"], queryFn: fetchUstadz });
  const santriQ = useQuery({ queryKey: ["santri"], queryFn: fetchSantri });
  const setoranQ = useQuery({ queryKey: ["setoran"], queryFn: () => fetchSetoran() });

  const [cari, setCari] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...KOSONG });

  const ustadz = ustadzQ.data ?? [];
  const santri = santriQ.data ?? [];
  const setoran = setoranQ.data ?? [];

  const hasil = ustadz.filter(
    (u) =>
      !cari.trim() ||
      u.nama.toLowerCase().includes(cari.toLowerCase()) ||
      (u.nip ?? "").toLowerCase().includes(cari.toLowerCase()),
  );

  const simpan = useMutation({
    mutationFn: async () => {
      if (!form.nama.trim()) throw new Error("Nama ustadz wajib diisi");
      await upsertRow(
        "ustadz",
        {
          nama: form.nama.trim(),
          nip: form.nip || null,
          no_hp: form.no_hp || null,
          jenis_kelamin: form.jenis_kelamin,
          keterangan: form.keterangan || null,
        },
        editId ?? undefined,
      );
    },
    onSuccess: () => {
      toast.success(editId ? "Data ustadz diperbarui" : "Ustadz baru ditambahkan");
      qc.invalidateQueries({ queryKey: ["ustadz"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hapus = useMutation({
    mutationFn: (id: string) => hapusRow("ustadz", id),
    onSuccess: () => {
      toast.success("Data ustadz dihapus");
      qc.invalidateQueries({ queryKey: ["ustadz"] });
      qc.invalidateQueries({ queryKey: ["santri"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function bukaEdit(u: Ustadz) {
    setEditId(u.id);
    setForm({
      nama: u.nama,
      nip: u.nip ?? "",
      no_hp: u.no_hp ?? "",
      jenis_kelamin: u.jenis_kelamin,
      keterangan: u.keterangan ?? "",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Data Ustadz Pengampu"
        description={`${ustadz.length} ustadz pembimbing tahfidz terdaftar.`}
        action={
          <Button
            onClick={() => {
              setEditId(null);
              setForm({ ...KOSONG });
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Ustadz
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari nama atau NIP ustadz…"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Ustadz</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Santri Bimbingan</TableHead>
                <TableHead className="text-right">Setoran Dinilai</TableHead>
                <TableHead className="text-right">Rata Nilai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasil.map((u) => {
                const list = setoran.filter((s) => s.ustadz_id === u.id);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.nip ?? "-"}</TableCell>
                    <TableCell className="font-medium">{u.nama}</TableCell>
                    <TableCell>{u.no_hp ?? "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.keterangan ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {santri.filter((s) => s.ustadz_id === u.id).length}
                    </TableCell>
                    <TableCell className="text-right">{angka(list.length, 0)}</TableCell>
                    <TableCell className="text-right">
                      {angka(rata(list.map((s) => Number(s.nilai))))}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => bukaEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Hapus data ${u.nama}?`)) hapus.mutate(u.id);
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
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {ustadzQ.isLoading ? "Memuat data…" : "Tidak ada ustadz yang cocok."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Ubah Data Ustadz" : "Tambah Ustadz"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap" full>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </Field>
            <Field label="NIP">
              <Input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
            </Field>
            <Field label="No. HP">
              <Input
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />
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
            <Field label="Keterangan">
              <Input
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                placeholder="Pengampu kelas 7"
              />
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
