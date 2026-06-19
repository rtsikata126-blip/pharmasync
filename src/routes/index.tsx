import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, Stethoscope, User } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaSync — Smart Medication Adherence Platform" },
      { name: "description", content: "PharmaSync helps pharmacists and patients manage medication schedules with smart reminders and adherence tracking." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-10">
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[2.5rem] gradient-brand text-white shadow-lg shadow-primary/25">
            <Pill className="h-12 w-12" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            PharmaSync
          </h1>
          <p className="mt-3 text-xl font-semibold text-muted-foreground sm:text-2xl">
            Smart Medication Adherence Platform
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            A demonstration platform for pharmacists and patients to manage medication schedules, track adherence, and receive smart reminders.
          </p>
        </div>

        <div className="mt-12 flex w-full flex-col gap-5 sm:max-w-md">
          <Link
            to="/pharmacist"
            className="group flex items-center gap-5 rounded-[2rem] gradient-brand px-8 py-6 text-left text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/30"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-white">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-extrabold">Pharmacist Portal</p>
              <p className="mt-1 text-sm text-white/80">Manage patients, medications, and adherence</p>
            </div>
          </Link>
          <Link
            to="/patient"
            className="group flex items-center gap-5 rounded-[2rem] border-2 border-success bg-card px-8 py-6 text-left shadow-lg transition-all hover:scale-[1.02] hover:border-success/70 hover:shadow-success/10"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-success/10 text-success">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">Patient Portal</p>
              <p className="mt-1 text-sm text-muted-foreground">View your medications and reminders</p>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Demo Patient ID: <span className="font-semibold text-foreground">PMS-1001</span>
        </p>
      </main>
    </div>
  );
}
