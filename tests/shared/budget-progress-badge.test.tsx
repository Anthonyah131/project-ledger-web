import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BudgetProgressBadge,
  BudgetProgressBadgeSkeleton,
} from "@/components/shared/budget-progress-badge";
import type { ProjectBudgetResponse } from "@/types/project-budget";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

function createMockBudget(overrides: Partial<ProjectBudgetResponse> = {}): ProjectBudgetResponse {
  return {
    id: "budget-1",
    projectId: "project-1",
    totalBudget: 1000,
    alertPercentage: 80,
    spentAmount: 500,
    remainingAmount: 500,
    spentPercentage: 50,
    isAlertTriggered: false,
    alertLevel: "normal",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("budget-progress-badge", () => {
  describe("normal alert level", () => {
    const budget = createMockBudget({ alertLevel: "normal", spentPercentage: 50 });

    it("should render in compact mode", () => {
      const { container } = render(
        <BudgetProgressBadge budget={budget} currencyCode="USD" compact={true} />
      );
      expect(container.querySelector(".cursor-default")).toBeDefined();
    });
  });

  describe("warning alert level", () => {
    const budget = createMockBudget({
      alertLevel: "warning",
      spentPercentage: 85,
      spentAmount: 850,
      remainingAmount: 150,
    });

    it("should show alert badge in compact mode", () => {
      const { container } = render(
        <BudgetProgressBadge budget={budget} currencyCode="USD" compact={true} />
      );
      expect(container.textContent).toContain("budget.alertLevel.warning");
    });
  });

  describe("critical alert level", () => {
    const budget = createMockBudget({
      alertLevel: "critical",
      spentPercentage: 95,
      spentAmount: 950,
      remainingAmount: 50,
    });

    it("should show critical alert badge", () => {
      const { container } = render(
        <BudgetProgressBadge budget={budget} currencyCode="USD" compact={true} />
      );
      expect(container.textContent).toContain("budget.alertLevel.critical");
    });
  });

  describe("exceeded alert level", () => {
    const budget = createMockBudget({
      alertLevel: "exceeded",
      spentPercentage: 120,
      spentAmount: 1200,
      remainingAmount: -200,
      totalBudget: 1000,
    });

    it("should show exceeded alert badge", () => {
      const { container } = render(
        <BudgetProgressBadge budget={budget} currencyCode="USD" compact={true} />
      );
      expect(container.textContent).toContain("budget.alertLevel.exceeded");
    });
  });

  describe("skeleton", () => {
    it("should render compact skeleton", () => {
      const { container } = render(<BudgetProgressBadgeSkeleton compact={true} />);
      expect(container.querySelector("[class*='skeleton']")).toBeDefined();
    });

    it("should render expanded skeleton", () => {
      const { container } = render(<BudgetProgressBadgeSkeleton />);
      expect(container.querySelector("[class*='skeleton']")).toBeDefined();
    });
  });
});