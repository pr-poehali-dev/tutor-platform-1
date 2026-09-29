import { useRefCapture } from "@/components/referrals/useRefCapture";

/** Невидимый компонент: ловит ?ref=КОД и применяет его после входа. */
export default function RefCapture() {
  useRefCapture();
  return null;
}
