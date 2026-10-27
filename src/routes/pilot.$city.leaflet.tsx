import { createFileRoute } from "@tanstack/react-router";
import SamaraLeaflet from "@/pages/SamaraLeaflet";

export const Route = createFileRoute("/pilot/$city/leaflet")({
  component: SamaraLeaflet,
});
