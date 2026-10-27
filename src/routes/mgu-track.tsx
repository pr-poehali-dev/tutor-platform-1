import { createFileRoute } from "@tanstack/react-router";
import MGUTrack from "@/pages/MGUTrack";

export const Route = createFileRoute("/mgu-track")({
  component: MGUTrack,
});
