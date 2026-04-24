import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("should render label element", () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("should apply custom className", () => {
    const { container } = render(<Label className="custom-label">Test</Label>);
    const label = container.firstChild as HTMLElement;
    expect(label.className).toContain("custom-label");
  });

  it("should forward htmlFor prop", () => {
    const { container } = render(<Label htmlFor="test-input">Test Label</Label>);
    const label = container.firstChild as HTMLElement;
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Label id="label-id" data-testid="label-test">
        Test Label
      </Label>
    );
    const label = container.firstChild as HTMLElement;
    expect(label).toHaveAttribute("id", "label-id");
    expect(label).toHaveAttribute("data-testid", "label-test");
  });

  it("should render as label element", () => {
    const { container } = render(<Label>Test</Label>);
    expect(container.firstChild?.nodeName).toBe("LABEL");
  });
});
