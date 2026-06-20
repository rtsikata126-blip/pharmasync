import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Patient Portal — PharmaSync" }] }),
  component: PatientLayout,
});

function PatientLayout() {
  return <Outlet />;
}
