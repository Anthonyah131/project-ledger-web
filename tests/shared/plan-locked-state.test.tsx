import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanLockedState } from "@/components/shared/plan-locked-state";

const mockPush = vi.fn();

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("plan-locked-state", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render lock icon", () => {
    render(<PlanLockedState />);
    const lockIcon = document.querySelector("svg");
    expect(lockIcon).toBeDefined();
  });

  it("should render default title", () => {
    render(<PlanLockedState />);
    expect(screen.getByText("common.planLocked.title")).toBeDefined();
  });

  it("should render default description", () => {
    render(<PlanLockedState />);
    expect(screen.getByText("common.planLocked.description")).toBeDefined();
  });

  it("should render custom title when provided", () => {
    render(<PlanLockedState title="Custom Locked Title" />);
    expect(screen.getByText("Custom Locked Title")).toBeDefined();
  });

  it("should render custom description when provided", () => {
    render(<PlanLockedState description="Custom locked description text" />);
    expect(screen.getByText("Custom locked description text")).toBeDefined();
  });

  it("should render upgrade button", () => {
    render(<PlanLockedState />);
    expect(screen.getByText("common.upgrade")).toBeDefined();
  });

  it("should navigate to billing when upgrade clicked", async () => {
    const user = userEvent.setup();
    render(<PlanLockedState />);

    await user.click(screen.getByText("common.upgrade"));

    expect(mockPush).toHaveBeenCalledWith("/settings/billing");
  });
});