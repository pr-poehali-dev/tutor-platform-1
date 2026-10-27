import { createFileRoute } from "@tanstack/react-router";
import SchoolInvite from "@/pages/SchoolInvite";

export const Route = createFileRoute("/school/invite/$token")({
  component: SchoolInvite,
});
