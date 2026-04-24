import { describe, it, expect } from "vitest";
import { hasMultiPartnerSplits } from "@/lib/split-utils";
import type { SplitResponse } from "@/types/expense";

describe("split-utils", () => {
  describe("hasMultiPartnerSplits", () => {
    it("should return false for null", () => {
      expect(hasMultiPartnerSplits(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(hasMultiPartnerSplits(undefined)).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(hasMultiPartnerSplits([])).toBe(false);
    });

    it("should return false for single split", () => {
      const splits: SplitResponse[] = [
        { partnerId: "partner-1", amount: 100, percentage: 100 },
      ];
      expect(hasMultiPartnerSplits(splits)).toBe(false);
    });

    it("should return false for multiple splits with same partner", () => {
      const splits: SplitResponse[] = [
        { partnerId: "partner-1", amount: 50, percentage: 50 },
        { partnerId: "partner-1", amount: 50, percentage: 50 },
      ];
      expect(hasMultiPartnerSplits(splits)).toBe(false);
    });

    it("should return true for splits with 2 different partners", () => {
      const splits: SplitResponse[] = [
        { partnerId: "partner-1", amount: 60, percentage: 60 },
        { partnerId: "partner-2", amount: 40, percentage: 40 },
      ];
      expect(hasMultiPartnerSplits(splits)).toBe(true);
    });

    it("should return true for splits with 3 different partners", () => {
      const splits: SplitResponse[] = [
        { partnerId: "partner-1", amount: 40, percentage: 40 },
        { partnerId: "partner-2", amount: 30, percentage: 30 },
        { partnerId: "partner-3", amount: 30, percentage: 30 },
      ];
      expect(hasMultiPartnerSplits(splits)).toBe(true);
    });

    it("should return false for single partner regardless of percentage", () => {
      const splits: SplitResponse[] = [
        { partnerId: "partner-1", amount: 100, percentage: 100 },
      ];
      expect(hasMultiPartnerSplits(splits)).toBe(false);
    });
  });
});
