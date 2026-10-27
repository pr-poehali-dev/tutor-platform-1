import { createFileRoute } from "@tanstack/react-router";
import KidsPilotActivation from "@/pages/KidsPilotActivation";

function KidsPilotActivationPage() {
  return <KidsPilotActivation mode="care" />;
}

export const Route = createFileRoute("/kazhdyj-rebenok")({
  component: KidsPilotActivationPage,
});
