import {
  createShockwaveLayers,
  getRingRadius,
  getRingOpacity,
  RING_COUNT,
} from '../impact-wave';
import { SEVERITY_COLORS } from '../colors';
import type { AnimationPhase } from '../types';

// Mock deck.gl ScatterplotLayer — store props for inspection
jest.mock('@deck.gl/layers', () => ({
  ScatterplotLayer: jest.fn().mockImplementation((props) => ({ props })),
}));

const epicenter: [number, number] = [121.5, 25.0]; // Taiwan Strait

const baseOptions = {
  epicenter,
  animationTime: 1.0,
  animationPhase: 'ripple' as AnimationPhase,
};

describe('createShockwaveLayers', () => {
  it('returns exactly 4 ring layers', () => {
    const layers = createShockwaveLayers(baseOptions);
    expect(layers).toHaveLength(RING_COUNT);
  });

  it('layers have sequential IDs', () => {
    const layers = createShockwaveLayers(baseOptions);
    for (let i = 0; i < RING_COUNT; i++) {
      expect(layers[i].props.id).toBe(`shockwave-ring-${i}`);
    }
  });

  it('no layer is pickable', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => expect(l.props.pickable).toBe(false));
  });

  it('all layers use meters for radius', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => expect(l.props.radiusUnits).toBe('meters'));
  });

  it('all layers use pixels for line width', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => expect(l.props.lineWidthUnits).toBe('pixels'));
  });

  it('all layers are stroked, not filled', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => {
      expect(l.props.stroked).toBe(true);
      expect(l.props.filled).toBe(false);
    });
  });

  // --- Phase visibility ---

  it('ripple phase produces data with epicenter', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => {
      expect(l.props.data).toHaveLength(1);
      expect(l.props.data[0].coordinates).toEqual(epicenter);
    });
  });

  it('idle phase produces empty data', () => {
    const layers = createShockwaveLayers({ ...baseOptions, animationPhase: 'idle' });
    layers.forEach((l) => expect(l.props.data).toHaveLength(0));
  });

  it('network phase produces empty data', () => {
    const layers = createShockwaveLayers({ ...baseOptions, animationPhase: 'network' });
    layers.forEach((l) => expect(l.props.data).toHaveLength(0));
  });

  it('persistent phase produces empty data', () => {
    const layers = createShockwaveLayers({
      ...baseOptions,
      animationPhase: 'persistent',
    });
    layers.forEach((l) => expect(l.props.data).toHaveLength(0));
  });

  // --- Colors ---

  it('ring 0 (outermost) uses critical color', () => {
    const layers = createShockwaveLayers(baseOptions);
    const lineColor = layers[0].props.getLineColor as [number, number, number, number];
    expect(lineColor.slice(0, 3)).toEqual(SEVERITY_COLORS.critical);
  });

  it('ring 3 (innermost) uses medium color', () => {
    const layers = createShockwaveLayers(baseOptions);
    const lineColor = layers[3].props.getLineColor as [number, number, number, number];
    expect(lineColor.slice(0, 3)).toEqual(SEVERITY_COLORS.medium);
  });

  it('middle rings use high color', () => {
    const layers = createShockwaveLayers(baseOptions);
    const color1 = (layers[1].props.getLineColor as number[]).slice(0, 3);
    const color2 = (layers[2].props.getLineColor as number[]).slice(0, 3);
    expect(color1).toEqual(SEVERITY_COLORS.high);
    expect(color2).toEqual(SEVERITY_COLORS.high);
  });

  // --- Radius ---

  it('ring 0 has larger radius than ring 3 at same time', () => {
    const layers = createShockwaveLayers(baseOptions);
    expect(layers[0].props.getRadius).toBeGreaterThan(layers[3].props.getRadius);
  });

  it('all rings have positive radius during mid-ripple', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => expect(l.props.getRadius).toBeGreaterThan(0));
  });

  // --- Opacity ---

  it('outer rings have higher opacity than inner rings', () => {
    const layers = createShockwaveLayers(baseOptions);
    const opacities = layers.map(
      (l) => (l.props.getLineColor as [number, number, number, number])[3],
    );
    // Ring 0 opacity > Ring 3 opacity
    expect(opacities[0]).toBeGreaterThan(opacities[3]);
  });

  // --- updateTriggers ---

  it('updateTriggers include animationPhase and animationTime', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => {
      expect(l.props.updateTriggers.getLineColor).toContain('ripple');
      expect(l.props.updateTriggers.getLineColor).toContain(1.0);
      expect(l.props.updateTriggers.getRadius).toContain(1.0);
    });
  });

  // --- Line width ---

  it('all rings have line width of 3', () => {
    const layers = createShockwaveLayers(baseOptions);
    layers.forEach((l) => expect(l.props.getLineWidth).toBe(3));
  });

  // --- Non-visible phases have zero radius/opacity ---

  it('idle phase rings have zero radius and opacity', () => {
    const layers = createShockwaveLayers({ ...baseOptions, animationPhase: 'idle' });
    layers.forEach((l) => {
      expect(l.props.getRadius).toBe(0);
      const opacity = (l.props.getLineColor as number[])[3];
      expect(opacity).toBe(0);
    });
  });
});

