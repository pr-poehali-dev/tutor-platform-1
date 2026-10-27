import { createFileRoute } from "@tanstack/react-router";
import Referral from "@/pages/Referral";

export const Route = createFileRoute("/referral")({
  component: Referral,
});
