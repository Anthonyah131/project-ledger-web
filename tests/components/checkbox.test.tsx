import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("should render checkbox element", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
  });

  it("should apply custom className", () => {
    const { container } = render(<Checkbox className="custom-checkbox" />);
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox.className).toContain("custom-checkbox");
  });

  it("should be unchecked by default", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox).not.toBeChecked();
  });

  it("should be checked when defaultChecked is true", () => {
    const { container } = render(<Checkbox defaultChecked />);
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox).toBeChecked();
  });

  it("should be disabled when disabled prop is true", () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox).toBeDisabled();
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Checkbox id="checkbox-id" data-testid="checkbox-test" />
    );
    const checkbox = container.firstChild as HTMLElement;
    expect(checkbox).toHaveAttribute("id", "checkbox-id");
    expect(checkbox).toHaveAttribute("data-testid", "checkbox-test");
  });
});
