// @react-three/fiber 8 объявляет свои теги (mesh, group…) в глобальном JSX,
// а React 19 читает их из React.JSX — пробрасываем их туда.
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}
