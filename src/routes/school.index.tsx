import { createFileRoute } from "@tanstack/react-router";
import SchoolCabinet from "@/pages/SchoolCabinet";

export const Route = createFileRoute("/school/")({
  ssr: false,
  component: SchoolCabinet,
});
