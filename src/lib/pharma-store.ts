export type Frequency =
  | "Once daily"
  | "Twice daily"
  | "Three times daily"
  | "Four times daily"
  | "As needed";
export type FoodInstruction =
  | "Before meals"
  | "With meals"
  | "After meals"
  | "Empty stomach"
  | "No restriction";
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

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  doctor: string;
  location: string;
  notes: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  ghanaHealthId: string;
  medicalConditions: string[];
  allergies: string[];
  medications: Medication[];
  appointments: Appointment[];
  logs: DoseLog[];
}

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};

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
          takenAt:
            status !== "missed"
              ? iso(new Date(d.getTime() + (status === "late" ? 45 : 5) * 60000))
              : undefined,
        });
      }
    }
  }
  return logs;
}

const kwameMeds: Medication[] = [
  {
    id: "med-1",
    name: "Amlodipine",
    strength: "10 mg",
    dosage: "1 Tablet",
    frequency: "Once daily",
    reminderTimes: ["08:00"],
    startDate: "2025-05-01",
    endDate: "2026-05-01",
    foodInstructions: "After meals",
    notes: "For blood pressure control. Monitor for ankle swelling.",
    refillDays: 6,
  },
  {
    id: "med-2",
    name: "Metformin",
    strength: "500 mg",
    dosage: "1 Tablet",
    frequency: "Twice daily",
    reminderTimes: ["08:00", "20:00"],
    startDate: "2025-03-15",
    endDate: "2026-03-15",
    foodInstructions: "With meals",
    notes: "For type 2 diabetes. Take with food to reduce nausea.",
    refillDays: 12,
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    strength: "20 mg",
    dosage: "1 Tablet",
    frequency: "Once daily",
    reminderTimes: ["22:00"],
    startDate: "2025-04-10",
    endDate: "2026-04-10",
    foodInstructions: "No restriction",
    notes: "Cholesterol management. Avoid grapefruit juice.",
    refillDays: 3,
  },
];

const kwameAppointments: Appointment[] = [
  {
    id: "apt-1",
    date: "2026-06-25",
    time: "10:00",
    type: "Follow-up",
    doctor: "Dr. Asante",
    location: "Korle Bu Polyclinic",
    notes: "Blood pressure check",
  },
  {
    id: "apt-2",
    date: "2026-07-15",
    time: "14:30",
    type: "Lab Work",
    doctor: "Dr. Asante",
    location: "Korle Bu Polyclinic",
    notes: "HbA1c and lipid panel",
  },
];

