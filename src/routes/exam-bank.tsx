import { createFileRoute } from "@tanstack/react-router";
import ExamBank from "@/pages/ExamBank";

export const Route = createFileRoute("/exam-bank")({
  component: ExamBank,
});
