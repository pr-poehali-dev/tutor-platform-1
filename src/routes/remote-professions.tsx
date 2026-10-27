import { createFileRoute } from "@tanstack/react-router";
import RemoteProfessions from "@/pages/RemoteProfessions";

export const Route = createFileRoute("/remote-professions")({
  component: RemoteProfessions,
});
