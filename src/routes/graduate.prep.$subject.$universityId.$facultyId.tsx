import { createFileRoute } from "@tanstack/react-router";
import GraduatePrep from "@/pages/GraduatePrep";

export const Route = createFileRoute("/graduate/prep/$subject/$universityId/$facultyId")({
  component: GraduatePrep,
});
