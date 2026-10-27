import { createFileRoute } from "@tanstack/react-router";
import Cabinet from "@/pages/Cabinet";

export const Route = createFileRoute("/cabinet")({
  ssr: false,
  component: Cabinet,
});
