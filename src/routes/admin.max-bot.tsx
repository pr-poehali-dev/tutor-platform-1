import { createFileRoute } from "@tanstack/react-router";
import MaxBotAdmin from "@/pages/admin/MaxBotAdmin";

export const Route = createFileRoute("/admin/max-bot")({
  ssr: false,
  component: MaxBotAdmin,
});
