import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  fetchPengaturan,
  fetchSantri,
  fetchSetoran,
  fetchUstadz,
  predikatDariNilai,
} from "@/lib/db";
import { angka, bulanKey, formatTanggal, labelBulan, rata } from "@/lib/format";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan Bulanan Santri — Tahfidz Darul Ilmi" },
      {
        name: "description",
        content:
          "Rekap bulanan setoran hafalan setiap santri lengkap dengan nilai, predikat, dan unduhan PDF.",
      },
      { property: "og:title", content: "Laporan Bulanan Santri — Tahfidz Darul Ilmi" },
      {
        property: "og:description",
        content: "Laporan tahfidz bulanan per kelas dan per santri yang siap diunduh dalam PDF.",
      },
    ],
  }),
  component: LaporanBulanan,
});

function LaporanBulanan() {
  const santriQ = useQuery({ queryKey: ["santri"], queryFn: fetchSantri });
  const ustadzQ = useQuery({ queryKey: ["ustadz"], queryFn: fetchUstadz });
  const setoranQ = useQuery({ queryKey: ["setoran"], queryFn: () => fetchSetoran() });
  const pengaturanQ = useQuery({ queryKey: ["pengaturan"], queryFn: fetchPengaturan });

  const santri = santriQ.data ?? [];
  const ustadz = ustadzQ.data ?? [];
  const setoran = setoranQ.data ?? [];

  const daftarBulan = useMemo(() => {
    const set = new Set(setoran.map((s) => bulanKey(s.tanggal)));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [setoran]);

  const [bulan, setBulan] = useState("");
  const [kelas, setKelas] = useState("semua");
  const [santriTerpilih, setSantriTerpilih] = useState("semua");
  const [cari, setCari] = useState("");

  const bulanAktif = bulan || daftarBulan[0] || "";
  const dataBulan = setoran.filter((s) => bulanKey(s.tanggal) === bulanAktif);

  const baris = santri
    .filter((s) => kelas === "semua" || String(s.kelas) === kelas)
    .filter((s) => santriTerpilih === "semua" || s.id === santriTerpilih)
    .filter((s) => !cari.trim() || s.nama.toLowerCase().includes(cari.toLowerCase()))
    .map((s) => {
      const list = dataBulan.filter((x) => x.santri_id === s.id);
      const nilaiRata = rata(list.map((x) => Number(x.nilai)));
      return {
        santri: s,
        sabaq: list.filter((x) => x.jenis === "Sabaq").length,
        sabqi: list.filter((x) => x.jenis === "Sabqi").length,
        manzil: list.filter((x) => x.jenis === "Manzil").length,
        total: list.length,
        ayat: list.reduce((a, b) => a + b.jumlah_ayat, 0),
        nilai: nilaiRata,
        predikat: list.length ? predikatDariNilai(nilaiRata) : "-",
        pengampu: ustadz.find((u) => u.id === s.ustadz_id)?.nama ?? "-",
      };
    })
    .sort((a, b) => b.ayat - a.ayat);

  const detail =
    santriTerpilih !== "semua"
      ? dataBulan
          .filter((s) => s.santri_id === santriTerpilih)
          .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      : [];

  async function unduhPdf() {
    try {
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableMod as unknown as { default: any }).default;
      const doc = new jsPDF({ orientation: "landscape" });
      const nama = pengaturanQ.data?.nama_pesantren ?? "Pesantren Darul Ilmi";

      doc.setFontSize(16);
      doc.text(nama, 14, 16);
      doc.setFontSize(11);
      doc.text(`Laporan Bulanan Tahfidz — ${labelBulan(bulanAktif)}`, 14, 23);
      doc.setFontSize(9);
      doc.text(
        `Tahun Ajaran ${pengaturanQ.data?.tahun_ajaran ?? "-"} · Semester ${
          pengaturanQ.data?.semester ?? "-"
        } · ${kelas === "semua" ? "Semua kelas" : `Kelas ${kelas}`}`,
        14,
        29,
      );

      autoTable(doc, {
        startY: 34,
        head: [
          [
            "No",
            "NIS",
            "Nama Santri",
            "Kelas",
            "Pengampu",
            "Sabaq",
            "Sabqi",
            "Manzil",
            "Total Setoran",
            "Total Ayat",
            "Rata Nilai",
            "Predikat",
          ],
        ],
        body: baris.map((b, i) => [
          i + 1,
          b.santri.nis,
          b.santri.nama,
          b.santri.kelas,
          b.pengampu,
          b.sabaq,
          b.sabqi,
          b.manzil,
          b.total,
          b.ayat,
          b.total ? angka(b.nilai) : "-",
          b.predikat,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 87, 61] },
      });

      if (detail.length) {
        const nm = santri.find((s) => s.id === santriTerpilih)?.nama ?? "";
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 8,
          head: [["Tanggal", "Jenis", "Surah", "Ayat", "Jumlah", "Nilai", "Kelancaran", "Catatan"]],
          body: detail.map((d) => [
            formatTanggal(d.tanggal),
            d.jenis,
            d.surah,
            `${d.ayat_mulai}-${d.ayat_selesai}`,
            d.jumlah_ayat,
            angka(Number(d.nilai)),
            d.kelancaran,
            d.catatan ?? "-",
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [34, 87, 61] },
          didDrawPage: () => {
            doc.setFontSize(10);
            doc.text(`Rincian setoran: ${nm}`, 14, (doc as any).lastAutoTable?.startY - 3 || 40);
          },
        });
      }

      doc.save(`Laporan-Tahfidz-${bulanAktif}.pdf`);
      toast.success("Laporan PDF berhasil diunduh");
    } catch (e) {
      toast.error("Gagal membuat PDF: " + (e as Error).message);
    }
  }

  const totalAyat = baris.reduce((a, b) => a + b.ayat, 0);
  const totalSetoran = baris.reduce((a, b) => a + b.total, 0);

  return (
    <div>
      <PageHeader
        title="Laporan Bulanan Santri"
        description={
          bulanAktif ? `Rekap setoran ${labelBulan(bulanAktif)}.` : "Belum ada data setoran."
        }
        action={
          <Button onClick={unduhPdf} disabled={!baris.length}>
            <Download className="mr-2 h-4 w-4" /> Unduh PDF
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Select value={bulanAktif} onValueChange={setBulan}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {daftarBulan.map((b) => (
                <SelectItem key={b} value={b}>
                  {labelBulan(b)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={kelas}
            onValueChange={(v) => {
              setKelas(v);
              setSantriTerpilih("semua");
            }}
          >
            <SelectTrigger className="w-40">
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
          <Select value={santriTerpilih} onValueChange={setSantriTerpilih}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="semua">Semua Santri</SelectItem>
              {santri
                .filter((s) => kelas === "semua" || String(s.kelas) === kelas)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nama}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            className="w-52"
            placeholder="Cari nama santri…"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Ringkas label="Santri dalam laporan" nilai={angka(baris.length, 0)} />
        <Ringkas label="Total setoran" nilai={angka(totalSetoran, 0)} />
        <Ringkas label="Total ayat" nilai={angka(totalAyat, 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Rekap {bulanAktif ? labelBulan(bulanAktif) : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Pengampu</TableHead>
                {JENIS_SETORAN.map((j) => (
                  <TableHead key={j} className="text-right">
                    {j}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total Ayat</TableHead>
                <TableHead className="text-right">Rata Nilai</TableHead>
                <TableHead>Predikat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baris.map((b) => (
                <TableRow key={b.santri.id}>
                  <TableCell className="font-mono text-xs">{b.santri.nis}</TableCell>
                  <TableCell className="font-medium">{b.santri.nama}</TableCell>
                  <TableCell>{b.santri.kelas}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.pengampu}</TableCell>
                  <TableCell className="text-right">{b.sabaq}</TableCell>
                  <TableCell className="text-right">{b.sabqi}</TableCell>
                  <TableCell className="text-right">{b.manzil}</TableCell>
                  <TableCell className="text-right">{angka(b.ayat, 0)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {b.total ? angka(b.nilai) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.predikat === "Mumtaz" ? "default" : "secondary"}>
                      {b.predikat}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {baris.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    {setoranQ.isLoading ? "Memuat data…" : "Tidak ada data pada filter ini."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {detail.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Rincian Setoran — {santri.find((s) => s.id === santriTerpilih)?.nama}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Surah / Ayat</TableHead>
                  <TableHead className="text-right">Jumlah Ayat</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Kelancaran</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatTanggal(d.tanggal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{d.jenis}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.surah} {d.ayat_mulai}–{d.ayat_selesai}
                    </TableCell>
                    <TableCell className="text-right">{d.jumlah_ayat}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {angka(Number(d.nilai))}
                    </TableCell>
                    <TableCell className="text-sm">{d.kelancaran}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.catatan ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Ringkas({ label, nilai }: { label: string; nilai: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{nilai}</p>
      </CardContent>
    </Card>
  );
}
