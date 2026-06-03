
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
import { ZnaikaProvider } from "@/context/ZnaikaContext";
import LoginModal from "@/components/auth/LoginModal";
import YandexMetrika from "@/components/analytics/YandexMetrika";
import UtmTracker from "@/components/ads/UtmTracker";
import DobroTopBar from "@/components/promo/DobroTopBar";
import ErrorBoundary from "@/components/ErrorBoundary";

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
const VideoStudio = lazy(() => import("./pages/admin/VideoStudio"));
const AIEvolutionLab = lazy(() => import("./pages/admin/AIEvolutionLab"));
const CoursesContent = lazy(() => import("./pages/admin/CoursesContent"));
const MGUTrack = lazy(() => import("./pages/MGUTrack"));
const WritingCraft = lazy(() => import("./pages/WritingCraft"));
const DrawLanding = lazy(() => import("./pages/DrawLanding"));
const DrawLesson = lazy(() => import("./pages/DrawLesson"));
const MathProblems = lazy(() => import("./pages/MathProblems"));
const BiologyProblems = lazy(() => import("./pages/BiologyProblems"));
const ChemistryProblems = lazy(() => import("./pages/ChemistryProblems"));
const Graduate = lazy(() => import("./pages/Graduate"));
const GraduatePrep = lazy(() => import("./pages/GraduatePrep"));
const KnowYourself = lazy(() => import("./pages/KnowYourself"));
const KnowYourselfResult = lazy(() => import("./pages/KnowYourselfResult"));
const ExamChecklist = lazy(() => import("./pages/ExamChecklist"));
const Feed = lazy(() => import("./pages/Feed"));
const FeedArticle = lazy(() => import("./pages/FeedArticle"));
const FeedSubmit = lazy(() => import("./pages/FeedSubmit"));
const AdminFeed = lazy(() => import("./pages/admin/AdminFeed"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Help = lazy(() => import("./pages/Help"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Referral = lazy(() => import("./pages/Referral"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Status = lazy(() => import("./pages/Status"));
const PromoDobro = lazy(() => import("./pages/PromoDobro"));
const PromoVideo = lazy(() => import("./pages/PromoVideo"));
const KidsLanding = lazy(() => import("./pages/Kids"));
const KidsAge = lazy(() => import("./pages/KidsAge"));
const KidsDiagnostic = lazy(() => import("./pages/KidsDiagnostic"));
const KidsLibrary = lazy(() => import("./pages/KidsLibrary"));
const KidsLibraryItem = lazy(() => import("./pages/KidsLibraryItem"));
const KidsSongs = lazy(() => import("./pages/KidsSongs"));
const KidsPoznavashka = lazy(() => import("./pages/KidsPoznavashka"));
const KidsGames = lazy(() => import("./pages/KidsGames"));
const KidsGamePlay = lazy(() => import("./pages/KidsGamePlay"));
const ExamBank = lazy(() => import("./pages/ExamBank"));
const ScoreCalculator = lazy(() => import("./pages/ScoreCalculator"));
const Cabinet = lazy(() => import("./pages/Cabinet"));
const YandexCallback = lazy(() => import("./pages/YandexCallback"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Znaika = lazy(() => import("./pages/Znaika"));
const AdminHub = lazy(() => import("./pages/admin/AdminHub"));
const SalesDashboard = lazy(() => import("./pages/admin/SalesDashboard"));
const MarketingDashboard = lazy(() => import("./pages/admin/MarketingDashboard"));

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
            <DobroTopBar />
            <AuthProvider>
              <ZnaikaProvider>
              <AccessProvider>
                <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/legal/offer" element={<Offer />} />
                    <Route path="/legal/privacy" element={<Privacy />} />
                    <Route path="/legal/terms" element={<Terms />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/auth/yandex/callback" element={<YandexCallback />} />
                    <Route path="/courses/:subject" element={<SubjectLanding />} />
                    <Route path="/admin/yookassa-setup" element={<YookassaSetup />} />
                    <Route path="/admin/ads" element={<AdsManager />} />
                    <Route path="/admin/site-health" element={<SiteHealth />} />
                    <Route path="/admin/video-studio" element={<VideoStudio />} />
                    <Route path="/admin/ai-lab" element={<AIEvolutionLab />} />
                    <Route path="/admin/courses-content" element={<CoursesContent />} />
                    <Route path="/mgu-track" element={<MGUTrack />} />
                    <Route path="/writing-craft" element={<WritingCraft />} />
                    <Route path="/ads/:slug" element={<AdLanding />} />
                    <Route path="/math-problems" element={<MathProblems />} />
                    <Route path="/biology-problems" element={<BiologyProblems />} />
                    <Route path="/chemistry-problems" element={<ChemistryProblems />} />
                    <Route path="/draw" element={<DrawLanding />} />
                    <Route path="/draw/:id" element={<DrawLesson />} />
                    <Route path="/graduate" element={<Graduate />} />
                    <Route path="/graduate/prep/:subject/:universityId/:facultyId" element={<GraduatePrep />} />
                    <Route path="/know-yourself" element={<KnowYourself />} />
                    <Route path="/know-yourself/result" element={<KnowYourselfResult />} />
                    <Route path="/exam-checklist" element={<ExamChecklist />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/feed/submit" element={<FeedSubmit />} />
                    <Route path="/feed/:slug" element={<FeedArticle />} />
                    <Route path="/admin/feed" element={<AdminFeed />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/referral" element={<Referral />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/promo/dobro" element={<PromoDobro />} />
                    <Route path="/promo/video" element={<PromoVideo />} />
                    <Route path="/kids" element={<KidsLanding />} />
                    <Route path="/kids/test" element={<KidsDiagnostic />} />
                    <Route path="/kids/library" element={<KidsLibrary />} />
                    <Route path="/kids/library/:id" element={<KidsLibraryItem />} />
                    <Route path="/kids/songs" element={<KidsSongs />} />
                    <Route path="/kids/poznavashka" element={<KidsPoznavashka />} />
                    <Route path="/kids/games" element={<KidsGames />} />
                    <Route path="/kids/games/:slug" element={<KidsGamePlay />} />
                    <Route path="/kids/:age" element={<KidsAge />} />
                    <Route path="/exam-bank" element={<ExamBank />} />
                    <Route path="/score-calculator" element={<ScoreCalculator />} />
                    <Route path="/cabinet" element={<Cabinet />} />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                    <Route path="/checkout/:planId" element={<Checkout />} />
                    <Route path="/course-checkout/:courseId" element={<CourseCheckout />} />
                    <Route path="/znaika" element={<Znaika />} />
                    <Route path="/admin" element={<AdminHub />} />
                    <Route path="/admin/sales" element={<SalesDashboard />} />
                    <Route path="/admin/marketing" element={<MarketingDashboard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                </ErrorBoundary>
                <LoginModal />
              </AccessProvider>
              </ZnaikaProvider>
            </AuthProvider>
          </BrowserRouter>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;