import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { usePatient, store, adherenceStats } from "@/lib/pharma-store";
import {
  Pill,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  History,
  FileText,
  Heart,
  Info,
  BellRing,
  Clock,
  Download,
  ArrowLeft,
} from "lucide-react";
import { AppHeader } from "@/components/pharma-ui";

export const Route = createFileRoute("/patient/$id")({
  head: () => ({ meta: [{ title: "My Medications — PharmaSync" }] }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="text-center">
        <p className="text-xl font-bold text-foreground">Patient not found</p>
        <p className="mt-2 text-sm text-muted-foreground">The patient ID you entered does not match any record.</p>
        <Link to="/patient" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Link>
      </div>
    </div>
  ),
  loader: ({ params }) => {
    // Only throw notFound if the store has already loaded and the patient
    // truly doesn't exist. Otherwise, the component will handle the loading.
    if (store.isLoaded() && !store.get(params.id)) throw notFound();
    return null;
  },
  component: PatientDashboard,
});

type NotifStatus = "idle" | "granted" | "denied" | "loading";

function StatusBadge({ status }: { status: "taken" | "missed" | "late" | "pending" }) {
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

function PatientDashboard() {
  const { id } = Route.useParams();
  const patient = usePatient(id);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotifStatus>("idle");

  const isInstalled =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Request notification permission ONLY after PWA is installed
  useEffect(() => {
    if (!patient || !isInstalled) return;
    if (typeof Notification === "undefined") { setNotifStatus("denied"); return; }
    if (Notification.permission === "granted") {
      setNotifStatus("granted");
      schedulePatientReminders();
      return;
    }
    if (Notification.permission === "denied") { setNotifStatus("denied"); return; }
    setNotifStatus("loading");
    Notification.requestPermission().then((p) => {
      const granted = p === "granted";
      setNotifStatus(granted ? "granted" : "denied");
      if (granted) schedulePatientReminders();
    });
  }, [patient?.id, isInstalled]);

  function schedulePatientReminders() {
    if (!patient) return;
    for (const med of patient.medications) {
      for (const t of med.reminderTimes) {
        const [h, m] = t.split(":").map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);

        // Schedule 15-min warning
        const warnDelay = target.getTime() - Date.now() - 15 * 60 * 1000;
        if (warnDelay > 0) {
          setTimeout(() => {
            try {
              new Notification("Medication Reminder", {
                body: `${med.name} dose due in 15 minutes (${t})`,
              });
            } catch (e) {}
          }, warnDelay);
        }

        // Schedule main reminder
        const delay = Math.max(0, target.getTime() - Date.now());
        setTimeout(() => {
          try {
            const body = med.reminderTimes.length > 1
              ? `It's ${t} — Please take your ${med.name}`
              : `Time to take your ${h < 12 ? "morning" : h < 17 ? "afternoon" : "evening"} medication — ${med.name} ${med.dosage}`;
            new Notification(`${med.name} — Reminder`, { body });
          } catch (e) {}
        }, delay);
      }
    }
  }

  const handleInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((result: { outcome: string }) => {
      if (result.outcome === "accepted") setInstallPrompt(null);
    });
  };

  if (!patient) return null;

  const s = adherenceStats(patient);
  const recentLogs = [...patient.logs]
    .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime))
    .slice(0, 10);
  const medById = (mid: string) => patient.medications.find((m) => m.id === mid);
  const upcomingAppointments = patient.appointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title={`Hello, ${patient.fullName.split(" ")[0]} 👋`}
        subtitle={`Dashboard for ${patient.fullName}`}
        backTo="/patient"
      />

      {/* Install Banner */}
      {!isInstalled && installPrompt && !installDismissed && (
        <div className="mx-auto max-w-3xl px-4 pt-3 sm:px-6">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-brand text-white shadow-md">
                <Download className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-foreground">Install PharmaSync</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Install PharmaSync on your device for faster access and reminders.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleInstall} className="flex-1 h-12 rounded-xl bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary/90">Install</button>
              <button onClick={() => setInstallDismissed(true)} className="flex-1 h-12 rounded-xl border border-input bg-background text-base font-semibold text-foreground transition hover:bg-secondary">Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Status Banner */}
      {isInstalled && notifStatus === "granted" && (
        <div className="mx-auto max-w-3xl px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-3">
            <BellRing className="h-5 w-5 shrink-0 text-success" />
            <p className="text-xs font-medium text-success">Reminders active — you'll be notified at medication times</p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* Patient Info Card */}
        <section className="card-elevated relative overflow-hidden rounded-3xl border bg-card p-6">
          <div className="absolute inset-0 gradient-brand opacity-95" />
          <div className="relative text-white">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90">
              <Heart className="h-4 w-4" /> Patient Information
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="text-xs uppercase tracking-wider opacity-80">Full Name</p><p className="text-lg font-bold">{patient.fullName}</p></div>
              <div><p className="text-xs uppercase tracking-wider opacity-80">Patient ID</p><p className="text-lg font-bold">{patient.id}</p></div>
              <div><p className="text-xs uppercase tracking-wider opacity-80">Age</p><p className="text-lg font-bold">{patient.age} years</p></div>
              <div><p className="text-xs uppercase tracking-wider opacity-80">Sex</p><p className="text-lg font-bold">{patient.gender}</p></div>
              {patient.ghanaHealthId && <div><p className="text-xs uppercase tracking-wider opacity-80">Ghana Health ID</p><p className="text-lg font-bold">{patient.ghanaHealthId}</p></div>}
              {patient.phone && <div><p className="text-xs uppercase tracking-wider opacity-80">Phone</p><p className="text-lg font-bold">{patient.phone}</p></div>}
            </div>
          </div>
        </section>

        {/* Medical Conditions & Allergies */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Medical Conditions</h2>
            </div>
            {patient.medicalConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.medicalConditions.map((c, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">{c}</span>
                ))}
              </div>
            ) : <p className="text-sm italic text-muted-foreground">No medical conditions recorded</p>}
          </div>
          <div className="card-elevated rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Allergies</h2>
            </div>
            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive">{a}</span>
                ))}
              </div>
            ) : <p className="text-sm italic text-muted-foreground">No allergies recorded</p>}
          </div>
        </section>

        {/* Adherence Stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard label="Adherence" value={`${s.pct}%`} icon={<Activity className="h-5 w-5" />} accent="success" />
          <StatCard label="Taken (14d)" value={s.taken} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
          <StatCard label="Missed" value={s.missed} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" />
        </section>

        {/* Current Medications */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Pill className="h-4 w-4" /> Current Medications
          </h2>
          <div className="space-y-3">
            {patient.medications.map((med) => {
              const start = new Date(med.startDate);
              const end = new Date(med.endDate);
              const durationDays = Math.round((end.getTime() - start.getTime()) / 86400000);
              const refillDate = new Date();
              refillDate.setDate(refillDate.getDate() + med.refillDays);
              return (
                <div key={med.id} className="card-elevated rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-health text-white"><Pill className="h-6 w-6" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-lg font-bold text-foreground">{med.name}</p>
                        <p className="text-sm font-semibold text-muted-foreground">{med.strength}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dosage</p><p className="font-semibold text-foreground">{med.dosage}</p></div>
                        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Frequency</p><p className="font-semibold text-foreground">{med.frequency}</p></div>
                        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p><p className="font-semibold text-foreground">{durationDays} days</p></div>
                        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Food Instructions</p><p className="font-semibold text-foreground">{med.foodInstructions}</p></div>
                        <div><p className={`text-xs font-medium uppercase tracking-wide text-muted-foreground`}>Next Refill</p><p className={`font-semibold ${med.refillDays <= 7 ? "text-destructive" : "text-foreground"}`}>{med.refillDays} day{med.refillDays !== 1 ? "s" : ""} <span className="text-xs text-muted-foreground">({refillDate.toLocaleDateString()})</span></p></div>
                        <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schedule</p><p className="font-semibold text-foreground">{med.reminderTimes.join(", ")}</p></div>
                      </div>
                      {med.notes && (
                        <div className="mt-3 rounded-xl bg-secondary/50 px-3 py-2">
                          <div className="mb-1 flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-muted-foreground" /><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Special Instructions</p></div>
                          <p className="text-sm text-muted-foreground">{med.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {patient.medications.length === 0 && (
              <div className="card-elevated rounded-2xl border bg-card p-6 text-center"><p className="text-sm text-muted-foreground">No medications have been prescribed yet.</p></div>
            )}
          </div>
        </section>

        {/* Today's Schedule */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-4 w-4" /> Today's Medication Schedule
          </h2>
          <div className="card-elevated divide-y rounded-2xl border bg-card">
            {patient.medications.map((med) => (
              <div key={med.id} className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{med.name} {med.strength}</p><p className="text-xs text-muted-foreground">{med.dosage}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-foreground">{med.reminderTimes.join(", ")}</p><p className="text-xs text-muted-foreground">{med.frequency}</p></div>
              </div>
            ))}
            {patient.medications.length === 0 && <div className="p-6 text-center"><p className="text-sm text-muted-foreground">No medications scheduled.</p></div>}
          </div>
        </section>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-4 w-4" /> Upcoming Appointments
            </h2>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                const isWithinWeek = aptDate.getTime() - Date.now() < 7 * 86400000;
                return (
                  <div key={apt.id} className={`card-elevated rounded-2xl border bg-card p-4 ${isWithinWeek ? "border-primary/40" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isWithinWeek ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground"}`}><Calendar className="h-6 w-6" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground">{apt.type}</p>
                        <p className="text-sm text-muted-foreground">{apt.doctor} • {apt.location}</p>
                        {apt.notes && <p className="mt-1 text-xs text-muted-foreground">{apt.notes}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-extrabold text-foreground">{new Date(apt.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                        <p className="text-sm font-semibold text-muted-foreground">{apt.time}</p>
                        {isWithinWeek && <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">This week</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Medication History */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <History className="h-4 w-4" /> Medication History
          </h2>
          <div className="card-elevated divide-y rounded-2xl border bg-card">
            {recentLogs.length > 0 ? recentLogs.map((l) => {
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
            }) : <div className="p-6 text-center"><p className="text-sm text-muted-foreground">No medication history available.</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: "primary" | "success" | "warning" | "destructive" }) {
  const a = { primary: "from-primary/15 to-primary/0 text-primary", success: "from-success/15 to-success/0 text-success", warning: "from-warning/25 to-warning/0 text-warning-foreground", destructive: "from-destructive/15 to-destructive/0 text-destructive" }[accent];
  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl border bg-card p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${a} opacity-70 pointer-events-none`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-extrabold sm:text-3xl">{value}</p></div>
        {icon && <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/70 ${a.split(" ").pop()}`}>{icon}</div>}
      </div>
    </div>
  );
}