const seedPatients: Patient[] = [
  {
    id: "PMS-1001",
    fullName: "Kwame Mensah",
    age: 62,
    gender: "Male",
    phone: "+233 24 555 0142",
    ghanaHealthId: "GHA-2104-887632",
    medicalConditions: ["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"],
    allergies: ["Penicillin", "Sulfa drugs"],
    medications: kwameMeds,
    appointments: kwameAppointments,
    logs: generateLogs(kwameMeds),
  },
  {
    id: "PMS-1002",
    fullName: "Akosua Boateng",
    age: 54,
    gender: "Female",
    phone: "+233 20 778 9011",
    ghanaHealthId: "GHA-2104-554120",
    medicalConditions: ["Hypertension", "Type 2 Diabetes"],
    allergies: ["Aspirin"],
    medications: [
      {
        id: "med-4",
        name: "Lisinopril",
        strength: "20 mg",
        dosage: "1 Tablet",
        frequency: "Once daily",
        reminderTimes: ["07:30"],
        startDate: "2025-06-01",
        endDate: "2026-06-01",
        foodInstructions: "No restriction",
        notes: "BP control.",
        refillDays: 9,
      },
      {
        id: "med-5",
        name: "Glibenclamide",
        strength: "5 mg",
        dosage: "1 Tablet",
        frequency: "Twice daily",
        reminderTimes: ["07:30", "19:30"],
        startDate: "2025-02-12",
        endDate: "2026-02-12",
        foodInstructions: "Before meals",
        notes: "Diabetes mgmt.",
        refillDays: 18,
      },
    ],
    appointments: [
      {
        id: "apt-3",
        date: "2026-07-01",
        time: "09:00",
        type: "Check-up",
        doctor: "Dr. Mensah",
        location: "Ridge Hospital",
        notes: "Routine diabetes review",
      },
    ],
    logs: [],
  },
  {
    id: "PMS-1003",
    fullName: "Yaw Owusu",
    age: 71,
    gender: "Male",
    phone: "+233 27 311 4509",
    ghanaHealthId: "GHA-2104-220198",
    medicalConditions: ["Atrial Fibrillation", "Osteoarthritis"],
    allergies: ["Codeine", "Ibuprofen"],
    medications: [
      {
        id: "med-6",
        name: "Warfarin",
        strength: "5 mg",
        dosage: "1 Tablet",
        frequency: "Once daily",
        reminderTimes: ["18:00"],
        startDate: "2025-01-20",
        endDate: "2026-01-20",
        foodInstructions: "With meals",
        notes: "Anticoagulant. Watch for bruising.",
        refillDays: 2,
      },
    ],
    appointments: [
      {
        id: "apt-4",
        date: "2026-06-28",
        time: "11:00",
        type: "INR Test",
        doctor: "Dr. Opoku",
        location: "Komfo Anokye Hospital",
        notes: "Warfarin monitoring",
      },
      {
        id: "apt-5",
        date: "2026-08-10",
        time: "10:30",
        type: "Cardiology",
        doctor: "Dr. Opoku",
        location: "Komfo Anokye Hospital",
        notes: "Heart rhythm review",
      },
    ],
    logs: [],
  },
];
seedPatients[1].logs = generateLogs(seedPatients[1].medications);
seedPatients[2].logs = generateLogs(seedPatients[2].medications);

type Listener = () => void;
const listeners = new Set<Listener>();
let patients: Patient[] = seedPatients;

/** Sync a single patient record to the shared API */
async function syncPatientToApi(patient: Patient) {
  try {
    await fetch("/api/patients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patient),
    });
  } catch (e) {
    // API may not be available in dev — silently continue
  }
}

/** Sync all patients to the shared API */
async function syncAllToApi() {
  for (const p of patients) {
    await syncPatientToApi(p);
  }
}

/** Normalize a patient object, filling in missing fields with safe defaults */
function normalizePatient(p: Partial<Patient>): Patient {
  return {
    id: p.id ?? "",
    fullName: p.fullName ?? "",
    age: p.age ?? 0,
    gender: p.gender ?? "Other",
    phone: p.phone ?? "",
    ghanaHealthId: p.ghanaHealthId ?? "",
    medicalConditions: Array.isArray(p.medicalConditions) ? p.medicalConditions : [],
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    medications: Array.isArray(p.medications) ? p.medications : [],
    appointments: Array.isArray(p.appointments) ? p.appointments : [],
    logs: Array.isArray(p.logs) ? p.logs : [],
  };
}

/** Load all patients from the shared API, replacing the in-memory store */
async function loadPatientsFromApi() {
  try {
    const res = await fetch("/api/patients");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Normalize each patient to ensure all required fields exist
        patients = data.map(normalizePatient);
        store.emit();
      }
    }
  } catch (e) {
    // API may not be available — keep seed data
  }
}

/** Seed initial data to the API, then load any existing patients */
if (typeof window !== "undefined") {
  // Load patient data immediately so patients created by the pharmacist
  // are available as soon as the patient portal loads (no waiting for sync delay)
  loadPatientsFromApi();

  // Delay seeding to let the app hydrate first
  setTimeout(async () => {
    // Sync all seed patients to the API (upsert by ID, so no duplicates)
    await syncAllToApi();
    // Reload to pick up any patients created by other sessions
    await loadPatientsFromApi();
  }, 1000);
}

