import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, Stethoscope, User, ShieldCheck, Activity, Bell } from "lucide-react";
import { useRedirectToDashboard } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaSync — Smart Medication Adherence" },
      { name: "description", content: "Pharmacist-managed medication regimens with secure patient accounts, smart reminders, and adherence tracking." },
    ],
  }),
  component: Landing,
});

function Landing() {
  useRedirectToDashboard();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white shadow-md">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-none">PharmaSync</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Adherence Platform</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success sm:inline">Made by Entreprenuership Group 15</span>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3 py-1.5 text-xs font-semibold text-accent-foreground">
              <Activity className="h-3.5 w-3.5" /> Chronic care, simplified
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Never miss a dose <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">again.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              PharmaSync connects pharmacists and chronic disease patients with smart reminders, secure patient accounts, and real-time adherence tracking, designed for everyone, from young to elderly.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link to="/login?role=pharmacist" className="card-elevated group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl gradient-brand text-white">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold">I'm a Pharmacist</p>
                  <p className="text-sm text-muted-foreground">Manage patient regimens</p>
                </div>
              </Link>
              <Link to="/login?role=patient" className="card-elevated group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl gradient-health text-white">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold">I'm a Patient</p>
                  <p className="text-sm text-muted-foreground">View today's medications</p>
                </div>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Demo with patient Kwame Mensah and 3 chronic medications.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] gradient-brand opacity-20 blur-3xl" />
            <div className="card-elevated rounded-3xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary text-lg font-bold">KM</div>
                <div className="flex-1">
                  <p className="font-bold">Kwame Mensah</p>
                  <p className="text-xs text-muted-foreground">62 • Hypertension, Diabetes</p>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">94%</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { name: "Amlodipine 10mg", time: "8:00 AM", status: "Taken" },
                  { name: "Metformin 500mg", time: "8:00 PM", status: "Next in 2h" },
                  { name: "Atorvastatin 20mg", time: "10:00 PM", status: "Scheduled" },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Pill className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.time}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{m.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3 text-accent-foreground">
                <div className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4" /> Next dose in 1h 47m</div>
                <span className="text-xs font-bold">Metformin</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Secure patient accounts", desc: "Each patient logs in to their own profile so only their medications and reminders are visible." },
            { icon: Bell, title: "Smart reminders", desc: "Time-based dose alerts with snooze, taken, and missed tracking." },
            { icon: Pill, title: "Pharmacist-controlled", desc: "Only pharmacists can edit regimens — patients only view reminders and history." },
          ].map(f => (
            <div key={f.title} className="card-elevated rounded-2xl border bg-card p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
              <p className="mt-3 font-bold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
         <footer className="mt-16 text-center text-xs text-slate-400 font-medium">
            <p>© 2026 PharmaSync Systems Ghana Ltd. All Rights Reserved. A Group 15 Enterprise</p>
          </footer>

      </main>
    </div>
  );
}
