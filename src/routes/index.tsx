import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pill, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PharmaSync — Pharmacist Portal" },
      { name: "description", content: "PharmaSync helps pharmacists manage medication schedules with smart reminders and adherence tracking." },
    ],
  }),
  component: PharmacistLanding,
});

function PharmacistLanding() {
  const navigate = useNavigate();

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
            Pharmacist Portal
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Manage patients, medications, and adherence records — all in one place.
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
              <p className="text-2xl font-extrabold">Dashboard</p>
              <p className="mt-1 text-sm text-white/80">Manage patients, medications, and adherence</p>
            </div>
            <ArrowRight className="ml-auto h-6 w-6 shrink-0 text-white/60 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          PharmaSync — Smart Medication Adherence Platform
        </p>
      </main>
    </div>
  );
}
