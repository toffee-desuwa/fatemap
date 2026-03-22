/**
 * F013: Shockwave ripple animation — expanding concentric circles from epicenter.
 * 4 ScatterplotLayer rings expand outward during the ripple phase (0-2s).
 * Color gradient: red → orange → yellow. Rings fade out at end of ripple.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import type { AnimationPhase } from './types';
import { SEVERITY_COLORS } from './colors';

/** Number of concentric rings */
export const RING_COUNT = 4;

/** Maximum ring radius in meters (~6000km) */
const MAX_RADIUS_M = 6_000_000;

/** Ripple phase duration in seconds */
const RIPPLE_DURATION = 2;

/** Stagger delay between rings (seconds) */
const RING_STAGGER_S = 0.3;

/** Ring stroke width in pixels */
const RING_LINE_WIDTH = 4;

/** Fade-out duration at end of ripple (seconds) */
const FADE_OUT_DURATION = 0.3;

/** Ring colors from outermost (ring 0, leading edge) to innermost (ring 3, trailing) */
const RING_COLORS: [number, number, number][] = [
  SEVERITY_COLORS.critical, // red — leading wave front
  SEVERITY_COLORS.high, // orange
  SEVERITY_COLORS.high, // orange
  SEVERITY_COLORS.medium, // yellow — trailing edge
];

interface RingData {
  coordinates: [number, number];
}

/**
 * Calculate ring radius at a given time.
 * All rings expand at the same rate, staggered in start time.
 * Ring 0 starts first (outermost), ring 3 starts last (innermost).
 */
export function getRingRadius(animationTime: number, ringIndex: number): number {
  const elapsed = animationTime - ringIndex * RING_STAGGER_S;
  if (elapsed <= 0) return 0;
  const rate = MAX_RADIUS_M / RIPPLE_DURATION;
  return Math.min(elapsed * rate, MAX_RADIUS_M);
}

/**
 * Calculate ring opacity (0-255).
 * Fades in quickly after stagger start, fades out in last 300ms of ripple.
 * Outer rings (lower index) are brighter than inner rings.
 */
export function getRingOpacity(animationTime: number, ringIndex: number): number {
  const elapsed = animationTime - ringIndex * RING_STAGGER_S;
  if (elapsed <= 0) return 0;

  // Base opacity: outer rings brighter, inner rings dimmer
  const baseOpacity = 230 - ringIndex * 40; // 230, 190, 150, 110

  // Fade in quickly (first 100ms after this ring starts)
  const fadeIn = Math.min(elapsed / 0.1, 1);

  // Fade out at end of ripple phase
  const timeLeft = RIPPLE_DURATION - animationTime;
  const fadeOut =
    timeLeft <= FADE_OUT_DURATION ? Math.max(timeLeft / FADE_OUT_DURATION, 0) : 1;

  return Math.round(baseOpacity * fadeIn * fadeOut);
}

export interface ShockwaveOptions {
  epicenter: [number, number];
  animationTime: number; // 0-2 seconds
  animationPhase: AnimationPhase;
}

/**
 * Create 4 ScatterplotLayers as expanding concentric rings.
 * Only active during ripple phase. Rings expand from epicenter outward
 * with red→orange→yellow gradient and decreasing opacity.
 */
export function createShockwaveLayers({
  epicenter,
  animationTime,
  animationPhase,
}: ShockwaveOptions): ScatterplotLayer<RingData>[] {
  const isVisible = animationPhase === 'ripple';
  const data: RingData[] = isVisible ? [{ coordinates: epicenter }] : [];

  return Array.from({ length: RING_COUNT }, (_, i) => {
    const color = RING_COLORS[i];
    const opacity = isVisible ? getRingOpacity(animationTime, i) : 0;
    const radius = isVisible ? getRingRadius(animationTime, i) : 0;

    return new ScatterplotLayer<RingData>({
      id: `shockwave-ring-${i}`,
      data,
      getPosition: (d) => d.coordinates,
      filled: false,
      stroked: true,
      getLineColor: [...color, opacity] as [number, number, number, number],
      getLineWidth: RING_LINE_WIDTH,
      getRadius: radius,
      radiusUnits: 'meters' as const,
      lineWidthUnits: 'pixels' as const,
      pickable: false,
      updateTriggers: {
        getLineColor: [animationPhase, animationTime],
        getRadius: [animationTime],
      },
    });
  });
}
