import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPengaturan, simpanPengaturan } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Aplikasi — Tahfidz Darul Ilmi" },
      {
        name: "description",
        content: "Ubah nama pesantren, logo, tahun ajaran, dan pilih salah satu dari 6 tema warna.",
      },
      { property: "og:title", content: "Pengaturan Aplikasi — Tahfidz Darul Ilmi" },
      {
        property: "og:description",
        content: "Sesuaikan identitas dan tampilan aplikasi pencatatan tahfidz.",
      },
    ],
  }),
  component: Pengaturan,
});

const TEMA = [
  { id: "hijau-klasik", nama: "Hijau Klasik", warna: ["#2f7a53", "#7fbf6a", "#f4f9f5"] },
  { id: "biru-samudra", nama: "Biru Samudra", warna: ["#2b5fd0", "#4fa8d8", "#f2f6fd"] },
  { id: "ungu-senja", nama: "Ungu Senja", warna: ["#7239c4", "#d264b8", "#f8f3fd"] },
  { id: "maroon-emas", nama: "Maroon Emas", warna: ["#8c2f22", "#d8a33a", "#fbf6ee"] },
  { id: "teal-modern", nama: "Teal Modern", warna: ["#22808a", "#4fc7a8", "#f0f9fa"] },
  { id: "malam-gelap", nama: "Malam Gelap", warna: ["#1b1f2b", "#3ecfa0", "#2a3040"] },
];

function Pengaturan() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["pengaturan"], queryFn: fetchPengaturan });
  const [form, setForm] = useState({
    nama_pesantren: "",
    logo_url: "",
    tema: "hijau-klasik",
    tahun_ajaran: "",
    semester: "Ganjil",
    alamat: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        nama_pesantren: data.nama_pesantren,
        logo_url: data.logo_url ?? "",
        tema: data.tema,
        tahun_ajaran: data.tahun_ajaran,
        semester: data.semester,
        alamat: data.alamat ?? "",
      });
    }
  }, [data]);

  function pilihTema(id: string) {
    setForm((f) => ({ ...f, tema: id }));
    document.documentElement.setAttribute("data-tema", id);
  }

  const simpan = useMutation({
    mutationFn: async () => {
      if (!form.nama_pesantren.trim()) throw new Error("Nama pesantren wajib diisi");
      await simpanPengaturan({
        nama_pesantren: form.nama_pesantren.trim(),
        logo_url: form.logo_url || null,
        tema: form.tema,
        tahun_ajaran: form.tahun_ajaran,
        semester: form.semester,
        alamat: form.alamat || null,
      });
    },
    onSuccess: () => {
      toast.success("Pengaturan tersimpan");
      qc.invalidateQueries({ queryKey: ["pengaturan"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Sesuaikan identitas pesantren dan tampilan aplikasi."
        action={
          <Button onClick={() => simpan.mutate()} disabled={simpan.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {simpan.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identitas Pesantren</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Pesantren" full>
              <Input
                value={form.nama_pesantren}
                onChange={(e) => setForm({ ...form, nama_pesantren: e.target.value })}
              />
            </Field>
            <Field label="Alamat Logo (URL gambar)" full>
              <Input
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://…/logo.png"
              />
            </Field>
            <Field label="Tahun Ajaran">
              <Input
                value={form.tahun_ajaran}
                onChange={(e) => setForm({ ...form, tahun_ajaran: e.target.value })}
                placeholder="2026/2027"
              />
            </Field>
            <Field label="Semester">
              <Select
                value={form.semester}
                onValueChange={(v) => setForm({ ...form, semester: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Alamat Pesantren" full>
              <Input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2 flex items-center gap-4 rounded-xl border border-border p-4">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Pratinjau logo"
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                  {form.nama_pesantren.charAt(0) || "D"}
                </div>
              )}
              <div>
                <p className="font-semibold">{form.nama_pesantren || "Nama pesantren"}</p>
                <p className="text-xs text-muted-foreground">
                  {form.tahun_ajaran} · Semester {form.semester}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tema Tampilan (6 Template)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {TEMA.map((t) => (
              <button
                key={t.id}
                onClick={() => pilihTema(t.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
                  form.tema === t.id ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <div className="flex gap-1">
                  {t.warna.map((w) => (
                    <span
                      key={w}
                      className="h-8 w-4 rounded-full"
                      style={{ backgroundColor: w }}
                    />
                  ))}
                </div>
                <span className="flex-1 text-sm font-medium">{t.nama}</span>
                {form.tema === t.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Tema langsung terlihat saat dipilih. Tekan “Simpan Pengaturan” agar tersimpan
              permanen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
