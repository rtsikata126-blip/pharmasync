import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { store } from './pharma-store';

export type UserRole = 'pharmacist' | 'patient';
export interface Session {
  role: UserRole;
  patientId?: string;
}

const SESSION_KEY = 'pharmasync:session';
const DEFAULT_ADMIN_PASSWORD = 'pharmacist';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

function saveSession(session: Session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function loginPharmacist(password: string) {
  if (password !== ADMIN_PASSWORD) return false;
  saveSession({ role: 'pharmacist' });
  return true;
}

export function loginPatient(patientId: string, password: string) {
  const patient = store.get(patientId);
  if (!patient || patient.password !== password) return false;
  saveSession({ role: 'patient', patientId });
  return true;
}

export function login(options: { role: UserRole; patientId?: string; password: string }) {
  if (options.role === 'pharmacist') return loginPharmacist(options.password);
  if (!options.patientId) return false;
  return loginPatient(options.patientId, options.password);
}

export function useRequireAuth(role: UserRole, patientId?: string) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== role || (role === 'patient' && patientId && session.patientId !== patientId)) {
      signOut();
      const search = { role, ...(role === 'patient' && patientId ? { patientId } : {}) };
      navigate({ to: '/login', replace: true, search });
      return;
    }
    setChecked(true);
  }, [navigate, role, patientId]);

  return checked;
}

export function useRequirePharmacistAuth() {
  return useRequireAuth('pharmacist');
}

export function useRequirePatientAuth(patientId: string) {
  return useRequireAuth('patient', patientId);
}

export function useRedirectToDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    if (session.role === 'pharmacist') {
      navigate({ to: '/pharmacist', replace: true });
    } else if (session.role === 'patient' && session.patientId) {
      navigate({ to: `/patient/${session.patientId}`, replace: true });
    }
  }, [navigate]);
}
