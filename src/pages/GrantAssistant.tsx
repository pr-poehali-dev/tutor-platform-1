import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import {
  generateGrant,
  fetchGrant,
  fetchGrantPrice,
  syncGrantPayment,
  type GrantApplication,
} from "@/components/grants/api";
import GrantResult from "@/components/grants/GrantResult";
import GrantHeader from "@/components/grants/page/GrantHeader";
import GrantHero from "@/components/grants/page/GrantHero";
import GrantForm, { LOADING_STEPS } from "@/components/grants/page/GrantForm";
import GrantBenefits from "@/components/grants/page/GrantBenefits";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function GrantAssistant() {
  const { isAuthenticated, openLogin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [grantName, setGrantName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [organization, setOrganization] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [region, setRegion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [extra, setExtra] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<GrantApplication | null>(null);
  const [priceRub, setPriceRub] = useState<number | null>(null);
  const [openingApp, setOpeningApp] = useState(false);
  const stepTimer = useRef<number | null>(null);

  // Цена полного пакета — показываем ДО генерации, чтобы не терять доверие
  useEffect(() => {
    fetchGrantPrice().then((r) => {
      if (r.ok && r.data) setPriceRub(Math.round(r.data.price_kopecks / 100));
    });
  }, []);

  useEffect(() => {
    if (loading) {
      setStep(0);
      stepTimer.current = window.setInterval(() => {
        setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
      }, 2500);
    } else if (stepTimer.current) {
      clearInterval(stepTimer.current);
    }
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [loading]);

  // Возврат после оплаты — подтверждаем и открываем полный пакет
  useEffect(() => {
    if (searchParams.get("paid") === "1" && isAuthenticated) {
      const appId = Number(searchParams.get("app"));
      syncGrantPayment().then(async () => {
        if (appId) {
          const res = await fetchGrant(appId);
          if (res.ok && res.data) {
            setApp(res.data);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
        searchParams.delete("paid");
        searchParams.delete("app");
        setSearchParams(searchParams, { replace: true });
      });
    }
  }, [searchParams, isAuthenticated, setSearchParams]);

  // Открытие существующей заявки по ссылке /grants?app=ID (из «Моих заявок»)
  useEffect(() => {
    const appId = Number(searchParams.get("app"));
    if (searchParams.get("paid") === "1") return; // обработано выше
    if (appId && isAuthenticated && !app) {
      setOpeningApp(true);
      setError(null);
      fetchGrant(appId).then((res) => {
        setOpeningApp(false);
        if (res.ok && res.data) {
          setApp(res.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setError(res.error || "Заявка не найдена. Возможно, она была удалена.");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated]);

  const submit = async () => {
    if (loading) return;
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (grantName.trim().length < 2) return setError("Укажите название гранта или конкурса");
    if (projectIdea.trim().length < 20) return setError("Опишите проект подробнее — хотя бы пару предложений");
    setError(null);
    setLoading(true);
    setApp(null);
    const res = await generateGrant({
      grant_name: grantName.trim(),
      project_idea: projectIdea.trim(),
      organization: organization.trim() || undefined,
      grant_amount: grantAmount.trim() || undefined,
      region: region.trim() || undefined,
      deadline: deadline.trim() || undefined,
      extra: extra.trim() || undefined,
    });
    setLoading(false);
    if (!res.ok || !res.data) return setError(res.error || "Не удалось подготовить заявку");
    setApp(res.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setApp(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="ИИ-помощник по грантам · Подготовьте заявку на грант за минуты — УЧИСЬПРО"
        description="Опишите грант и проект — ИИ-эксперт подготовит профессиональную заявку: актуальность, цели, смета, календарный план и проверка по критериям. Услуга дешевле рынка."
        canonical={`${SITE_URL}/grants`}
      />

      <GrantHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {openingApp ? (
          <div className="py-24 text-center">
            <Icon name="Loader2" size={30} className="text-violet-300 animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">Открываю заявку…</p>
          </div>
        ) : app ? (
          <GrantResult app={app} onRestart={restart} />
        ) : (
          <>
            <GrantHero priceRub={priceRub} />
            <GrantForm
              loading={loading}
              step={step}
              grantName={grantName}
              setGrantName={setGrantName}
              projectIdea={projectIdea}
              setProjectIdea={setProjectIdea}
              organization={organization}
              setOrganization={setOrganization}
              grantAmount={grantAmount}
              setGrantAmount={setGrantAmount}
              region={region}
              setRegion={setRegion}
              deadline={deadline}
              setDeadline={setDeadline}
              extra={extra}
              setExtra={setExtra}
              showMore={showMore}
              setShowMore={setShowMore}
              error={error}
              priceRub={priceRub}
              submit={submit}
            />
            <GrantBenefits />
          </>
        )}
      </main>
    </div>
  );
}
