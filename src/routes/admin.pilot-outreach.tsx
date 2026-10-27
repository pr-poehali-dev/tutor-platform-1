import { createFileRoute } from "@tanstack/react-router";
import PilotOutreach from "@/pages/admin/PilotOutreach";

export const Route = createFileRoute("/admin/pilot-outreach")({
  ssr: false,
  component: PilotOutreach,
});
