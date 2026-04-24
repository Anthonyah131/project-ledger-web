import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render with default variant and size", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("should render with different variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const;

    variants.forEach((variant) => {
      const { container } = render(
        <Button variant={variant}>{variant} Button</Button>
      );
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveAttribute("data-variant", variant);
    });
  });

  it("should render with different sizes", () => {
    const sizes = [
      "default",
      "xs",
      "sm",
      "lg",
      "icon",
      "icon-xs",
      "icon-sm",
      "icon-lg",
    ] as const;

    sizes.forEach((size) => {
      const { container } = render(
        <Button size={size}>{size} Button</Button>
      );
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveAttribute("data-size", size);
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Button className="custom-class">Custom Button</Button>
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Button id="test-id" data-testid="button-test" type="submit">
        Test Button
      </Button>
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveAttribute("id", "test-id");
    expect(button).toHaveAttribute("data-testid", "button-test");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should render as button element by default", () => {
    const { container } = render(<Button>Text Button</Button>);
    expect(container.firstChild?.nodeName).toBe("BUTTON");
  });
});
