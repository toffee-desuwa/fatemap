export const SEVERITY_COLORS = {
  critical: [255, 51, 68] as [number, number, number], // #FF3344
  high: [255, 136, 68] as [number, number, number], // #FF8844
  medium: [255, 204, 68] as [number, number, number], // #FFCC44
  low: [68, 136, 255] as [number, number, number], // #4488FF
  positive: [68, 255, 136] as [number, number, number], // #44FF88
  unaffected: [51, 68, 85] as [number, number, number], // #334455
};

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Hex color strings derived from SEVERITY_COLORS (single source of truth) */
export const SEVERITY_HEX = {
  critical: rgbToHex(SEVERITY_COLORS.critical),
  high: rgbToHex(SEVERITY_COLORS.high),
  medium: rgbToHex(SEVERITY_COLORS.medium),
  low: rgbToHex(SEVERITY_COLORS.low),
  positive: rgbToHex(SEVERITY_COLORS.positive),
} as const;

/** Tailwind badge classes for severity levels */
export const SEVERITY_BADGE: Record<string, string> = {
  critical: `bg-[${SEVERITY_HEX.critical}] text-white`,
  high: `bg-[${SEVERITY_HEX.high}] text-white`,
  medium: `bg-[${SEVERITY_HEX.medium}] text-black`,
  low: `bg-[${SEVERITY_HEX.low}] text-white`,
};
