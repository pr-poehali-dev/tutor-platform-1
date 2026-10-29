import { createFileRoute, notFound } from "@tanstack/react-router";
import FeedArticle from "@/pages/FeedArticle";
import { articleHead, fetchSeoArticle } from "@/components/feed/seo";

export const Route = createFileRoute("/feed/$slug")({
  loader: async ({ params }) => {
    // Мессенджеры дописывают к ссылке точку или скобку — такие адреса страница исправит сама.
    const clean = params.slug.trim().replace(/[\s.,;:!?)\]}»"'…]+$/u, "");
    const seo = await fetchSeoArticle(clean);
    if (seo === "missing" && clean === params.slug) throw notFound();
    return { seo: seo === "missing" ? null : seo };
  },
  head: ({ loaderData, params }) => articleHead(loaderData?.seo, params.slug),
  component: FeedArticle,
});
