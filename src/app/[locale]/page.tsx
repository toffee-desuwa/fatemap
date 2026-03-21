import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  params.then(({ locale }) => setRequestLocale(locale));

  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <h1 className="text-5xl font-bold text-[var(--color-foreground)]" data-testid="hero-title">
        {t("appName")}
      </h1>
    </div>
  );
}
