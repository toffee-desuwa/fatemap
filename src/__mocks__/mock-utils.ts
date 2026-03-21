import messages from "../../messages/en.json";

export type MessageValue = string | Record<string, unknown>;

const typedMessages: Record<string, unknown> = messages;

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path;
}

export function resolveTranslation(
  namespace: string | undefined,
  key: string,
  params?: Record<string, MessageValue>
): string {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  let value = getNestedValue(typedMessages, fullKey);
  if (params && typeof value === "string") {
    Object.entries(params).forEach(([k, v]) => {
      value = (value as string).replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export { typedMessages };
