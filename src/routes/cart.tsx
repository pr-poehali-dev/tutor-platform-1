import { createFileRoute } from "@tanstack/react-router";
import CartPage from "@/pages/CartPage";

export const Route = createFileRoute("/cart")({
  ssr: false,
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Корзина курсов — УЧИСЬПРО" },
      { name: "description", content: "Корзина курсов: 2 курса со скидкой 50%, 3 и больше — 60% от общей стоимости." },
      { name: "robots", content: "noindex" },
    ],
  }),
});
