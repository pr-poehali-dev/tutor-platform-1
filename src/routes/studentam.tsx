import { createFileRoute } from "@tanstack/react-router";
import ForStudents from "@/pages/ForStudents";

export const Route = createFileRoute("/studentam")({
  component: ForStudents,
});
