"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 800,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;

    if (from === to) return;

    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      const factor = Math.pow(10, decimals);
      setDisplay(Math.round(current * factor) / factor);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, decimals]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : display.toLocaleString();

  return (
    <span data-testid="animated-number">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
