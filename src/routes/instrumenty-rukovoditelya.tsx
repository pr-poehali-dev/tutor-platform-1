import { createFileRoute } from "@tanstack/react-router";
import ManagerTools from "@/pages/ManagerTools";

export const Route = createFileRoute("/instrumenty-rukovoditelya")({
  component: ManagerTools,
});
