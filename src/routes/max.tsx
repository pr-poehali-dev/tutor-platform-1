import { createFileRoute } from "@tanstack/react-router";
import MaxApp from "@/pages/MaxApp";

export const Route = createFileRoute("/max")({
  component: MaxApp,
});
