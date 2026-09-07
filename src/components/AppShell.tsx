import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpenCheck,
  FileBarChart,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { fetchPengaturan } from "@/lib/db";
import { cn } from "@/lib/utils";

const MENU = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/santri", label: "Data Santri", icon: Users },
  { to: "/ustadz", label: "Data Ustadz Pengampu", icon: GraduationCap },
  { to: "/setoran", label: "Input Setoran Tahfidz", icon: BookOpenCheck },
  { to: "/laporan", label: "Laporan Bulanan Santri", icon: FileBarChart },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: pengaturan } = useQuery({ queryKey: ["pengaturan"], queryFn: fetchPengaturan });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pengaturan?.tema) {
      document.documentElement.setAttribute("data-tema", pengaturan.tema);
    }
  }, [pengaturan?.tema]);

  const nama = pengaturan?.nama_pesantren ?? "Pesantren Darul Ilmi";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          {pengaturan?.logo_url ? (
            <img
              src={pengaturan.logo_url}
              alt="Logo pesantren"
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              {nama.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{nama}</p>
            <p className="text-xs text-sidebar-foreground/70">Pencatatan Tahfidz</p>
          </div>
          <button
            className="ml-auto rounded-md p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MENU.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/70">
          {pengaturan?.tahun_ajaran ?? "-"} · Semester {pengaturan?.semester ?? "-"}
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Buka menu" className="rounded-md p-1">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold">{nama}</span>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
