import { createFileRoute } from "@tanstack/react-router";
import EdTechJobs from "@/pages/EdTechJobs";

export const Route = createFileRoute("/edtech-jobs")({
  component: EdTechJobs,
});
