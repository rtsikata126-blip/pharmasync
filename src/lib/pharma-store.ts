export type Frequency = "Once daily" | "Twice daily" | "Three times daily" | "Four times daily" | "As needed";
export type FoodInstruction = "Before meals" | "With meals" | "After meals" | "Empty stomach" | "No restriction";
export type DoseStatus = "taken" | "missed" | "late" | "pending";

export interface Medication {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  frequency: Frequency;
  reminderTimes: string[]; // ["08:00", "20:00"]
  startDate: string;
  endDate: string;
  foodInstructions: FoodInstruction;
  notes: string;
  refillDays: number; // days remaining
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO
  status: DoseStatus;
  takenAt?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  ghanaHealthId: string;
  medications: Medication[];
  logs: DoseLog[];
}

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

function generateLogs(meds: Medication[]): DoseLog[] {
  const logs: DoseLog[] = [];
  let i = 0;
  for (let day = 14; day >= 1; day--) {
    for (const m of meds) {
      for (const t of m.reminderTimes) {
        const d = daysAgo(day);
        const [h, mm] = t.split(":").map(Number);
        d.setHours(h, mm, 0, 0);
        const r = Math.random();
        const status: DoseStatus = r < 0.82 ? "taken" : r < 0.92 ? "late" : "missed";
        logs.push({
          id: `log-${i++}`,
          medicationId: m.id,
          scheduledTime: iso(d),
          status,
          takenAt: status !== "missed" ? iso(new Date(d.getTime() + (status === "late" ? 45 : 5) * 60000)) : undefined,
        });
      }
    }
  }
  return logs;
}

const kwameMeds: Medication[] = [
  {
    id: "med-1", name: "Amlodipine", strength: "10 mg", dosage: "1 Tablet",
    frequency: "Once daily", reminderTimes: ["08:00"],
    startDate: "2025-05-01", endDate: "2026-05-01",
    foodInstructions: "After meals", notes: "For blood pressure control. Monitor for ankle swelling.",
    refillDays: 6,
  },
  {
    id: "med-2", name: "Metformin", strength: "500 mg", dosage: "1 Tablet",
    frequency: "Twice daily", reminderTimes: ["08:00", "20:00"],
    startDate: "2025-03-15", endDate: "2026-03-15",
    foodInstructions: "With meals", notes: "For type 2 diabetes. Take with food to reduce nausea.",
    refillDays: 12,
  },
  {
    id: "med-3", name: "Atorvastatin", strength: "20 mg", dosage: "1 Tablet",
    frequency: "Once daily", reminderTimes: ["22:00"],
    startDate: "2025-04-10", endDate: "2026-04-10",
    foodInstructions: "No restriction", notes: "Cholesterol management. Avoid grapefruit juice.",
    refillDays: 3,
  },
];

const seedPatients: Patient[] = [
  {
    id: "PAT-001",
    fullName: "Kwame Mensah",
    age: 62,
    gender: "Male",
    phone: "+233 24 555 0142",
    ghanaHealthId: "GHA-2104-887632",
    medications: kwameMeds,
    logs: generateLogs(kwameMeds),
  },
  {
    id: "PAT-002",
    fullName: "Akosua Boateng",
    age: 54,
    gender: "Female",
    phone: "+233 20 778 9011",
    ghanaHealthId: "GHA-2104-554120",
    medications: [
      { id: "med-4", name: "Lisinopril", strength: "20 mg", dosage: "1 Tablet", frequency: "Once daily", reminderTimes: ["07:30"], startDate: "2025-06-01", endDate: "2026-06-01", foodInstructions: "No restriction", notes: "BP control.", refillDays: 9 },
      { id: "med-5", name: "Glibenclamide", strength: "5 mg", dosage: "1 Tablet", frequency: "Twice daily", reminderTimes: ["07:30", "19:30"], startDate: "2025-02-12", endDate: "2026-02-12", foodInstructions: "Before meals", notes: "Diabetes mgmt.", refillDays: 18 },
    ],
    logs: [],
  },
  {
    id: "PAT-003",
    fullName: "Yaw Owusu",
    age: 71,
    gender: "Male",
    phone: "+233 27 311 4509",
    ghanaHealthId: "GHA-2104-220198",
    medications: [
      { id: "med-6", name: "Warfarin", strength: "5 mg", dosage: "1 Tablet", frequency: "Once daily", reminderTimes: ["18:00"], startDate: "2025-01-20", endDate: "2026-01-20", foodInstructions: "With meals", notes: "Anticoagulant. Watch for bruising.", refillDays: 2 },
    ],
    logs: [],
  },
];
seedPatients[1].logs = generateLogs(seedPatients[1].medications);
seedPatients[2].logs = generateLogs(seedPatients[2].medications);

type Listener = () => void;
const listeners = new Set<Listener>();
let patients: Patient[] = seedPatients;

export const store = {
  getAll: () => patients,
  get: (id: string) => patients.find(p => p.id === id),
  subscribe: (fn: Listener) => { listeners.add(fn); return () => listeners.delete(fn); },
  emit: () => listeners.forEach(l => l()),
  addPatient(p: Omit<Patient, "id" | "medications" | "logs">) {
    const id = `PAT-${String(patients.length + 1).padStart(3, "0")}`;
    patients = [...patients, { ...p, id, medications: [], logs: [] }];
    store.emit();
    return id;
  },
  upsertMed(patientId: string, med: Medication) {
    patients = patients.map(p => {
      if (p.id !== patientId) return p;
      const exists = p.medications.some(m => m.id === med.id);
      return { ...p, medications: exists ? p.medications.map(m => m.id === med.id ? med : m) : [...p.medications, med] };
    });
    store.emit();
  },
  removeMed(patientId: string, medId: string) {
    patients = patients.map(p => p.id === patientId ? { ...p, medications: p.medications.filter(m => m.id !== medId) } : p);
    store.emit();
  },
  logDose(patientId: string, medId: string, status: DoseStatus) {
    patients = patients.map(p => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        logs: [...p.logs, {
          id: `log-${Date.now()}`, medicationId: medId,
          scheduledTime: new Date().toISOString(), status,
          takenAt: status === "taken" ? new Date().toISOString() : undefined,
        }],
      };
    });
    store.emit();
  },
};

import { useSyncExternalStore } from "react";
export function usePatients() {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getAll(),
    () => store.getAll(),
  );
}
export function usePatient(id: string) {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.get(id),
    () => store.get(id),
  );
}

export function adherenceStats(p: Patient) {
  const total = p.logs.length;
  const taken = p.logs.filter(l => l.status === "taken").length;
  const late = p.logs.filter(l => l.status === "late").length;
  const missed = p.logs.filter(l => l.status === "missed").length;
  const pct = total ? Math.round(((taken + late * 0.7) / total) * 100) : 0;
  return { total, taken, late, missed, pct, totalMeds: p.medications.length };
}

export function todaysSchedule(p: Patient) {
  const items: { med: Medication; time: string; minutesUntil: number }[] = [];
  const now = new Date();
  for (const m of p.medications) {
    for (const t of m.reminderTimes) {
      const [h, mm] = t.split(":").map(Number);
      const d = new Date(); d.setHours(h, mm, 0, 0);
      items.push({ med: m, time: t, minutesUntil: Math.round((d.getTime() - now.getTime()) / 60000) });
    }
  }
  return items.sort((a, b) => a.time.localeCompare(b.time));
}
