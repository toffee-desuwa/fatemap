/**
 * Tests for locale layout metadata generation.
 */

import { generateMetadata } from "../layout";

describe("generateMetadata", () => {
  it("returns English metadata for en locale", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.title).toContain("FateMap");
    expect(meta.description).toContain("geopolitical");
    expect(meta.openGraph?.locale).toBe("en_US");
  });

  it("returns Chinese metadata for zh locale", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "zh" }),
    });
    expect(meta.title).toContain("FateMap");
    expect(meta.description).toContain("地缘政治");
    expect(meta.openGraph?.locale).toBe("zh_CN");
  });

  it("includes openGraph fields", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.openGraph?.siteName).toBe("FateMap");
    expect(meta.openGraph?.type).toBe("website");
    expect(meta.openGraph?.title).toBeTruthy();
    expect(meta.openGraph?.description).toBeTruthy();
  });

  it("includes Twitter card config", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.twitter?.card).toBe("summary_large_image");
    expect(meta.twitter?.title).toBeTruthy();
    expect(meta.twitter?.description).toBeTruthy();
  });

  it("sets metadataBase URL", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.metadataBase).toBeInstanceOf(URL);
  });

  it("includes alternates for both locales", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.alternates?.languages).toEqual({ en: "/en", zh: "/zh" });
  });

  it("falls back to English for unknown locale", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "fr" }),
    });
    expect(meta.title).toContain("FateMap");
    expect(meta.openGraph?.locale).toBe("en_US");
  });

  it("allows indexing", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });
});
