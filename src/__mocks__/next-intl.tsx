import React from "react";
import messages from "../../messages/en.json";

type MessageValue = string | Record<string, unknown>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path;
}

export function useTranslations(namespace?: string) {
  const t = function (key: string, params?: Record<string, MessageValue>): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = getNestedValue(messages as unknown as Record<string, unknown>, fullKey);
    if (params && typeof value === "string") {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
  t.has = function (key: string): boolean {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = getNestedValue(messages as unknown as Record<string, unknown>, fullKey);
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
