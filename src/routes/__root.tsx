import {Suspense, useEffect, useState, type ReactNode} from "react";
import {HeadContent, Outlet, Scripts, createRootRoute} from "@tanstack/react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {PLATFORM_META, PLATFORM_SCRIPTS} from "@/platform/scripts.gen";
import {HMR_CLIENT} from "@/platform/dev-hmr";
import appCss from "@/index.css?url";
import {lazyWithRetry as lazy} from "@/lib/lazyWithRetry";
import {SITE_JSON_LD} from "@/lib/siteJsonLd";
import {registerServiceWorker} from "@/lib/pwa";
import {setupChunkReload} from "@/lib/chunkReload";
import {setupCopyAttribution} from "@/lib/copyProtection";
import NotFound from "@/pages/PageNotFound";
import {UserDataProvider} from "@/context/UserDataContext";
import {AuthProvider} from "@/context/AuthContext";
import {AccessProvider} from "@/context/AccessContext";
import {CartProvider} from "@/context/CartContext";
import CartFloatingButton from "@/components/cart/CartFloatingButton";
import {ZnaikaProvider} from "@/context/ZnaikaContext";
import LoginModal from "@/components/auth/LoginModal";
import YandexMetrika from "@/components/analytics/YandexMetrika";
import VisitTracker from "@/components/analytics/VisitTracker";
import UtmTracker from "@/components/ads/UtmTracker";
import RefCapture from "@/components/referrals/RefCapture";
import DobroTopBar from "@/components/promo/DobroTopBar";
import KidsPromoTopBar from "@/components/promo/KidsPromoTopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import InstallBanner from "@/components/pwa/InstallBanner";
import GlobalNavButton from "@/components/nav/GlobalNavButton";
import DirectionStrip from "@/components/nav/DirectionStrip";

const PilotPendingJoin = lazy(() => import("@/components/pilot/PilotPendingJoin"));
const SupportWidget = lazy(() => import("@/components/support/SupportWidget"));

const OG_IMAGE =
    "https://cdn.poehali.dev/projects/***/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg";

// Защита от зеркал на чужих доменах и от кликджекинга (раньше — inline-скрипт в index.html).
const DOMAIN_GUARD = `(function () {
  try {
    var OWN = ["xn--h1amcedk2a6b.xn--p1ai", "www.xn--h1amcedk2a6b.xn--p1ai", "учисьпро.рф", "localhost", "127.0.0.1"];
    var isOwn = function (h) { return OWN.indexOf(h) >= 0 || /(^|\\.)poehali\\.dev$/.test(h) || /(^|\\.)poehali\\.app$/.test(h); };
    var host = location.hostname;
    if (!isOwn(host)) { location.replace("https://xn--h1amcedk2a6b.xn--p1ai" + location.pathname + location.search); return; }
    if (window.top !== window.self) {
      var parent = "";
      if (location.ancestorOrigins && location.ancestorOrigins.length) parent = location.ancestorOrigins[location.ancestorOrigins.length - 1];
      else if (document.referrer) parent = document.referrer;
      var ph = ""; try { ph = new URL(parent).hostname; } catch (e) {}
      if (ph && !isOwn(ph) && !/(^|\\.)yandex\\.(ru|com)$|(^|\\.)webvisor\\.com$|(^|\\.)metrika\\.yandex\\.ru$/.test(ph)) {
        window.top.location = location.href;
      }
    }
  } catch (e) {}
})();`;

