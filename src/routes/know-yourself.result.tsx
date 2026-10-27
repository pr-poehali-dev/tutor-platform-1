import { createFileRoute } from "@tanstack/react-router";
import KnowYourselfResult from "@/pages/KnowYourselfResult";

export const Route = createFileRoute("/know-yourself/result")({
  component: KnowYourselfResult,
});
