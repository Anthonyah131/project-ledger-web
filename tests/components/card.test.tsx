import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";

describe("Card", () => {
  it("should render Card component", () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("data-slot", "card");
  });

  it("should render CardHeader component", () => {
    render(<CardHeader>Header Content</CardHeader>);
    const header = screen.getByText("Header Content");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-slot", "card-header");
  });

  it("should render CardTitle component", () => {
    render(<CardTitle>Card Title</CardTitle>);
    const title = screen.getByText("Card Title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("data-slot", "card-title");
  });

  it("should render CardDescription component", () => {
    render(<CardDescription>Card Description</CardDescription>);
    const description = screen.getByText("Card Description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute("data-slot", "card-description");
  });

  it("should render CardAction component", () => {
    render(<CardAction>Action Content</CardAction>);
    const action = screen.getByText("Action Content");
    expect(action).toBeInTheDocument();
    expect(action).toHaveAttribute("data-slot", "card-action");
  });

  it("should render CardContent component", () => {
    render(<CardContent>Content</CardContent>);
    const content = screen.getByText("Content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "card-content");
  });

  it("should render CardFooter component", () => {
    render(<CardFooter>Footer Content</CardFooter>);
    const footer = screen.getByText("Footer Content");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("data-slot", "card-footer");
  });

  it("should apply custom className to Card", () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("custom-card");
  });

  it("should apply custom className to CardHeader", () => {
    const { container } = render(<CardHeader className="custom-header">Content</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header.className).toContain("custom-header");
  });

  it("should apply custom className to CardContent", () => {
    const { container } = render(<CardContent className="custom-content">Content</CardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content.className).toContain("custom-content");
  });

  it("should forward additional props", () => {
    const { container } = render(
      <Card id="card-id" data-testid="card-test">Content</Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute("id", "card-id");
    expect(card).toHaveAttribute("data-testid", "card-test");
  });
});
