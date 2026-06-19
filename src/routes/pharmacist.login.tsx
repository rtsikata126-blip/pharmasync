import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/pharmacist/login")({
  head: () => ({ meta: [{ title: "PharmaSync — Pharmacist Portal" }] }),
  component: RedirectToHome,
});

function RedirectToHome() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", replace: true });
  }, [navigate]);
  return null;
}
