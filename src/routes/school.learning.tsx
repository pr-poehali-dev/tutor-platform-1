import { createFileRoute } from "@tanstack/react-router";
import SchoolLearning from "@/pages/SchoolLearning";

export const Route = createFileRoute("/school/learning")({
  component: SchoolLearning,
});