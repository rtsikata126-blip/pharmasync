// Auth is fully removed for the demo prototype.
// All routes are publicly accessible.

export function signOut() {
  // no-op: no auth to sign out from
}

export function setRole(_role: 'pharmacist' | 'patient') {
  // no-op
}

export function setSelectedPatient(_patientId: string) {
  // no-op
}

export function useRequireAuth(_role: 'pharmacist' | 'patient', _patientId?: string) {
  // Always authorized in demo mode
  return true;
}

export function useRequirePharmacistAuth() {
  return true;
}

export function useRequirePatientAuth(_patientId: string) {
  return true;
}
