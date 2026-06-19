import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader, StatCard } from "@/components/pharma-ui";
import { usePatient, store, adherenceStats, type Medication, type Frequency, type FoodInstruction } from "@/lib/pharma-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Pencil, Trash2, Clock, Utensils, Calendar, Activity, CheckCircle2, XCircle, AlertCircle, Phone, IdCard, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacist/patient/$id")({
  head: () => ({ meta: [{ title: "Patient — PharmaSync" }] }),
  component: PharmacistPatient,
  notFoundComponent: () => <div className="grid min-h-screen place-items-center">Patient not found</div>,
  loader: ({ params }) => { if (!store.get(params.id)) throw notFound(); return null; },
});

const FREQS: Frequency[] = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed"];
const FOODS: FoodInstruction[] = ["Before meals", "With meals", "After meals", "Empty stomach", "No restriction"];

function PharmacistPatient() {
  const { id } = Route.useParams();
  const patient = usePatient(id);
  const [editing, setEditing] = useState<Medication | null>(null);

  if (!patient) return null;
  const s = adherenceStats(patient);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={patient.fullName} subtitle={`${patient.id} • ${patient.age}y • ${patient.gender}`} backTo="/pharmacist" right={
        <SharePatientButton patient={patient} />
      } />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <section className="card-elevated rounded-2xl border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={patient.phone || "—"} />
            <InfoRow icon={<IdCard className="h-4 w-4" />} label="Ghana Health ID" value={patient.ghanaHealthId || "—"} />
            <InfoRow icon={<Activity className="h-4 w-4" />} label="Status" value="Active patient" />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Total Meds" value={s.totalMeds} icon={<Pill className="h-5 w-5" />} accent="primary" />
          <StatCard label="Taken" value={s.taken} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
          <StatCard label="Missed" value={s.missed} icon={<XCircle className="h-5 w-5" />} accent="destructive" />
          <StatCard label="Adherence" value={`${s.pct}%`} icon={<Activity className="h-5 w-5" />} accent="success" />
          <StatCard label="Refill ≤7d" value={patient.medications.filter(m => m.refillDays <= 7).length} icon={<AlertCircle className="h-5 w-5" />} accent="warning" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Medication Regimen</h2>
            <Button onClick={() => setEditing(blankMed())} size="lg" className="h-11 gap-2 rounded-xl"><Plus className="h-5 w-5" /> Add Medication</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {patient.medications.map(m => (
              <article key={m.id} className="card-elevated rounded-2xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-brand text-white"><Pill className="h-6 w-6" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-extrabold">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.strength} • {m.dosage}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => setEditing(m)} variant="ghost" size="icon" className="h-9 w-9"><Pencil className="h-4 w-4" /></Button>
                    <Button onClick={() => { store.removeMed(patient.id, m.id); toast.success("Medication removed"); }} variant="ghost" size="icon" className="h-9 w-9 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Field icon={<Clock className="h-4 w-4" />} label="Frequency" value={m.frequency} />
                  <Field icon={<Clock className="h-4 w-4" />} label="Times" value={m.reminderTimes.join(", ")} />
                  <Field icon={<Utensils className="h-4 w-4" />} label="Food" value={m.foodInstructions} />
                  <Field icon={<Calendar className="h-4 w-4" />} label="End date" value={m.endDate} />
                </dl>
                {m.notes && <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs text-secondary-foreground">📝 {m.notes}</p>}
                <div className={`mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${m.refillDays <= 7 ? "bg-warning/20 text-warning-foreground" : "bg-success/10 text-success"}`}>
                  <span>Refill status</span>
                  <span>{m.refillDays <= 7 ? `⚠ Due in ${m.refillDays} days` : `${m.refillDays} days remaining`}</span>
                </div>
              </article>
            ))}
            {patient.medications.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center md:col-span-2">
                <Pill className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 font-semibold">No medications yet</p>
                <p className="text-sm text-muted-foreground">Add the first medication to build this patient's regimen.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <MedDialog patientId={patient.id} med={editing} onClose={() => setEditing(null)} />

      {/* Share dialog component is rendered by SharePatientButton */}
    </div>
  );
}

function blankMed(): Medication {
  return { id: `med-${Date.now()}`, name: "", strength: "", dosage: "1 Tablet", frequency: "Once daily", reminderTimes: ["08:00"], startDate: new Date().toISOString().slice(0,10), endDate: new Date(Date.now()+1000*60*60*24*180).toISOString().slice(0,10), foodInstructions: "No restriction", notes: "", refillDays: 30 };
}

function MedDialog({ patientId, med, onClose }: { patientId: string; med: Medication | null; onClose: () => void }) {
  const [f, setF] = useState<Medication>(med ?? blankMed());
  useEffect(() => { if (med) setF(med); }, [med]);
  if (!med) return null;
  const save = () => {
    if (!f.name || !f.strength) return toast.error("Name and strength required");
    store.upsertMed(patientId, f);
    toast.success("Saved");
    onClose();
  };
  const updateTime = (i: number, v: string) => setF({ ...f, reminderTimes: f.reminderTimes.map((t, idx) => idx === i ? v : t) });
  return (
    <Dialog open={!!med} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{med.name ? "Edit Medication" : "Add Medication"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Medication Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Amlodipine" /></div>
            <div><Label>Strength</Label><Input value={f.strength} onChange={e => setF({ ...f, strength: e.target.value })} placeholder="10 mg" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dosage</Label><Input value={f.dosage} onChange={e => setF({ ...f, dosage: e.target.value })} placeholder="1 Tablet" /></div>
            <div><Label>Frequency</Label>
              <Select value={f.frequency} onValueChange={(v: Frequency) => setF({ ...f, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Reminder Times</Label>
            <div className="space-y-2">
              {f.reminderTimes.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input type="time" value={t} onChange={e => updateTime(i, e.target.value)} />
                  {f.reminderTimes.length > 1 && <Button variant="ghost" size="icon" onClick={() => setF({ ...f, reminderTimes: f.reminderTimes.filter((_, idx) => idx !== i) })}><X className="h-4 w-4" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setF({ ...f, reminderTimes: [...f.reminderTimes, "12:00"] })}><Plus className="mr-1 h-4 w-4" /> Add time</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start Date</Label><Input type="date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} /></div>
            <div><Label>End Date</Label><Input type="date" value={f.endDate} onChange={e => setF({ ...f, endDate: e.target.value })} /></div>
          </div>
          <div><Label>Food Instructions</Label>
            <Select value={f.foodInstructions} onValueChange={(v: FoodInstruction) => setF({ ...f, foodInstructions: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FOODS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Refill (days remaining)</Label><Input type="number" value={f.refillDays} onChange={e => setF({ ...f, refillDays: Number(e.target.value) })} /></div>
          <div><Label>Additional Notes</Label><Textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="Special instructions or warnings" /></div>
        </div>
        <DialogFooter><Button onClick={save} className="w-full" size="lg">Save Medication</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function SharePatientButton({ patient }: { patient: { id: string; fullName: string } }) {
  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/patient/${patient.id}` : `/patient/${patient.id}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="h-11 gap-2 rounded-xl"><IdCard className="h-5 w-5" /><span className="hidden sm:inline">Share</span></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Link</DialogTitle>
          <DialogDescription>Share this read-only link with the patient (pharmacist-managed access).</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center gap-3">
          <input readOnly value={shareLink} className="w-full rounded-md border px-3 py-2 text-sm font-mono text-muted-foreground" />
          <Button onClick={() => { navigator.clipboard?.writeText(shareLink); toast.success("Link copied"); }} size="sm">Copy</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Patient ID: <span className="font-mono">{patient.id}</span></p>
      </DialogContent>
    </Dialog>
  );
}
