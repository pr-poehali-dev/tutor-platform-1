
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserDataProvider } from "@/context/UserDataContext";
import { AuthProvider } from "@/context/AuthContext";
import { AccessProvider } from "@/context/AccessContext";
import LoginModal from "@/components/auth/LoginModal";
import YandexMetrika from "@/components/analytics/YandexMetrika";
import UtmTracker from "@/components/ads/UtmTracker";

const Offer = lazy(() => import("./pages/legal/Offer"));
const CourseCheckout = lazy(() => import("./pages/CourseCheckout"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Courses = lazy(() => import("./pages/Courses"));
const SubjectLanding = lazy(() => import("./pages/SubjectLanding"));
const YookassaSetup = lazy(() => import("./pages/admin/YookassaSetup"));
const AdsManager = lazy(() => import("./pages/admin/AdsManager"));
const AdLanding = lazy(() => import("./pages/ads/AdLanding"));
const SiteHealth = lazy(() => import("./pages/admin/SiteHealth"));
const MathProblems = lazy(() => import("./pages/MathProblems"));
const BiologyProblems = lazy(() => import("./pages/BiologyProblems"));
const ChemistryProblems = lazy(() => import("./pages/ChemistryProblems"));
const KidsLanding = lazy(() => import("./pages/Kids"));
const KidsAge = lazy(() => import("./pages/KidsAge"));
const KidsDiagnostic = lazy(() => import("./pages/KidsDiagnostic"));
const KidsLibrary = lazy(() => import("./pages/KidsLibrary"));
const KidsLibraryItem = lazy(() => import("./pages/KidsLibraryItem"));
const ExamBank = lazy(() => import("./pages/ExamBank"));
const ScoreCalculator = lazy(() => import("./pages/ScoreCalculator"));
const Cabinet = lazy(() => import("./pages/Cabinet"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));

const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <YandexMetrika />
            <UtmTracker />
            <AuthProvider>
              <AccessProvider>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/legal/offer" element={<Offer />} />
                    <Route path="/legal/privacy" element={<Privacy />} />
                    <Route path="/legal/terms" element={<Terms />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:subject" element={<SubjectLanding />} />
                    <Route path="/admin/yookassa-setup" element={<YookassaSetup />} />
                    <Route path="/admin/ads" element={<AdsManager />} />
                    <Route path="/admin/site-health" element={<SiteHealth />} />
                    <Route path="/ads/:slug" element={<AdLanding />} />
                    <Route path="/math-problems" element={<MathProblems />} />
                    <Route path="/biology-problems" element={<BiologyProblems />} />
                    <Route path="/chemistry-problems" element={<ChemistryProblems />} />
                    <Route path="/kids" element={<KidsLanding />} />
                    <Route path="/kids/test" element={<KidsDiagnostic />} />
                    <Route path="/kids/library" element={<KidsLibrary />} />
                    <Route path="/kids/library/:id" element={<KidsLibraryItem />} />
                    <Route path="/kids/:age" element={<KidsAge />} />
                    <Route path="/exam-bank" element={<ExamBank />} />
                    <Route path="/score-calculator" element={<ScoreCalculator />} />
                    <Route path="/cabinet" element={<Cabinet />} />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                    <Route path="/checkout/:planId" element={<Checkout />} />
                    <Route path="/course-checkout/:courseId" element={<CourseCheckout />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <LoginModal />
              </AccessProvider>
            </AuthProvider>
          </BrowserRouter>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;