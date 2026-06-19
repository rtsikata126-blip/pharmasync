import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, Stethoscope, User } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaSync — Smart Medication Adherence Platform" },
      { name: "description", content: "A professional pharmacy dashboard and patient medication reminder experience." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-md">
            <Pill className="h-10 w-10" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">PharmaSync</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">Smart Medication Adherence Platform</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A clean demo experience for pharmacists and patients with medication schedules, reminders, adherence tracking, and refill alerts.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-4 sm:max-w-xl sm:grid-cols-2">
          <Link
            to="/pharmacist"
            className="rounded-[2rem] border border-border bg-card px-6 py-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-semibold">Pharmacist Portal</p>
                <p className="mt-1 text-sm text-muted-foreground">Create patients, manage medications, and monitor adherence.</p>
              </div>
            </div>
          </Link>
          <Link
            to="/patient"
            className="rounded-[2rem] border border-border bg-card px-6 py-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-success"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-semibold">Patient Portal</p>
                <p className="mt-1 text-sm text-muted-foreground">Enter your Patient ID to open a personal medication dashboard.</p>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Example Patient ID: <span className="font-semibold">PMS-1001</span>
        </p>
      </main>
    </div>
  );
}
