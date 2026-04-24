import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("should render with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-variant", "default");
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("should render with different variants", () => {
    const variants = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "ghost",
      "link",
    ] as const;

    variants.forEach((variant) => {
      const { container } = render(
        <Badge variant={variant}>{variant} Badge</Badge>
      );
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute("data-variant", variant);
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Badge className="custom-class">Custom Badge</Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("custom-class");
  });

  it("should render as span by default", () => {
    const { container } = render(<Badge>Text Badge</Badge>);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Badge id="test-id" data-testid="badge-test">
        Test Badge
      </Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveAttribute("id", "test-id");
    expect(badge).toHaveAttribute("data-testid", "badge-test");
  });
});
