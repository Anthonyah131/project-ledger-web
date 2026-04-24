import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("should render input element", () => {
    const { container } = render(<Input />);
    const input = container.firstChild as HTMLElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-input" />);
    const input = container.firstChild as HTMLElement;
    expect(input.className).toContain("custom-input");
  });

  it("should generate unique id with useId", () => {
    const { container } = render(<Input />);
    const input = container.firstChild as HTMLElement;
    expect(input.id).toBeDefined();
  });

  it("should use provided id", () => {
    const { container } = render(<Input id="test-id" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("id", "test-id");
  });

  it("should set email autocomplete for email type", () => {
    const { container } = render(<Input type="email" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("should set tel autocomplete for tel type", () => {
    const { container } = render(<Input type="tel" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("autocomplete", "tel");
  });

  it("should set url autocomplete for url type", () => {
    const { container } = render(<Input type="url" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("autocomplete", "url");
  });

  it("should not set autocomplete for password type by default", () => {
    const { container } = render(<Input type="password" />);
    const input = container.firstChild as HTMLElement;
    expect(input).not.toHaveAttribute("autocomplete");
  });

  it("should disable autocomplete for other types by default", () => {
    const { container } = render(<Input type="text" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Input
        type="email"
        placeholder="Enter email"
        name="email"
        data-testid="input-test"
      />
    );
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveAttribute("placeholder", "Enter email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("data-testid", "input-test");
  });

  it("should apply disabled state", () => {
    const { container } = render(<Input disabled />);
    const input = container.firstChild as HTMLElement;
    expect(input).toBeDisabled();
  });

  it("should render as input element", () => {
    const { container } = render(<Input />);
    expect(container.firstChild?.nodeName).toBe("INPUT");
  });
});
