import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

describe("dialog", () => {
  it("should render dialog trigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByText("Open Dialog")).toBeDefined();
  });

  it("should render dialog header", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">Header</DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-header"]')).toBeDefined();
  });

  it("should render dialog title", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-title"]')).toBeDefined();
    expect(screen.getByText("Title")).toBeDefined();
  });

  it("should render dialog description", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-description"]')).toBeDefined();
    expect(screen.getByText("Description")).toBeDefined();
  });

  it("should render dialog footer", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-footer"]')).toBeDefined();
  });

  it("should render dialog close", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-close"]')).toBeDefined();
  });

  it("should render dialog overlay", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-overlay"]')).toBeDefined();
  });

  it("should render dialog portal", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-portal"]')).toBeDefined();
  });

  it("should render dialog content", () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    expect(container.querySelector('[data-slot="dialog-content"]')).toBeDefined();
  });
});