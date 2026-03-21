"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const newLocale = locale === "en" ? "zh" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={switchLocale}
      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-colors px-2 py-1 rounded border border-[var(--color-border)]"
      data-testid="locale-switcher"
    >
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}
