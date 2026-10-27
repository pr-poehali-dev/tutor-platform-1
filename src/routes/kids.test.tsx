import { createFileRoute } from "@tanstack/react-router";
import KidsDiagnostic from "@/pages/KidsDiagnostic";

export const Route = createFileRoute("/kids/test")({
  component: KidsDiagnostic,
});
