import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppFooter } from "@/components/shared/app-footer";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("app-footer", () => {
  it("should render site name", () => {
    const { container } = render(<AppFooter />);
    expect(container.querySelector("footer")).toBeDefined();
    expect(container.textContent).toContain("Project Ledger");
  });

  it("should render social links", () => {
    const { container } = render(<AppFooter />);
    expect(container.querySelector('[aria-label="GitHub"]')).toBeDefined();
    expect(container.querySelector('[aria-label="LinkedIn"]')).toBeDefined();
    expect(container.querySelector('[aria-label="Instagram"]')).toBeDefined();
    expect(container.querySelector('[aria-label="Email"]')).toBeDefined();
  });

  it("should render footer structure", () => {
    const { container } = render(<AppFooter />);
    expect(container.querySelector("footer")).toBeDefined();
  });
});