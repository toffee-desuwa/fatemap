import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Use standalone output for Docker; skip for Vercel (it has its own adapter)
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  experimental: {
    optimizePackageImports: [
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/react',
    ],
  },
};

export default withNextIntl(nextConfig);
