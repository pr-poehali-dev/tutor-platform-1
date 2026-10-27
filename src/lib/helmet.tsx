// Единая точка Helmet для страниц проекта.
// React 19 сам поднимает <title>, <meta>, <link> и <script async> в <head>
// (и на сервере тоже), поэтому Helmet — просто обёртка, провайдер не нужен.
import type { ReactNode } from "react";

export function Helmet({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function HelmetProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