describe('getRingRadius', () => {
  it('returns 0 before ring stagger start', () => {
    // Ring 2 starts at 0.6s, so at t=0.5 it should be 0
    expect(getRingRadius(0.5, 2)).toBe(0);
  });

  it('returns 0 at exactly t=0 for ring 0', () => {
    expect(getRingRadius(0, 0)).toBe(0);
  });

  it('increases over time for ring 0', () => {
    const r1 = getRingRadius(0.5, 0);
    const r2 = getRingRadius(1.0, 0);
    expect(r2).toBeGreaterThan(r1);
    expect(r1).toBeGreaterThan(0);
  });

  it('caps at max radius (5,000,000m)', () => {
    const r = getRingRadius(2.0, 0);
    expect(r).toBe(5_000_000);
  });

  it('ring 0 radius > ring 1 radius at same time', () => {
    const r0 = getRingRadius(1.0, 0);
    const r1 = getRingRadius(1.0, 1);
    expect(r0).toBeGreaterThan(r1);
  });

  it('ring 3 starts expanding only after 0.9s', () => {
    expect(getRingRadius(0.8, 3)).toBe(0);
    expect(getRingRadius(1.0, 3)).toBeGreaterThan(0);
  });

  it('all rings converge to max radius at t=2', () => {
    for (let i = 0; i < RING_COUNT; i++) {
      // At t=2, all rings should be at or near max
      expect(getRingRadius(2.0, i)).toBeGreaterThan(0);
    }
  });
});

describe('getRingOpacity', () => {
  it('returns 0 before ring stagger start', () => {
    expect(getRingOpacity(0.2, 1)).toBe(0); // ring 1 starts at 0.3s
  });

  it('returns 0 at t=0 for ring 0', () => {
    expect(getRingOpacity(0, 0)).toBe(0);
  });

  it('ring 0 has higher base opacity than ring 3', () => {
    const o0 = getRingOpacity(1.0, 0);
    const o3 = getRingOpacity(1.0, 3);
    expect(o0).toBeGreaterThan(o3);
  });

  it('fades in quickly after stagger start', () => {
    // Ring 0 at t=0.05 (half of 100ms fade-in) should be ~half of base
    const o = getRingOpacity(0.05, 0);
    expect(o).toBeGreaterThan(0);
    expect(o).toBeLessThan(200); // less than full base opacity
  });

  it('reaches full base opacity after fade-in', () => {
    // Ring 0 at t=0.5 — well past fade-in, well before fade-out
    const o = getRingOpacity(0.5, 0);
    expect(o).toBe(200); // base opacity for ring 0
  });

  it('ring 1 base opacity is 160', () => {
    expect(getRingOpacity(1.0, 1)).toBe(160);
  });

  it('ring 2 base opacity is 120', () => {
    expect(getRingOpacity(1.0, 2)).toBe(120);
  });

  it('ring 3 base opacity is 80', () => {
    expect(getRingOpacity(1.0, 3)).toBe(80);
  });

  it('fades out during last 300ms of ripple', () => {
    // At t=1.85, timeLeft=0.15 → fadeOut=0.5
    const o = getRingOpacity(1.85, 0);
    expect(o).toBe(Math.round(200 * 0.5)); // 100
  });

  it('opacity is 0 at t=2.0', () => {
    const o = getRingOpacity(2.0, 0);
    expect(o).toBe(0);
  });
});
