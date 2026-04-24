import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("textarea", () => {
  it("should render textarea", () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("should render textarea with placeholder", () => {
    render(<Textarea placeholder="Enter text here" />);
    expect(screen.getByPlaceholderText("Enter text here")).toBeDefined();
  });

  it("should apply custom className to textarea", () => {
    const { container } = render(<Textarea className="custom-textarea-class" />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.className).toContain("custom-textarea-class");
  });

  it("should set autocomplete to off by default", () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.getAttribute("autocomplete")).toBe("off");
  });

  it("should allow custom autocomplete value", () => {
    const { container } = render(<Textarea autoComplete="email" />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.getAttribute("autocomplete")).toBe("email");
  });

  it("should set id when provided", () => {
    const { container } = render(<Textarea id="custom-id" />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.id).toBe("custom-id");
  });

  it("should generate id when not provided", () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.id).toBeTruthy();
  });

  it("should be disabled when disabled prop is true", () => {
    const { container } = render(<Textarea disabled />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea).toBeDisabled();
  });

  it("should apply rows attribute", () => {
    const { container } = render(<Textarea rows={10} />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.getAttribute("rows")).toBe("10");
  });

  it("should render with data-slot attribute", () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea).toBeDefined();
  });

  it("should pass through standard textarea props", () => {
    const { container } = render(
      <Textarea
        name="test-name"
        maxLength={100}
        required
        aria-label="Test textarea"
      />
    );
    const textarea = container.querySelector('[data-slot="textarea"]');
    expect(textarea?.getAttribute("name")).toBe("test-name");
    expect(textarea?.getAttribute("maxlength")).toBe("100");
    expect(textarea?.required).toBe(true);
    expect(textarea?.getAttribute("aria-label")).toBe("Test textarea");
  });
});