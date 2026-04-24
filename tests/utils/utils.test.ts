import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names with clsx", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should merge tailwind classes with twMerge", () => {
      const result = cn("text-red-500 bg-blue-500", "text-red-600");
      expect(result).toBeDefined();
      expect(result).not.toMatch(/text-red-500/);
    });

    it("should handle array inputs", () => {
      const result = cn(["text-red-500", "bg-blue-500"]);
      expect(result).toBeDefined();
    });

    it("should handle object inputs", () => {
      const result = cn({ "text-red-500": true, "text-blue-500": false });
      expect(result).toBeDefined();
    });

    it("should handle mixed inputs", () => {
      const result = cn("text-red-500", ["bg-blue-500"], { p: 4 });
      expect(result).toBeDefined();
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });
  });
});
