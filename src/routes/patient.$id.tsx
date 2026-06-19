import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader, StatCard, StatusBadge } from "@/components/pharma-ui";
import { usePatient, store, adherenceStats, todaysSchedule } from "@/lib/pharma-store";
import { useRequireAuth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Pill, Bell, Clock, CheckCircle2, Activity, AlertTriangle, Utensils, History, LogOut } from "lucide-react";

export const Route = createFileRoute("/patient/$id")({
  head: () => ({ meta: [{ title: "My Medications — PharmaSync" }] }),
  notFoundComponent: () => <div className="grid min-h-screen place-items-center">Patient not found</div>,
  loader: ({ params }) => { if (!store.get(params.id)) throw notFound(); return null; },
  component: PatientView,
});

function PatientView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const authorized = useRequireAuth("patient", id);
  const patient = usePatient(id);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  if (!authorized) return null;
  if (!patient) return null;

  const s = adherenceStats(patient);
  const schedule = todaysSchedule(patient);
  const next = schedule.find(x => x.minutesUntil >= -15) ?? schedule[0];
  const lowRefills = patient.medications.filter(m => m.refillDays <= 7);

  const recent = [...patient.logs].sort((a,b) => b.scheduledTime.localeCompare(a.scheduledTime)).slice(0, 8);
  const medById = (mid: string) => patient.medications.find(m => m.id === mid);

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title={`Hello, ${patient.fullName.split(" ")[0]} 👋`}
        subtitle={now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        backTo="/"
        right={
          <Button onClick={() => { signOut(); navigate({ to: "/login", replace: true, search: { role: "patient" } }); }} variant="ghost" size="sm" className="h-9 gap-2 hidden sm:inline-flex">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* Hero next-dose card */}
        {next && (
          <section className="card-elevated relative overflow-hidden rounded-3xl border bg-card p-6">
            <div className="absolute inset-0 gradient-brand opacity-95" />
            <div className="relative text-white">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90"><Bell className="h-4 w-4" /> Next Medication</div>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{next.med.name} {next.med.strength}</h2>
              <p className="mt-1 text-base opacity-90">{next.med.dosage} • {next.med.foodInstructions}</p>
              <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Scheduled</p>
                  <p className="text-2xl font-bold">{formatTime(next.time)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Countdown</p>
                  <p className="text-2xl font-bold">{countdownText(next.minutesUntil)}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <div className="h-14 flex-1 rounded-2xl bg-white/10 text-primary text-base font-bold flex items-center justify-center">Reminder sent — please follow pharmacist instructions</div>
              </div>
            </div>
          </section>
        )}

        {lowRefills.length > 0 && (
          <section className="rounded-2xl border border-warning/40 bg-warning/15 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-warning-foreground" />
              <div>
                <p className="font-bold text-warning-foreground">Refill needed soon</p>
                {lowRefills.map(m => (
                  <p key={m.id} className="text-sm text-warning-foreground/90">{m.name} {m.strength} — refill due in {m.refillDays} {m.refillDays === 1 ? "day" : "days"}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-3 gap-3">
          <StatCard label="Adherence" value={`${s.pct}%`} icon={<Activity className="h-5 w-5" />} accent="success" />
          <StatCard label="Taken (14d)" value={s.taken} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
          <StatCard label="Missed" value={s.missed} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Today's Schedule</h2>
          <div className="space-y-3">
            {schedule.map((item, i) => {
              const past = item.minutesUntil < -30;
              return (
                <div key={i} className={`card-elevated flex items-center gap-4 rounded-2xl border bg-card p-4 ${past ? "opacity-60" : ""}`}>
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-health text-white"><Pill className="h-7 w-7" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold">{item.med.name} {item.med.strength}</p>
                    <p className="text-sm text-muted-foreground">{item.med.dosage}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Utensils className="h-3.5 w-3.5" /> {item.med.foodInstructions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold">{formatTime(item.time)}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{past ? "earlier" : countdownText(item.minutesUntil)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground"><History className="h-4 w-4" /> Recent History</h2>
          <div className="card-elevated divide-y rounded-2xl border bg-card">
            {recent.map(l => {
              const m = medById(l.medicationId);
              const d = new Date(l.scheduledTime);
              return (
                <div key={l.id} className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Pill className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m?.name} {m?.strength}</p>
                    <p className="text-xs text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} • {d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date(); d.setHours(h, m);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function countdownText(mins: number) {
  if (mins < -30) return "missed";
  if (mins < 0) return "due now";
  if (mins < 60) return `in ${mins}m`;
  const h = Math.floor(mins / 60); const m = mins % 60;
  return `in ${h}h ${m}m`;
}