export const store = {
  getAll: () => patients,
  get: (id: string) => patients.find((p) => p.id === id),
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit: () => listeners.forEach((l) => l()),
  addPatient(
    p: Omit<
      Patient,
      "id" | "medications" | "logs" | "appointments" | "medicalConditions" | "allergies"
    >,
  ) {
    const id = `PMS-${1000 + patients.length + 1}`;
    const newPatient = {
      ...p,
      id,
      medications: [],
      appointments: [],
      medicalConditions: [],
      allergies: [],
      logs: [],
    } as Patient;
    patients = [...patients, newPatient];
    store.emit();
    syncPatientToApi(newPatient);
    return id;
  },
  upsertMed(patientId: string, med: Medication) {
    let updatedPatient: Patient | undefined;
    patients = patients.map((p) => {
      if (p.id !== patientId) return p;
      const exists = p.medications.some((m) => m.id === med.id);
      updatedPatient = {
        ...p,
        medications: exists
          ? p.medications.map((m) => (m.id === med.id ? med : m))
          : [...p.medications, med],
      };
      return updatedPatient;
    });
    store.emit();
    if (updatedPatient) syncPatientToApi(updatedPatient);
    try {
      import("./notifications")
        .then(({ scheduleMedReminders, requestPermission }) => {
          requestPermission().then((granted) => {
            if (!granted) return;
            scheduleMedReminders(
              patientId,
              med,
              () => store.logDose(patientId, med.id, "taken"),
              () => store.logDose(patientId, med.id, "missed"),
            );
          });
        })
        .catch(() => {});
    } catch (e) {}
  },
  updatePatient(id: string, data: Partial<Omit<Patient, "id" | "medications" | "logs">>) {
    let updatedPatient: Patient | undefined;
    patients = patients.map((p) => {
      if (p.id !== id) return p;
      updatedPatient = { ...p, ...data } as Patient;
      return updatedPatient;
    });
    store.emit();
    if (updatedPatient) syncPatientToApi(updatedPatient);
  },
  deletePatient(id: string) {
    patients = patients.filter((p) => p.id !== id);
    store.emit();
    try {
      fetch(`/api/patients/${id}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {}
  },
  removeMed(patientId: string, medId: string) {
    let updatedPatient: Patient | undefined;
    patients = patients.map((p) => {
      if (p.id !== patientId) return p;
      updatedPatient = { ...p, medications: p.medications.filter((m) => m.id !== medId) };
      return updatedPatient;
    });
    store.emit();
    if (updatedPatient) syncPatientToApi(updatedPatient);
    try {
      import("./notifications")
        .then(({ cancelMedReminders }) => {
          cancelMedReminders(patientId, medId);
        })
        .catch(() => {});
    } catch (e) {}
  },
  logDose(patientId: string, medId: string, status: DoseStatus) {
    let updatedPatient: Patient | undefined;
    patients = patients.map((p) => {
      if (p.id !== patientId) return p;
      updatedPatient = {
        ...p,
        logs: [
          ...p.logs,
          {
            id: `log-${Date.now()}`,
            medicationId: medId,
            scheduledTime: new Date().toISOString(),
            status,
            takenAt: status === "taken" ? new Date().toISOString() : undefined,
          },
        ],
      };
      return updatedPatient;
    });
    store.emit();
    if (updatedPatient) syncPatientToApi(updatedPatient);
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
  const taken = p.logs.filter((l) => l.status === "taken").length;
  const late = p.logs.filter((l) => l.status === "late").length;
  const missed = p.logs.filter((l) => l.status === "missed").length;
  const pct = total ? Math.round(((taken + late * 0.7) / total) * 100) : 0;
  return { total, taken, late, missed, pct, totalMeds: p.medications.length };
}

export function todaysSchedule(p: Patient) {
  const items: { med: Medication; time: string; minutesUntil: number }[] = [];
  const now = new Date();
  for (const m of p.medications) {
    for (const t of m.reminderTimes) {
      const [h, mm] = t.split(":").map(Number);
      const d = new Date();
      d.setHours(h, mm, 0, 0);
      items.push({
        med: m,
        time: t,
        minutesUntil: Math.round((d.getTime() - now.getTime()) / 60000),
      });
    }
  }
  return items.sort((a, b) => a.time.localeCompare(b.time));
}
