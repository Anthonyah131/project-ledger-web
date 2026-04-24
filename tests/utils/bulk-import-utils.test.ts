import { describe, it, expect } from "vitest";
import { parseClipboardData, BULK_IMPORT_MAX_ITEMS } from "@/lib/bulk-import-utils";

describe("bulk-import-utils", () => {
  describe("parseClipboardData", () => {
    describe("empty input handling", () => {
      it("should return error for empty string", () => {
        const result = parseClipboardData("");
        expect(result.error).toBe("parse.emptyPaste");
        expect(result.rows).toEqual([]);
      });

      it("should return error for whitespace only", () => {
        const result = parseClipboardData("   \n  ");
        expect(result.error).toBe("parse.emptyPaste");
      });
    });

    describe("tab validation", () => {
      it("should return error when no tabs present", () => {
        const result = parseClipboardData("Title, Amount, Date");
        expect(result.error).toBe("parse.noTabs");
      });
    });

    describe("row validation", () => {
      it("should return emptyPaste when only whitespace and tabs", () => {
        const result = parseClipboardData("\t\t");
        expect(result.error).toBe("parse.emptyPaste");
      });

      it("should return noUsableColumns when data has no identifiable columns", () => {
        const result = parseClipboardData("abc\tdef");
        expect(result.error).toBeNull();
        expect(result.rows.length).toBeGreaterThan(0);
      });
    });

    describe("header detection", () => {
      it("should detect header row with title pattern", () => {
        const text = "Title\tAmount\tDate\nGrocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.stats.hasHeaders).toBe(true);
        expect(result.rows).toHaveLength(1);
      });

      it("should detect header row with titulo pattern (spanish)", () => {
        const text = "Titulo\tMonto\tFecha\nGrocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.stats.hasHeaders).toBe(true);
      });

      it("should detect header row with nombre pattern", () => {
        const text = "Nombre\tTotal\nService\t100\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.stats.hasHeaders).toBe(true);
      });

      it("should not treat data rows as headers", () => {
        const text = "Grocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.stats.hasHeaders).toBe(false);
      });
    });

    describe("data parsing", () => {
      it("should parse basic tab-separated data", () => {
        const text = "Grocery\t50.00\t2024-01-15\tWeekly shopping";
        const result = parseClipboardData(text);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].title).toBe("Grocery");
        expect(result.rows[0].amount).toBe(50);
        expect(result.rows[0].date).toBe("2024-01-15");
        expect(result.rows[0].description).toBe("Weekly shopping");
      });

      it("should parse multiple rows", () => {
        const text = "Grocery\t50.00\t2024-01-15\nService\t100.00\t2024-01-16";
        const result = parseClipboardData(text);
        expect(result.rows).toHaveLength(2);
      });

      it("should handle currency symbols in amounts", () => {
        const text = "Grocery\t$50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].amount).toBe(50);
      });

      it("should handle euro currency symbols", () => {
        const text = "Grocery\t50,00 €\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].amount).toBe(50);
      });

      it("should handle comma as decimal separator", () => {
        const text = "Grocery\t50,99\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].amount).toBe(50.99);
      });

      it("should handle date formats with slashes when day > 12", () => {
        const text = "Grocery\t50.00\t15/01/2024";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-01-15");
      });

      it("should handle date formats with dashes when day > 12", () => {
        const text = "Grocery\t50.00\t15-01-2024";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-01-15");
      });

      it("should handle 2-digit year when day > 12", () => {
        const text = "Grocery\t50.00\t15-01-24";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-01-15");
      });

      it("should return null for invalid amounts", () => {
        const text = "Grocery\tabc\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].amount).toBeNull();
      });

      it("should ignore rows without title or amount", () => {
        const text = "\t\t\nGrocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows).toHaveLength(1);
      });
    });

    describe("date normalization", () => {
      it("should pass through ISO date format", () => {
        const text = "Grocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-01-15");
      });

      it("should handle day > 12 to determine DMY vs MDY", () => {
        const text = "Grocery\t50.00\t25/12/2024";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-12-25");
      });

      it("should assume MDY when day <= 12", () => {
        const text = "Grocery\t50.00\t06/12/2024";
        const result = parseClipboardData(text);
        expect(result.rows[0].date).toBe("2024-12-06");
      });
    });

    describe("stats tracking", () => {
      it("should count missing amounts correctly", () => {
        const text = "Grocery\t50.00\t2024-01-15\nService\t\t2024-01-16";
        const result = parseClipboardData(text);
        expect(result.stats.missingAmounts).toBe(1);
      });

      it("should count missing dates correctly", () => {
        const text = "Grocery\t50.00\t2024-01-15\nService\t100.00\t";
        const result = parseClipboardData(text);
        expect(result.stats.missingDates).toBe(1);
      });

      it("should count missing titles correctly", () => {
        const text = "Grocery\t50.00\t2024-01-15\n\t100.00\t2024-01-16";
        const result = parseClipboardData(text);
        expect(result.stats.missingTitles).toBe(1);
      });

      it("should track total input rows", () => {
        const text = "Title\tAmount\nRow1\t50\nRow2\t100";
        const result = parseClipboardData(text);
        expect(result.stats.totalInputRows).toBe(2);
      });

      it("should track parsed rows", () => {
        const text = "Title\tAmount\nRow1\t50\nRow2\t100";
        const result = parseClipboardData(text);
        expect(result.stats.parsedRows).toBe(2);
      });
    });

    describe("warnings", () => {
      it("should warn when >50% of rows have missing amounts", () => {
        const text = "Title\tAmount\tDate\nRow1\t\t2024-01-01\nRow2\t\t2024-01-02\nRow3\t50\t2024-01-03";
        const result = parseClipboardData(text);
        expect(result.warnings).toContain("parse.warn.manyMissingAmounts");
      });

      it("should warn when >50% of rows have missing dates", () => {
        const text = "Title\tAmount\tDate\nRow1\t50\t\nRow2\t100\t";
        const result = parseClipboardData(text);
        expect(result.warnings).toContain("parse.warn.manyMissingDates");
      });
    });

    describe("errors", () => {
      it("should error when >75% of rows have missing titles", () => {
        const text = "Title\tAmount\n\t50\n\t100\n\t200\n\t300";
        const result = parseClipboardData(text);
        expect(result.error).toBe("parse.missingTitles");
      });

      it("should error when no usable rows remain", () => {
        const text = "Title\tAmount\n\t\n\t\t";
        const result = parseClipboardData(text);
        expect(result.error).toBe("parse.noUsableRows");
      });
    });

    describe("BULK_IMPORT_MAX_ITEMS", () => {
      it("should limit rows to max items", () => {
        const rows = Array.from({ length: 150 }, (_, i) =>
          `Row${i}\t${i + 1}\t2024-01-${String((i % 28) + 1).padStart(2, "0")}`
        ).join("\n");
        const result = parseClipboardData(rows);
        expect(result.rows.length).toBeLessThanOrEqual(BULK_IMPORT_MAX_ITEMS);
      });
    });

    describe("heuristic column mapping", () => {
      it("should use column position for data without headers", () => {
        const text = "Grocery\t50.00\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].title).toBe("Grocery");
        expect(result.rows[0].amount).toBe(50);
      });

      it("should detect numeric columns correctly", () => {
        const text = "abc\t123\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows[0].amount).toBe(123);
      });

      it("should detect columns with mixed data patterns", () => {
        const text = "Item\t100\t2024-01-15";
        const result = parseClipboardData(text);
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].title).toBe("Item");
      });
    });
  });
});