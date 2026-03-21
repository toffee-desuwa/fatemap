'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const FateHeroMapLoader = dynamic(
  () =>
    import('@/components/map/FateHeroMapLoader').then((m) => ({
      default: m.FateHeroMapLoader,
    })),
  { ssr: false },
);

export function LandingClient() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden" data-testid="hero-section">
        {/* Hero map background */}
        <div className="absolute inset-0 z-0">
          <FateHeroMapLoader />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]" />

        {/* Hero content */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1
            className="mb-4 text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl"
            data-testid="hero-title"
          >
            <span className="text-[#ff3344]">{tc('appName')}</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg text-gray-300 sm:text-xl" data-testid="hero-tagline">
            {t('tagline')}
          </p>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#ff3344] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#e62e3c]"
            data-testid="hero-cta"
          >
            {t('cta')}
          </Link>
          <p className="mt-4 text-sm text-gray-500">{t('ctaDescription')}</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 py-24" data-testid="features-section">
        <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">{t('features')}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <div
              key={n}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-gray-700"
              data-testid={`feature-card-${n}`}
            >
              <h3 className="mb-2 text-lg font-semibold text-[#ff3344]">
                {t(`feature${n}Title`)}
              </h3>
              <p className="text-sm text-gray-400">{t(`feature${n}Desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Section */}
      <section className="border-t border-gray-800 py-16" data-testid="tech-section">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-8 text-2xl font-bold">{t('techTitle')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {(['techDeckgl', 'techAi', 'techOpenSource'] as const).map((key) => (
              <span
                key={key}
                className="rounded-full border border-gray-700 bg-gray-800/50 px-6 py-2 text-sm text-gray-300"
                data-testid={`tech-badge-${key}`}
              >
                {t(key)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center" data-testid="bottom-cta-section">
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-[#ff3344] px-10 py-4 text-xl font-semibold text-white transition-colors hover:bg-[#e62e3c]"
          data-testid="bottom-cta"
        >
          {t('cta')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500" data-testid="footer">
        {t('footer')}
      </footer>
    </div>
  );
}
