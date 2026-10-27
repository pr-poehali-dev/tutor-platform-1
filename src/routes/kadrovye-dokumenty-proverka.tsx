import { createFileRoute } from "@tanstack/react-router";
import HrComplianceLanding from "@/pages/HrComplianceLanding";

export const Route = createFileRoute("/kadrovye-dokumenty-proverka")({
  component: HrComplianceLanding,
});
