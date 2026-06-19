import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const SELECTED_PATIENT_KEY = 'pharmasync:selectedPatient';

export function signOut() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SELECTED_PATIENT_KEY);
}

export function setRole(_role: 'pharmacist' | 'patient') {
  // no-op in prototype mode; role control is handled through route selection.
}

export function setSelectedPatient(patientId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SELECTED_PATIENT_KEY, patientId);
}

export function getSelectedPatient() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SELECTED_PATIENT_KEY);
}

export function useRequireAuth(role: 'pharmacist' | 'patient', patientId?: string) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (role === 'patient' && patientId) {
      setChecked(true);
      return;
    }
    if (role === 'patient') {
      const selected = getSelectedPatient();
      if (!selected) {
        navigate({ to: '/patient', replace: true });
        return;
      }
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
