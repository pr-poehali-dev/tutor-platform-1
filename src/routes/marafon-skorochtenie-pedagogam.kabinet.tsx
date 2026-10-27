import { createFileRoute } from "@tanstack/react-router";
import ReadingMarathon from "@/pages/ReadingMarathon";

function ReadingMarathonPage() {
  return <ReadingMarathon track="teacher" cabinet />;
}

export const Route = createFileRoute("/marafon-skorochtenie-pedagogam/kabinet")({
  component: ReadingMarathonPage,
});
