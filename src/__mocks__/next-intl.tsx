import React from "react";
import { resolveTranslation, getNestedValue, typedMessages } from "./mock-utils";
import type { MessageValue } from "./mock-utils";

export function useTranslations(namespace?: string) {
  const t = function (key: string, params?: Record<string, MessageValue>): string {
    return resolveTranslation(namespace, key, params);
  };
  t.has = function (key: string): boolean {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = getNestedValue(typedMessages, fullKey);
    return value !== fullKey;
  };
  return t;
}

export function useLocale(): string {
  return "en";
}

export function NextIntlClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
