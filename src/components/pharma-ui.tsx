import { Link } from "@tanstack/react-router";
import { Pill, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AppHeader({ title, backTo, right, subtitle }: { title: string; subtitle?: string; backTo?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        {backTo ? (
          <Link to={backTo} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-secondary/70">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : (
          <Link to="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand text-white shadow-md">
            <Pill className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function StatusBadge({ status }: { status: "taken" | "missed" | "late" | "pending" }) {
  const map = {
    taken: "bg-success/15 text-success border-success/30",
    missed: "bg-destructive/15 text-destructive border-destructive/30",
    late: "bg-warning/20 text-warning-foreground border-warning/40",
    pending: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function StatCard({ label, value, hint, accent, icon }: { label: string; value: string | number; hint?: string; accent?: "primary" | "success" | "warning" | "destructive"; icon?: ReactNode }) {
  const accentMap = {
    primary: "from-primary/15 to-primary/0 text-primary",
    success: "from-success/15 to-success/0 text-success",
    warning: "from-warning/25 to-warning/0 text-warning-foreground",
    destructive: "from-destructive/15 to-destructive/0 text-destructive",
  } as const;
  const a = accentMap[accent ?? "primary"];
  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl border bg-card p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${a} opacity-70 pointer-events-none`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold sm:text-3xl">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/70 ${a.split(" ").pop()}`}>{icon}</div>}
      </div>
    </div>
  );
}
