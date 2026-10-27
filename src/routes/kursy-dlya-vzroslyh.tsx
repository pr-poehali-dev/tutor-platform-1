import { createFileRoute } from "@tanstack/react-router";
import AdultCourses from "@/pages/AdultCourses";

export const Route = createFileRoute("/kursy-dlya-vzroslyh")({
  component: AdultCourses,
});
