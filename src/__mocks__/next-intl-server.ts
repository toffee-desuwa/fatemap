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

export function getMessages() {
  return messages;
}

export function getTranslations({ namespace }: { locale?: string; namespace?: string } = {}) {
  return (key: string, params?: Record<string, MessageValue>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = getNestedValue(messages as unknown as Record<string, unknown>, fullKey);
    if (params && typeof value === "string") {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(`{${k}}`, String(v));
      });
    }
    return value;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setRequestLocale(_locale: string) {
  // no-op in tests
}

export function getRequestConfig() {
  return { locale: "en", messages };
}
