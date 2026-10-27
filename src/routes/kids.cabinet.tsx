import { createFileRoute } from "@tanstack/react-router";
import KidsCabinet from "@/pages/KidsCabinet";

export const Route = createFileRoute("/kids/cabinet")({
  ssr: false,
  component: KidsCabinet,
});
