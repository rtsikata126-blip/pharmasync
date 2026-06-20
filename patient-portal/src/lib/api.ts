/**
 * API client for the patient portal.
 * Fetches patient data from the shared backend API (same backend as pharmacist portal).
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface Medication {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  startDate: string;
  endDate: string;
  foodInstructions: string;
  notes: string;
  refillDays: number;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  status: "taken" | "missed" | "late" | "pending";
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
  gender: string;
  phone: string;
  ghanaHealthId: string;
  medicalConditions: string[];
  allergies: string[];
  medications: Medication[];
  appointments: Appointment[];
  logs: DoseLog[];
}

export async function fetchPatient(id: string): Promise<Patient | null> {
  try {
    const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch patient:", e);
    return null;
  }
}
