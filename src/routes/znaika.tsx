import { createFileRoute } from "@tanstack/react-router";
import Znaika from "@/pages/Znaika";

export const Route = createFileRoute("/znaika")({
  component: Znaika,
});
