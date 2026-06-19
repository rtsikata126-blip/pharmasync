import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/pharma-ui";
import { usePatients } from "@/lib/pharma-store";
import { login, UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — PharmaSync" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const patients = usePatients();
  const [role, setRole] = useState<UserRole>("pharmacist");
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const searchRole = params.get("role");
    const searchPatientId = params.get("patientId") || "";
    if (searchRole === "patient" || searchRole === "pharmacist") {
      setRole(searchRole);
    }
    setPatientId(searchPatientId);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized && role !== "patient") return;
    if (role === "patient" && !patientId && patients.length > 0) {
      setPatientId(patients[0].id);
    }
  }, [initialized, role, patientId, patients]);

  const selectedPatient = useMemo(() => patients.find((p) => p.id === patientId) ?? patients[0], [patients, patientId]);

  const submit = async () => {
    if (role === "patient") {
      const id = patientId || selectedPatient?.id;
      if (!id) {
        toast.error("Choose a patient account to sign in.");
        return;
      }
      const ok = login({ role: "patient", patientId: id, password });
      if (!ok) {
        toast.error("Invalid patient credentials");
        return;
      }
      navigate({ to: `/patient/${id}`, replace: true });
      toast.success("Welcome back");
      return;
    }

    const ok = login({ role: "pharmacist", password });
    if (!ok) {
      toast.error("Invalid pharmacist password");
      return;
    }
    navigate({ to: "/pharmacist", replace: true });
    toast.success("Welcome back, pharmacist");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Sign in" subtitle="Secure access for pharmacy staff and patients" backTo="/" />
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-3xl border bg-card p-8 shadow-lg">
          <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold">Single sign-on for PharmaSync</p>
              <p className="text-sm text-muted-foreground">Choose your role and sign in with the right credentials.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("pharmacist")}
                className={`rounded-2xl border p-4 text-left transition ${role === "pharmacist" ? "border-primary bg-primary/10" : "border-border bg-background/90 hover:border-foreground"}`}
              >
                <p className="font-semibold">Pharmacist</p>
                <p className="text-sm text-muted-foreground">Manage patient regimens and reminders.</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`rounded-2xl border p-4 text-left transition ${role === "patient" ? "border-success bg-success/10" : "border-border bg-background/90 hover:border-foreground"}`}
              >
                <p className="font-semibold">Patient</p>
                <p className="text-sm text-muted-foreground">View your medication schedule and history.</p>
              </button>
            </div>

            {role === "patient" && (
              <div className="space-y-4 rounded-3xl border border-input bg-background/80 p-4">
                <div>
                  <Label>Patient account</Label>
                  <select
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
                  >
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName} ({patient.id})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedPatient && (
                  <div className="rounded-2xl border border-border bg-secondary/10 p-3 text-sm text-muted-foreground">
                    Signing in as <strong>{selectedPatient.fullName}</strong>.
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={role === "pharmacist" ? "Pharmacist password" : "Patient account password"}
              />
            </div>

            <Button onClick={submit} className="w-full">
              Sign in as {role === "pharmacist" ? "Pharmacist" : "Patient"}
            </Button>

            <p className="text-xs text-muted-foreground">
              {role === "pharmacist"
                ? "Use the pharmacy password to access pharmacist-only patient management."
                : "Use your patient password to view your medications and reminders."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
