import { createFileRoute } from "@tanstack/react-router";
import BotStudio from "@/pages/admin/BotStudio";

export const Route = createFileRoute("/admin/bot-studio")({
  ssr: false,
  component: BotStudio,
});
