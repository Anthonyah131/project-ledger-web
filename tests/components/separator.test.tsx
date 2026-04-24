import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator", () => {
  it("should render separator component", () => {
    render(<Separator />);
    const separator = document.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
  });

  it("should have data-slot attribute", () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute("data-slot", "separator");
  });

  it("should default to horizontal orientation", () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("should render with vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });

  it("should accept decorative prop without error", () => {
    const { container } = render(<Separator decorative={true} />);
    const separator = container.firstChild as HTMLElement;
    expect(separator).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Separator className="custom-separator" />);
    const separator = container.firstChild as HTMLElement;
    expect(separator.className).toContain("custom-separator");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Separator id="separator-id" data-testid="separator-test" />
    );
    const separator = container.firstChild as HTMLElement;
    expect(separator).toHaveAttribute("id", "separator-id");
    expect(separator).toHaveAttribute("data-testid", "separator-test");
  });
});
