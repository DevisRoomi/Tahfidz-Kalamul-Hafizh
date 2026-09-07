import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpenCheck, GraduationCap, Star, Users } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchSantri, fetchSetoran, fetchUstadz } from "@/lib/db";
import { angka, bulanKey, formatTanggal, labelBulan, rata } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Tahfidz — Pesantren Darul Ilmi" },
      {
        name: "description",
        content:
          "Ringkasan setoran hafalan, grafik perkembangan, dan peringkat santri terbaik Pesantren Darul Ilmi.",
      },
      { property: "og:title", content: "Dashboard Tahfidz — Pesantren Darul Ilmi" },
      {
        property: "og:description",
        content: "Statistik setoran Sabaq, Sabqi, dan Manzil santri secara langsung dari data.",
      },
    ],
  }),
  component: Dashboard,
});

const WARNA = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function Dashboard() {
  const santriQ = useQuery({ queryKey: ["santri"], queryFn: fetchSantri });
  const ustadzQ = useQuery({ queryKey: ["ustadz"], queryFn: fetchUstadz });
  const setoranQ = useQuery({ queryKey: ["setoran"], queryFn: () => fetchSetoran() });

  const santri = santriQ.data ?? [];
  const ustadz = ustadzQ.data ?? [];
  const setoran = setoranQ.data ?? [];
  const loading = santriQ.isLoading || setoranQ.isLoading;

  const bulanTerbaru = setoran.length ? bulanKey(setoran[0]!.tanggal) : "";
  const setoranBulanIni = setoran.filter((s) => bulanKey(s.tanggal) === bulanTerbaru);
  const rataNilai = rata(setoran.map((s) => Number(s.nilai)));

  const perBulanMap = new Map<string, { total: number; ayat: number; nilai: number[] }>();
  for (const s of setoran) {
    const k = bulanKey(s.tanggal);
    const cur = perBulanMap.get(k) ?? { total: 0, ayat: 0, nilai: [] };
    cur.total += 1;
    cur.ayat += s.jumlah_ayat;
    cur.nilai.push(Number(s.nilai));
    perBulanMap.set(k, cur);
  }
  const perBulan = [...perBulanMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({
      bulan: labelBulan(k),
      setoran: v.total,
      ayat: v.ayat,
      rataNilai: Number(rata(v.nilai).toFixed(1)),
    }));

  const perJenis = (["Sabaq", "Sabqi", "Manzil"] as const).map((j) => ({
    name: j,
    value: setoran.filter((s) => s.jenis === j).length,
  }));

  const perKelas = [7, 8, 9, 10, 11, 12].map((k) => {
    const ids = new Set(santri.filter((s) => s.kelas === k).map((s) => s.id));
    const list = setoran.filter((s) => ids.has(s.santri_id));
    return {
      kelas: `Kelas ${k}`,
      santri: ids.size,
      ayat: list.reduce((a, b) => a + b.jumlah_ayat, 0),
      rataNilai: Number(rata(list.map((s) => Number(s.nilai))).toFixed(1)),
    };
  });

  const ranking = santri
    .map((s) => {
      const list = setoran.filter((x) => x.santri_id === s.id);
      const ayat = list.reduce((a, b) => a + b.jumlah_ayat, 0);
      return {
        ...s,
        jumlahSetoran: list.length,
        ayat,
        rataNilai: rata(list.map((x) => Number(x.nilai))),
        skor: ayat * 0.6 + rata(list.map((x) => Number(x.nilai))) * 4,
      };
    })
    .sort((a, b) => b.skor - a.skor)
    .slice(0, 10);

  const ayatMax = Math.max(1, ...ranking.map((r) => r.ayat));
  const terbaru = setoran.slice(0, 8);
  const namaSantri = (id: string) => santri.find((s) => s.id === id)?.nama ?? "-";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          loading
            ? "Memuat data setoran…"
            : `Ringkasan aktual dari ${angka(setoran.length, 0)} catatan setoran tahfidz.`
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Santri"
          value={angka(santri.length, 0)}
          sub={`${santri.filter((s) => s.status === "Aktif").length} santri aktif`}
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Ustadz Pengampu"
          value={angka(ustadz.length, 0)}
          sub="Pembimbing tahfidz"
        />
        <StatCard
          icon={<BookOpenCheck className="h-5 w-5" />}
          label={`Setoran ${bulanTerbaru ? labelBulan(bulanTerbaru) : "Bulan Ini"}`}
          value={angka(setoranBulanIni.length, 0)}
          sub={`${angka(setoranBulanIni.reduce((a, b) => a + b.jumlah_ayat, 0), 0)} ayat disetorkan`}
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Rata-rata Nilai"
          value={angka(rataNilai)}
          sub={`${setoran.filter((s) => Number(s.nilai) >= 90).length} setoran predikat Mumtaz`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perkembangan Setoran per Bulan</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perBulan}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bulan" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="setoran" name="Jumlah setoran" fill="var(--chart-1)" radius={6} />
                <Bar dataKey="ayat" name="Jumlah ayat" fill="var(--chart-2)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Komposisi Jenis Setoran</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={perJenis}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {perJenis.map((_, i) => (
                    <Cell key={i} fill={WARNA[i % WARNA.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Nilai per Bulan</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perBulan}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bulan" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis domain={[60, 100]} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rataNilai"
                  name="Rata-rata nilai"
                  stroke="var(--chart-3)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capaian Ayat per Kelas</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perKelas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis
                  type="category"
                  dataKey="kelas"
                  width={70}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar dataKey="ayat" name="Total ayat" fill="var(--chart-4)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peringkat 10 Santri Terbaik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ranking.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i < 3
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.nama}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {angka(r.ayat, 0)} ayat · {angka(r.rataNilai)}
                    </span>
                  </div>
                  <Progress value={(r.ayat / ayatMax) * 100} className="mt-1.5 h-2" />
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Kelas {r.kelas}
                </Badge>
              </div>
            ))}
            {ranking.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada data setoran.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setoran Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {terbaru.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{namaSantri(s.santri_id)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.surah} {s.ayat_mulai}–{s.ayat_selesai} · {formatTanggal(s.tanggal)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge>{s.jenis}</Badge>
                  <span className="text-sm font-bold">{angka(Number(s.nilai))}</span>
                </div>
              </div>
            ))}
            <Link
              to="/setoran"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Lihat semua setoran →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
