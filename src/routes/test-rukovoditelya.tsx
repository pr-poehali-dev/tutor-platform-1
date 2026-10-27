import { createFileRoute } from "@tanstack/react-router";
import LeaderTest from "@/pages/LeaderTest";

export const Route = createFileRoute("/test-rukovoditelya")({
  component: LeaderTest,
});
