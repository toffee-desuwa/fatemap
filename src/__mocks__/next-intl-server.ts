import messages from "../../messages/en.json";
import { resolveTranslation } from "./mock-utils";
import type { MessageValue } from "./mock-utils";

export function getMessages() {
  return messages;
}

export function getTranslations({ namespace }: { locale?: string; namespace?: string } = {}) {
  return (key: string, params?: Record<string, MessageValue>) => {
    return resolveTranslation(namespace, key, params);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setRequestLocale(_locale: string) {
  // no-op in tests
}

export function getRequestConfig() {
  return { locale: "en", messages };
}
