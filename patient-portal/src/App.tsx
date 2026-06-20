import { useState } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [patientId, setPatientId] = useState<string | null>(null);

  if (patientId) {
    return <Dashboard patientId={patientId} onBack={() => setPatientId(null)} />;
  }

  return <Landing onAccess={(id) => setPatientId(id)} />;
}
