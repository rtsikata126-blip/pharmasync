import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, Pill, AlertTriangle, TrendingUp, ChevronRight, Pencil, Trash2, LogOut } from "lucide-react";
import { AppHeader } from "@/components/pharma-ui";
import { usePatients, store, adherenceStats } from "@/lib/pharma-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacist/")({
  head: () => ({ meta: [{ title: "Pharmacist Dashboard — PharmaSync" }] }),
  component: PharmacistDashboard,
});

function PharmacistDashboard() {
  const patients = usePatients();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", age: "", gender: "Male" as "Male" | "Female" | "Other", phone: "", ghanaHealthId: "" });
  const [editForm, setEditForm] = useState({ id: "", fullName: "", age: "", gender: "Male" as "Male" | "Female" | "Other", phone: "", ghanaHealthId: "" });

  const totalMeds = patients.reduce((s, p) => s + p.medications.length, 0);
  const lowRefills = patients.reduce((s, p) => s + p.medications.filter(m => m.refillDays <= 7).length, 0);
  const avgAdh = Math.round(patients.reduce((s, p) => s + adherenceStats(p).pct, 0) / Math.max(patients.length, 1));

  const submit = () => {
    if (!form.fullName || !form.age) return toast.error("Name and age are required");
    const id = store.addPatient({ fullName: form.fullName, age: Number(form.age), gender: form.gender, phone: form.phone, ghanaHealthId: form.ghanaHealthId });
    toast.success(`Patient created (${id})`);
    setOpen(false);
    setForm({ fullName: "", age: "", gender: "Male", phone: "", ghanaHealthId: "" });
  };

  const openEdit = (id: string) => {
    const p = patients.find(x => x.id === id);
    if (!p) return;
    setEditForm({ id: p.id, fullName: p.fullName, age: String(p.age), gender: p.gender, phone: p.phone, ghanaHealthId: p.ghanaHealthId });
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!editForm.fullName || !editForm.age) return toast.error("Name and age are required");
    store.updatePatient(editForm.id, {
      fullName: editForm.fullName,
      age: Number(editForm.age),
      gender: editForm.gender,
      phone: editForm.phone,
      ghanaHealthId: editForm.ghanaHealthId,
    });
    toast.success("Patient profile updated");
    setEditOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    store.deletePatient(deleteTarget);
    toast.success("Patient deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Pharmacist Portal" subtitle="Dr. A. Owusu • Greenfield Pharmacy" backTo="/" right={
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate({ to: "/" })} variant="ghost" size="sm" className="h-11 gap-2"><LogOut className="h-4 w-4" /> Home</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11 gap-2 rounded-xl px-4 font-semibold"><Plus className="h-5 w-5" /> <span className="hidden sm:inline">New Patient</span></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Create Patient Profile</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Akua Asante" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
                  <div><Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v: "Male" | "Female" | "Other") => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Phone Number</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." /></div>
                <div><Label>Ghana Health ID</Label><Input value={form.ghanaHealthId} onChange={e => setForm({ ...form, ghanaHealthId: e.target.value })} placeholder="GHA-XXXX-XXXXXX" /></div>
              </div>
              <DialogFooter><Button onClick={submit} className="w-full">Create Patient</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      } />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Patients" value={patients.length} icon={<Users className="h-5 w-5" />} tone="primary" />
          <StatTile label="Active Meds" value={totalMeds} icon={<Pill className="h-5 w-5" />} tone="success" />
          <StatTile label="Avg Adherence" value={`${avgAdh}%`} icon={<TrendingUp className="h-5 w-5" />} tone="success" />
          <StatTile label="Low Refills" value={lowRefills} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Patients</h2>
          <div className="grid gap-3">
            {patients.map(p => {
              const s = adherenceStats(p);
              const lowRefill = p.medications.find(m => m.refillDays <= 7);
              return (
                <div key={p.id} className="card-elevated group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5">
                  <Link to="/pharmacist/patient/$id" params={{ id: p.id }} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-brand text-lg font-bold text-white">{p.fullName.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold">{p.fullName}</p>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">{p.id}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{p.age} • {p.gender} • {p.medications.length} medications</p>
                      {lowRefill && <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-warning-foreground"><AlertTriangle className="h-3.5 w-3.5" /> Refill {lowRefill.name} in {lowRefill.refillDays}d</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-success">{s.pct}%</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">adherence</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1" />
                  </Link>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button onClick={() => openEdit(p.id)} variant="ghost" size="icon" className="h-9 w-9"><Pencil className="h-4 w-4" /></Button>
                    <Button onClick={() => setDeleteTarget(p.id)} variant="ghost" size="icon" className="h-9 w-9 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Edit Patient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Patient Profile</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name</Label><Input value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Age</Label><Input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} /></div>
              <div><Label>Gender</Label>
                <Select value={editForm.gender} onValueChange={(v: "Male" | "Female" | "Other") => setEditForm({ ...editForm, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Phone Number</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div><Label>Ghana Health ID</Label><Input value={editForm.ghanaHealthId} onChange={e => setEditForm({ ...editForm, ghanaHealthId: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={submitEdit} className="w-full">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Patient?</DialogTitle></DialogHeader>
          <DialogDescription>
            This will permanently delete this patient and all their medication records. This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="flex gap-2">
            <Button onClick={() => setDeleteTarget(null)} variant="outline" className="flex-1">Cancel</Button>
            <Button onClick={confirmDelete} variant="destructive" className="flex-1">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatTile({ label, value, icon, tone }: { label: string; value: string | number; icon: React.ReactNode; tone: "primary" | "success" | "warning" }) {
  const t = { primary: "text-primary bg-primary/10", success: "text-success bg-success/10", warning: "text-warning-foreground bg-warning/20" }[tone];
  return (
    <div className="card-elevated rounded-2xl border bg-card p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${t}`}>{icon}</div>
      <p className="mt-3 text-2xl font-extrabold sm:text-3xl">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
