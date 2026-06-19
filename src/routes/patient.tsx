import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppHeader } from "@/components/pharma-ui";
import { usePatients } from "@/lib/pharma-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Download, X } from "lucide-react";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Patient Portal — PharmaSync" }] }),
  component: PatientPortal,
});

function PatientPortal() {
  const navigate = useNavigate();
  const patients = usePatients();
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  // Capture the install prompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((result: { outcome: string }) => {
      if (result.outcome === "accepted") {
        setInstallPrompt(null);
      }
    });
  };

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patients, patientId],
  );

  const openPatient = (id: string) => {
    const patient = patients.find((patient) => patient.id === id);
    if (!patient) {
      setError("Patient ID not found. Try PMS-1001.");
      return;
    }
    setError(null);
    navigate({ to: `/patient/${id}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Patient Portal" subtitle="Enter your Patient ID or open a demo patient" backTo="/" />

      {/* Install prompt banner */}
      {installPrompt && !dismissed && (
        <div className="mx-auto max-w-xl px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">Install PharmaSync</p>
              <p className="text-xs text-muted-foreground">Add to your home screen for the best experience</p>
            </div>
            <Button onClick={handleInstall} size="sm" className="h-9 shrink-0 rounded-xl px-4 font-semibold">
              Install
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <Label className="text-base font-semibold">Enter Patient ID</Label>
              <Input
                value={patientId}
                onChange={(event) => setPatientId(event.target.value.toUpperCase())}
                placeholder="PMS-1001"
                className="mt-2 h-12 text-lg"
              />
            </div>
            {selectedPatient ? (
              <div className="rounded-3xl border border-border bg-secondary/10 p-4 text-sm text-muted-foreground">
                <p className="font-semibold">{selectedPatient.fullName}</p>
                <p>{selectedPatient.age} years • {selectedPatient.gender}</p>
                <p className="mt-1">Patient ID: {selectedPatient.id}</p>
              </div>
            ) : null}

            {error ? <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

            <Button onClick={() => openPatient(patientId)} className="w-full h-14 text-lg font-bold rounded-2xl">
              Open Patient Dashboard
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Demo Patient</p>
              <Button onClick={() => openPatient("PMS-1001")} variant="secondary" className="w-full h-14 text-lg font-semibold rounded-2xl">
                <User className="mr-3 h-6 w-6" /> Open Demo Patient
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Download className="mr-1 inline h-3.5 w-3.5" />
          You can install this app on your phone for offline access and medication reminders.
        </p>
      </main>
    </div>
  );
}
