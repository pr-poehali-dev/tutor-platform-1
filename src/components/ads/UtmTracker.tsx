import { useUtmTracking } from "@/components/ads/useUtmTracking";

/** Невидимый компонент, который один раз ловит UTM-метки и шлёт их в Метрику. */
export default function UtmTracker() {
  useUtmTracking();
  return null;
}
