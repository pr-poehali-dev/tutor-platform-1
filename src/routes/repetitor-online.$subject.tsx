import { createFileRoute } from "@tanstack/react-router";
import SubjectTutor from "@/pages/SubjectTutor";

export const Route = createFileRoute("/repetitor-online/$subject")({
  component: SubjectTutor,
});
