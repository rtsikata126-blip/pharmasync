import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/pharmacist/login")({
  head: () => ({ meta: [{ title: "Pharmacist Login — PharmaSync" }] }),
  component: RedirectToLogin,
});

function RedirectToLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/login", replace: true, search: { role: "pharmacist" } });
  }, [navigate]);
  return null;
}
