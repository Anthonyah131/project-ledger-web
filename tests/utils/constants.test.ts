import { describe, it, expect } from "vitest";
import {
  getAccentColor,
  getAccentColorRaw,
  getRoleLabel,
  getPaymentMethodTypeLabel,
  PAYMENT_METHOD_ACCENT,
  STATUS_COLORS,
  getObligationStatusLabel,
} from "@/lib/constants";

describe("constants", () => {
  describe("getAccentColor", () => {
    it("should return first color for index 0", () => {
      const result = getAccentColor(0);
      expect(result).toBe("bg-primary");
    });

    it("should cycle through colors", () => {
      const colors: string[] = [];
      for (let i = 0; i < 10; i++) {
        colors.push(getAccentColor(i));
      }
      expect(colors[0]).toBe(colors[8]);
      expect(colors[1]).toBe(colors[9]);
    });

    it("should handle large indices by cycling", () => {
      const result = getAccentColor(100);
      expect(result).toBeDefined();
      expect(result).toMatch(/^bg-/);
    });
  });

  describe("getAccentColorRaw", () => {
    it("should return first raw color for index 0", () => {
      const result = getAccentColorRaw(0);
      expect(result).toBe("oklch(0.55 0.20 255)");
    });

    it("should cycle through raw colors", () => {
      const colors: string[] = [];
      for (let i = 0; i < 10; i++) {
        colors.push(getAccentColorRaw(i));
      }
      expect(colors[0]).toBe(colors[8]);
    });
  });

  describe("getRoleLabel", () => {
    it("should call translation function with correct key", () => {
      const t = (key: string) => {
        if (key === "common.roles.admin") return "Administrador";
        if (key === "common.roles.member") return "Miembro";
        return key;
      };
      expect(getRoleLabel("admin", t)).toBe("Administrador");
    });

    it("should return translation result when translation not found", () => {
      const t = (key: string) => key;
      expect(getRoleLabel("viewer", t)).toBe("common.roles.viewer");
    });
  });

  describe("getPaymentMethodTypeLabel", () => {
    it("should return label for bank type", () => {
      const t = (key: string) => {
        if (key === "paymentMethods.typeBank") return "Banco";
        return key;
      };
      expect(getPaymentMethodTypeLabel("bank", t)).toBe("Banco");
    });

    it("should return label for card type", () => {
      const t = (key: string) => {
        if (key === "paymentMethods.typeCard") return "Tarjeta";
        return key;
      };
      expect(getPaymentMethodTypeLabel("card", t)).toBe("Tarjeta");
    });

    it("should return label for cash type", () => {
      const t = (key: string) => {
        if (key === "paymentMethods.typeCash") return "Efectivo";
        return key;
      };
      expect(getPaymentMethodTypeLabel("cash", t)).toBe("Efectivo");
    });

    it("should return translation result when translation not found", () => {
      const t = (key: string) => key;
      expect(getPaymentMethodTypeLabel("bank", t)).toBe("paymentMethods.typeBank");
    });
  });

  describe("PAYMENT_METHOD_ACCENT", () => {
    it("should have bg for bank", () => {
      expect(PAYMENT_METHOD_ACCENT.bank).toBeDefined();
    });

    it("should have bg for card", () => {
      expect(PAYMENT_METHOD_ACCENT.card).toBeDefined();
    });

    it("should have bg for cash", () => {
      expect(PAYMENT_METHOD_ACCENT.cash).toBeDefined();
    });
  });

  describe("STATUS_COLORS", () => {
    it("should have colors for open status", () => {
      expect(STATUS_COLORS.open).toBeDefined();
      expect(STATUS_COLORS.open.dot).toBeDefined();
      expect(STATUS_COLORS.open.bg).toBeDefined();
    });

    it("should have colors for partially_paid status", () => {
      expect(STATUS_COLORS.partially_paid).toBeDefined();
    });

    it("should have colors for paid status", () => {
      expect(STATUS_COLORS.paid).toBeDefined();
    });

    it("should have colors for overdue status", () => {
      expect(STATUS_COLORS.overdue).toBeDefined();
    });

    it("should have dot, bg, text, color for each status", () => {
      for (const status of ["open", "partially_paid", "paid", "overdue"] as const) {
        const colors = STATUS_COLORS[status];
        expect(colors.dot).toBeDefined();
        expect(colors.bg).toBeDefined();
        expect(colors.text).toBeDefined();
        expect(colors.color).toBeDefined();
      }
    });
  });

  describe("getObligationStatusLabel", () => {
    it("should call translation function with correct key for open", () => {
      const t = (key: string) => {
        if (key === "obligations.statusOpen") return "Abierta";
        return key;
      };
      expect(getObligationStatusLabel("open", t)).toBe("Abierta");
    });

    it("should call translation function with correct key for partially_paid", () => {
      const t = (key: string) => {
        if (key === "obligations.statusPartiallyPaid") return "Parcialmente pagada";
        return key;
      };
      expect(getObligationStatusLabel("partially_paid", t)).toBe("Parcialmente pagada");
    });

    it("should call translation function with correct key for paid", () => {
      const t = (key: string) => {
        if (key === "obligations.statusPaid") return "Pagada";
        return key;
      };
      expect(getObligationStatusLabel("paid", t)).toBe("Pagada");
    });

    it("should call translation function with correct key for overdue", () => {
      const t = (key: string) => {
        if (key === "obligations.statusOverdue") return "Vencida";
        return key;
      };
      expect(getObligationStatusLabel("overdue", t)).toBe("Vencida");
    });

    it("should return translation result when translation not found", () => {
      const t = (key: string) => key;
      expect(getObligationStatusLabel("open", t)).toBe("obligations.statusOpen");
    });
  });
});
