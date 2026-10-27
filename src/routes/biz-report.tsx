import { createFileRoute } from "@tanstack/react-router";
import BizReport from "@/pages/BizReport";

export const Route = createFileRoute("/biz-report")({
  component: BizReport,
});