const METRIKA = `(function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(101026698, "init", { trustedDomains: ["poehali.dev"], clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true, trackHash: true });
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109375884', 'ym');
ym(109375884, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});`;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {charSet: "utf-8"},
            {name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=5"},
            {httpEquiv: "Content-Language", content: "ru"},
            {name: "theme-color", content: "#0a0a14"},
            {name: "msapplication-TileImage", content: "/icon-192.png"},
            {name: "msapplication-TileColor", content: "#120c35"},
            {name: "format-detection", content: "telephone=no"},
            {httpEquiv: "Cache-Control", content: "no-cache, no-store, must-revalidate"},
            {httpEquiv: "Pragma", content: "no-cache"},
            {httpEquiv: "Expires", content: "0"},
            {
                httpEquiv: "Content-Security-Policy",
                content: "object-src 'none'; base-uri 'self'; form-action 'self' https:; upgrade-insecure-requests",
            },
            {name: "referrer", content: "strict-origin-when-cross-origin"},
            // title, description, keywords, og:* и twitter:* задаёт компонент <Seo>
            // на каждой странице (раньше Helmet заменял ими теги index.html).
            // Здесь — только то, чего <Seo> не ставит, иначе теги задвоятся.
            {name: "author", content: "УЧИСЬПРО"},
            {name: "mobile-web-app-capable", content: "yes"},
            {name: "apple-mobile-web-app-capable", content: "yes"},
            {name: "apple-mobile-web-app-status-bar-style", content: "black-translucent"},
            {name: "apple-mobile-web-app-title", content: "УЧИСЬПРО"},
            {property: "og:image:type", content: "image/jpeg"},
            {property: "vk:image", content: OG_IMAGE},
            ...PLATFORM_META,
        ],
        links: [
            {rel: "stylesheet", href: appCss},
            {rel: "preconnect", href: "https://fonts.googleapis.com"},
            {rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous"},
            {rel: "preconnect", href: "https://cdn.poehali.dev", crossOrigin: "anonymous"},
            {rel: "dns-prefetch", href: "https://cdn.poehali.dev"},
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap",
            },
            {rel: "icon", href: "/favicon.ico", sizes: "48x48"},
            {rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png"},
            {rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png"},
            {rel: "manifest", href: "/manifest.webmanifest"},
            {rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png"},
        ],
        // IMPORTANT: DO NOT REMOVE PLATFORM SCRIPTS AND THE DEV HMR CLIENT!
        scripts: [
            ...(import.meta.env.DEV ? [{children: HMR_CLIENT}] : []),
            ...PLATFORM_SCRIPTS,
            {children: DOMAIN_GUARD},
            {type: "application/ld+json", children: JSON.stringify(SITE_JSON_LD)},
            {children: METRIKA},
        ],
    }),
    component: RootComponent,
    notFoundComponent: NotFound,
});

const PageSkeleton = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"/>
    </div>
);

function RootComponent() {
    const [queryClient] = useState(() => new QueryClient());

    useEffect(() => {
        setupChunkReload();
        setupCopyAttribution();
        registerServiceWorker();
    }, []);

    return (
        <RootDocument>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <UserDataProvider>
                            <Toaster/>
                            <Sonner/>
                            <YandexMetrika/>
                            <VisitTracker/>
                            <UtmTracker/>
                            <DobroTopBar/>
                            <KidsPromoTopBar/>
                            <DirectionStrip/>
                            <AuthProvider>
                                {/* RefCapture обязан быть ВНУТРИ AuthProvider: он ждёт входа через useAuth(). */}
                                <RefCapture/>
                                <ZnaikaProvider>
                                    <AccessProvider>
                                      <CartProvider>
                                        <ErrorBoundary>
                                            <Suspense fallback={<PageSkeleton/>}>
                                                <Outlet/>
                                            </Suspense>
                                        </ErrorBoundary>
                                        <GlobalNavButton/>
                                        <Suspense fallback={null}><SupportWidget/></Suspense>
                                        <Suspense fallback={null}><PilotPendingJoin/></Suspense>
                                        <InstallBanner/>
                                        <LoginModal/>
                                        <CartFloatingButton/>
                                      </CartProvider>
                                    </AccessProvider>
                                </ZnaikaProvider>
                            </AuthProvider>
                        </UserDataProvider>
                    </TooltipProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        </RootDocument>
    );
}

function RootDocument({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <HeadContent/>
        </head>
        <body>
        <div id="root">{children}</div>
        <Scripts/>
        </body>
        </html>
    );
}