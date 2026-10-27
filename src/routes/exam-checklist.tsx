import { createFileRoute } from "@tanstack/react-router";
import ExamChecklist from "@/pages/ExamChecklist";

export const Route = createFileRoute("/exam-checklist")({
  component: ExamChecklist,
});
