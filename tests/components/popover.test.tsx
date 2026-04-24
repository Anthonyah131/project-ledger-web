import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverAnchor } from "@/components/ui/popover";

describe("popover", () => {
  it("should render popover", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("should render popover trigger", () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-trigger"]')).toBeDefined();
  });

  it("should render popover content", () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-content"]')).toBeDefined();
  });

  it("should render popover header", () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>Header</PopoverHeader>
        </PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-header"]')).toBeDefined();
  });

  it("should render popover title", () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Title</PopoverTitle>
        </PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-title"]')).toBeDefined();
  });

  it("should render popover description", () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverDescription>Description</PopoverDescription>
        </PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-description"]')).toBeDefined();
  });

  it("should render popover anchor", () => {
    const { container } = render(
      <Popover open>
        <PopoverAnchor>Anchor</PopoverAnchor>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(container.querySelector('[data-slot="popover-anchor"]')).toBeDefined();
  });
});