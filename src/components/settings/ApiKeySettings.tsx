'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LLM_PROVIDERS, getProvider } from '@/lib/llm-providers';

const LS_PROVIDER = 'fatemap-llm-provider';
const LS_APIKEY = 'fatemap-llm-apikey';

type Status = 'idle' | 'saved' | 'testing' | 'test-success' | 'test-failed' | 'cleared';

export function ApiKeySettings() {
  const t = useTranslations('settings');
  const [providerId, setProviderId] = useState(LLM_PROVIDERS[0].id);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_PROVIDER);
    const savedKey = localStorage.getItem(LS_APIKEY);
    if (saved && getProvider(saved)) setProviderId(saved);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem(LS_PROVIDER, providerId);
    localStorage.setItem(LS_APIKEY, apiKey);
    setStatus('saved');
    setErrorMsg('');
    // Dispatch storage event so Header picks up the change
    window.dispatchEvent(new Event('storage'));
  }, [providerId, apiKey]);

  const handleClear = useCallback(() => {
    localStorage.removeItem(LS_PROVIDER);
    localStorage.removeItem(LS_APIKEY);
    setProviderId(LLM_PROVIDERS[0].id);
    setApiKey('');
    setStatus('cleared');
    setErrorMsg('');
    window.dispatchEvent(new Event('storage'));
  }, []);

  const handleTest = useCallback(async () => {
    const provider = getProvider(providerId);
    if (!provider || !apiKey) return;

    setStatus('testing');
    setErrorMsg('');

    try {
      const isAnthropic = provider.format === 'anthropic';
      const url = isAnthropic
        ? `${provider.baseUrl}/messages`
        : `${provider.baseUrl}/chat/completions`;

      const body = isAnthropic
        ? JSON.stringify({
            model: provider.model,
            max_tokens: 16,
            messages: [{ role: 'user', content: 'Say "ok"' }],
          })
        : JSON.stringify({
            model: provider.model,
            messages: [{ role: 'user', content: 'Say "ok"' }],
            max_tokens: 16,
          });

      const response = await fetch(url, {
        method: 'POST',
        headers: provider.buildHeaders(apiKey),
        body,
      });

      if (response.ok) {
        setStatus('test-success');
      } else {
        setStatus('test-failed');
        const status = response.status;
        if (status === 401) {
          setErrorMsg(t('errorAuth'));
        } else if (status === 403) {
          setErrorMsg(t('errorForbidden'));
        } else if (status === 429) {
          setErrorMsg(t('errorRateLimit'));
        } else if (status === 404) {
          setErrorMsg(t('errorNotFound'));
        } else if (status >= 500) {
          setErrorMsg(t('errorServer'));
        } else {
          setErrorMsg(t('errorHttp', { status: String(status) }));
        }
      }
    } catch {
      setStatus('test-failed');
      setErrorMsg(t('errorNetwork'));
    }
  }, [providerId, apiKey, t]);

  const selectedProvider = getProvider(providerId);

  return (
    <div data-testid="api-key-settings" className="mx-auto max-w-lg space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t('description')}
        </p>
      </div>

      {/* Provider select */}
      <div className="space-y-2">
        <label
          htmlFor="provider-select"
          className="text-sm font-medium text-[var(--color-foreground)]"
        >
          {t('provider')}
        </label>
        <select
          id="provider-select"
          data-testid="provider-select"
          value={providerId}
          onChange={(e) => {
            setProviderId(e.target.value);
            setStatus('idle');
          }}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          {LLM_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.model})
            </option>
          ))}
        </select>
      </div>

      {/* API key input */}
      <div className="space-y-2">
        <label
          htmlFor="apikey-input"
          className="text-sm font-medium text-[var(--color-foreground)]"
        >
          {t('apiKey')}
        </label>
        <input
          id="apikey-input"
          data-testid="apikey-input"
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setStatus('idle');
          }}
          placeholder={t('apiKeyPlaceholder')}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          data-testid="save-button"
          onClick={handleSave}
          disabled={!apiKey}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
        >
          {t('save')}
        </button>
        <button
          data-testid="test-button"
          onClick={handleTest}
          disabled={!apiKey || status === 'testing'}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-foreground)] transition-opacity disabled:opacity-40"
        >
          {status === 'testing' ? t('testing') : t('test')}
        </button>
        <button
          data-testid="clear-button"
          onClick={handleClear}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-opacity hover:text-[var(--color-foreground)]"
        >
          {t('clear')}
        </button>
      </div>

      {/* Status message */}
      {status !== 'idle' && status !== 'testing' && (
        <div
          data-testid="status-message"
          className={`rounded px-3 py-2 text-sm ${
            status === 'saved' || status === 'test-success'
              ? 'bg-[#44ff8820] text-[#44ff88]'
              : status === 'cleared'
                ? 'bg-[#88888820] text-[var(--color-text-secondary)]'
                : 'bg-[#ff334420] text-[var(--color-primary)]'
          }`}
        >
          {status === 'saved' && t('saved')}
          {status === 'cleared' && t('cleared')}
          {status === 'test-success' && t('testSuccess')}
          {status === 'test-failed' && t('testFailed', { error: errorMsg })}
        </div>
      )}

      {/* Provider info */}
      {selectedProvider && (
        <div
          data-testid="provider-info"
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text-secondary)]"
        >
          <div>{t('model')}: {selectedProvider.model}</div>
          <div>{t('endpoint')}: {selectedProvider.baseUrl}</div>
        </div>
      )}
    </div>
  );
}
