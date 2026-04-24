import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

describe("Alert", () => {
  it("should render alert with default variant", () => {
    const { container } = render(<Alert>Alert content</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("role", "alert");
  });

  it("should render with destructive variant", () => {
    const { container } = render(<Alert variant="destructive">Destructive alert</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Alert className="custom-alert">Content</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain("custom-alert");
  });

  it("should render AlertTitle", () => {
    render(<Alert><AlertTitle>Alert Title</AlertTitle></Alert>);
    const title = screen.getByText("Alert Title");
    expect(title).toBeInTheDocument();
    expect(title.nodeName).toBe("H5");
  });

  it("should render AlertDescription", () => {
    render(<Alert><AlertDescription>Alert Description</AlertDescription></Alert>);
    const description = screen.getByText("Alert Description");
    expect(description).toBeInTheDocument();
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Alert id="alert-id" data-testid="alert-test">Content</Alert>
    );
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveAttribute("id", "alert-id");
    expect(alert).toHaveAttribute("data-testid", "alert-test");
  });
});
