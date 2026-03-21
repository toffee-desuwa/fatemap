"use client";

import dynamic from "next/dynamic";

const FateHeroMap = dynamic(
  () => import("@/components/map/FateHeroMap").then((m) => ({ default: m.FateHeroMap })),
  { ssr: false }
);

export function FateHeroMapLoader() {
  return <FateHeroMap />;
}
