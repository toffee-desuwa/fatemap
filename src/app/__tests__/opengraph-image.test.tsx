/**
 * Tests for OG image generation exports and config.
 * ImageResponse is mocked since jsdom lacks the Response global.
 */

jest.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    constructor(
      public element: React.ReactNode,
      public options: Record<string, unknown>
    ) {}
  },
}));

import OgImage, { runtime, alt, size, contentType } from "../opengraph-image";

describe("opengraph-image", () => {
  it("exports edge runtime", () => {
    expect(runtime).toBe("edge");
  });

  it("exports alt text containing FateMap", () => {
    expect(alt).toContain("FateMap");
  });

  it("exports 1200x630 size", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it("exports PNG content type", () => {
    expect(contentType).toBe("image/png");
  });

  it("returns a mock ImageResponse instance", () => {
    const response = OgImage();
    expect(response).toBeDefined();
    expect(response).toHaveProperty("element");
    expect(response).toHaveProperty("options");
  });

  it("passes size to ImageResponse options", () => {
    const response = OgImage() as unknown as { options: { width: number; height: number } };
    expect(response.options.width).toBe(1200);
    expect(response.options.height).toBe(630);
  });
});
