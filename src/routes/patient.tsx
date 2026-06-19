import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/pharma-ui";
import { usePatients } from "@/lib/pharma-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Patient Portal — PharmaSync" }] }),
  component: PatientPortal,
});

function PatientPortal() {
  const navigate = useNavigate();
  const patients = usePatients();
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      </main>
    </div>
  );
}
