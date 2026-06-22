import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Pill, Download, X, Loader2 } from "lucide-react";
import { store, useStoreLoaded } from "@/lib/pharma-store";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "Patient Portal — PharmaSync" }] }),
  component: PatientPortalLanding,
});

function PatientPortalLanding() {
  const navigate = useNavigate();
  const loaded = useStoreLoaded();
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(() => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((result: { outcome: string }) => {
        if (result.outcome === "accepted") {
          setInstallPrompt(null);
          setIsInstalled(true);
        }
      });
      return;
    }
    setShowIOSInstructions(true);
  }, [installPrompt]);

  const handleAccess = () => {
    const id = patientId.trim().toUpperCase();
    if (!id) {
      setError("Please enter your Patient ID.");
      return;
    }
    if (!loaded) {
      setError("Patient records are still loading. Please wait a moment and try again.");
      return;
    }
    const patient = store.get(id);
    if (!patient) {
      setError("Patient ID not found. Please check and try again.");
      return;
    }
    setError(null);
    navigate({ to: "/patient/$id", params: { id } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Install Banner */}
      {!isInstalled && !installDismissed && (
        <div className="mx-auto max-w-xl px-4 pt-4 sm:px-6">
          <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 shadow-lg">
            <button
              onClick={() => setInstallDismissed(true)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-background/60 text-muted-foreground hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-brand text-white shadow-md">
                <Download className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-foreground">Install PharmaSync</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Install PharmaSync on your home screen for quicker access, medication reminders, and a better experience.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Install Now
              </button>
              <button
                onClick={() => setInstallDismissed(true)}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Installation Instructions */}
      {showIOSInstructions && (
        <div className="mx-auto max-w-xl px-4 pt-3 sm:px-6">
          <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground">Add to Home Screen</h3>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Tap the <strong>Share</strong> button <span className="text-lg">⎙</span> in Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top-right corner</li>
                </ol>
              </div>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Landing Content */}
      <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[2.5rem] gradient-brand text-white shadow-lg shadow-primary/25">
            <Pill className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Welcome to PharmaSync
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">
            Manage your medications safely and never miss a dose.
          </p>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            Enter your Patient ID to access your medication dashboard.
          </p>
        </div>

        <div className="mt-8 w-full sm:max-w-sm">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Patient ID</label>
                <input
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAccess();
                  }}
                  placeholder="PMS-1001"
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-lg font-semibold text-foreground outline-none ring-ring transition focus:ring-2"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleAccess}
                disabled={!patientId.trim()}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Access Dashboard
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Download className="mr-1 inline h-3.5 w-3.5" />
          You can install this app on your device for offline access and medication reminders.
        </p>
      </main>
    </div>
  );
}
