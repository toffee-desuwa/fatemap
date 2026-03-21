import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingContent />;
}

function LandingContent() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <h1 className="text-5xl font-bold text-[var(--color-foreground)]" data-testid="hero-title">
        {t("appName")}
      </h1>
    </div>
  );
}
