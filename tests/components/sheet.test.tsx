import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet";

describe("sheet", () => {
  it("should render sheet", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
      </Sheet>
    );
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("should render sheet trigger", () => {
    const { container } = render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-trigger"]')).toBeDefined();
  });

  it("should render sheet content", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-content"]')).toBeDefined();
  });

  it("should render sheet header", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>Header</SheetHeader>
        </SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-header"]')).toBeDefined();
  });

  it("should render sheet footer", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetFooter>Footer</SheetFooter>
        </SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-footer"]')).toBeDefined();
  });

  it("should render sheet title", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-title"]')).toBeDefined();
  });

  it("should render sheet description", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-description"]')).toBeDefined();
  });

  it("should render sheet overlay", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-overlay"]')).toBeDefined();
  });

  it("should render sheet portal", () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    expect(container.querySelector('[data-slot="sheet-portal"]')).toBeDefined();
  });
});