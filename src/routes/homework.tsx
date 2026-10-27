import { createFileRoute } from "@tanstack/react-router";
import Homework from "@/pages/Homework";

export const Route = createFileRoute("/homework")({
  component: Homework,
});
