import { describe, it, expect } from "vitest";
import { createMetadata, SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/seo";

describe("seo", () => {
  describe("SITE constants", () => {
    it("should have correct SITE_URL", () => {
      expect(SITE_URL).toBe("https://project-ledger-web.vercel.app");
    });

    it("should have correct SITE_NAME", () => {
      expect(SITE_NAME).toBe("Project Ledger");
    });

    it("should have correct SITE_DESCRIPTION", () => {
      expect(SITE_DESCRIPTION).toContain("all-in-one platform");
    });

    it("should have correct DEFAULT_OG_IMAGE", () => {
      expect(DEFAULT_OG_IMAGE).toBe("/og-image.jpeg");
    });
  });

  describe("createMetadata", () => {
    it("should create basic metadata with title only", () => {
      const metadata = createMetadata({ title: "Test Page" });
      expect(metadata.title).toBe("Test Page");
      expect(metadata.description).toBe(SITE_DESCRIPTION);
    });

    it("should use provided description over default", () => {
      const metadata = createMetadata({ title: "Test", description: "Custom description" });
      expect(metadata.description).toBe("Custom description");
    });

    it("should use provided ogImage over default", () => {
      const metadata = createMetadata({ title: "Test", ogImage: "/custom-og.png" });
      expect(metadata.openGraph?.images).toContainEqual(
        expect.objectContaining({ url: "/custom-og.png" })
      );
    });

    it("should use default OG image when not specified", () => {
      const metadata = createMetadata({ title: "Test" });
      expect(metadata.openGraph?.images).toContainEqual(
        expect.objectContaining({ url: DEFAULT_OG_IMAGE })
      );
    });

    describe("canonical URL", () => {
      it("should construct full URL from canonical path", () => {
        const metadata = createMetadata({ title: "Test", canonical: "/page" });
        expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/page`);
      });

      it("should use SITE_URL when no canonical provided", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.alternates?.canonical).toBe(SITE_URL);
      });
    });

    describe("openGraph", () => {
      it("should set correct siteName", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.openGraph?.siteName).toBe(SITE_NAME);
      });

      it("should set correct type", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.openGraph?.type).toBe("website");
      });

      it("should set title in openGraph", () => {
        const metadata = createMetadata({ title: "Test Page" });
        expect(metadata.openGraph?.title).toBe("Test Page");
      });

      it("should set description in openGraph", () => {
        const metadata = createMetadata({ title: "Test", description: "Custom desc" });
        expect(metadata.openGraph?.description).toBe("Custom desc");
      });

      it("should include image with width and height", () => {
        const metadata = createMetadata({ title: "Test" });
        const image = metadata.openGraph?.images?.[0];
        expect(image?.width).toBe(1200);
        expect(image?.height).toBe(630);
      });

      it("should use title as image alt", () => {
        const metadata = createMetadata({ title: "Test Page" });
        const image = metadata.openGraph?.images?.[0];
        expect(image?.alt).toBe("Test Page");
      });
    });

    describe("twitter", () => {
      it("should set card type to summary_large_image", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.twitter?.card).toBe("summary_large_image");
      });

      it("should set title in twitter", () => {
        const metadata = createMetadata({ title: "Test Page" });
        expect(metadata.twitter?.title).toBe("Test Page");
      });

      it("should set description in twitter", () => {
        const metadata = createMetadata({ title: "Test", description: "Custom desc" });
        expect(metadata.twitter?.description).toBe("Custom desc");
      });

      it("should include image in twitter", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.twitter?.images).toContain(DEFAULT_OG_IMAGE);
      });
    });

    describe("robots", () => {
      it("should allow indexing by default", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.robots).toEqual({
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        });
      });

      it("should block indexing when noIndex is true", () => {
        const metadata = createMetadata({ title: "Test", noIndex: true });
        expect(metadata.robots).toEqual({
          index: false,
          follow: false,
        });
      });
    });

    describe("authors", () => {
      it("should include SITE_NAME and SITE_URL as author", () => {
        const metadata = createMetadata({ title: "Test" });
        expect(metadata.authors).toContainEqual({
          name: SITE_NAME,
          url: SITE_URL,
        });
      });
    });
  });
});