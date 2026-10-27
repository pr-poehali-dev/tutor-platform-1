import { createFileRoute } from "@tanstack/react-router";
import GrantAssistant from "@/pages/GrantAssistant";

export const Route = createFileRoute("/grants/")({
  component: GrantAssistant,
});
