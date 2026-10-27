import { createFileRoute } from "@tanstack/react-router";
import SamaraLeaflet from "@/pages/SamaraLeaflet";

export const Route = createFileRoute("/samara/leaflet")({
  component: SamaraLeaflet,
});
