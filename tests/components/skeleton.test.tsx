import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("should render skeleton component", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
  });

  it("should have data-slot attribute", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain("custom-skeleton");
    expect(skeleton.className).toContain("bg-accent");
    expect(skeleton.className).toContain("animate-pulse");
    expect(skeleton.className).toContain("rounded-md");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Skeleton id="skeleton-id" data-testid="skeleton-test" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("id", "skeleton-id");
    expect(skeleton).toHaveAttribute("data-testid", "skeleton-test");
  });

  it("should render as div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});
