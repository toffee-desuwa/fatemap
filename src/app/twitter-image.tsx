import { ImageResponse } from "next/og";
import { OgImageContent } from "./og-content";

export const runtime = "edge";
export const alt = "FateMap — Simulate Any Event, Watch the World React";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgImageContent />, { ...size });
}
