import { createFileRoute } from "@tanstack/react-router";
import BizLab from "@/pages/BizLab";

export const Route = createFileRoute("/bizlab")({
  component: BizLab,
});
