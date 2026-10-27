import { createFileRoute } from "@tanstack/react-router";
import KidsReading from "@/pages/KidsReading";

export const Route = createFileRoute("/kids/reading")({
  component: KidsReading,
});
