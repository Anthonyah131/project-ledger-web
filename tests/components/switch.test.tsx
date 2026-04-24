import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("should render switch element", () => {
    const { container } = render(<Switch />);
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("data-slot", "switch");
  });

  it("should have default size by default", () => {
    const { container } = render(<Switch />);
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl).toHaveAttribute("data-size", "default");
  });

  it("should render with small size", () => {
    const { container } = render(<Switch size="sm" />);
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl).toHaveAttribute("data-size", "sm");
  });

  it("should apply custom className", () => {
    const { container } = render(<Switch className="custom-switch" />);
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl.className).toContain("custom-switch");
  });

  it("should be disabled when disabled prop is true", () => {
    const { container } = render(<Switch disabled />);
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl).toBeDisabled();
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Switch id="switch-id" data-testid="switch-test" />
    );
    const switchEl = container.firstChild as HTMLElement;
    expect(switchEl).toHaveAttribute("id", "switch-id");
    expect(switchEl).toHaveAttribute("data-testid", "switch-test");
  });
});
