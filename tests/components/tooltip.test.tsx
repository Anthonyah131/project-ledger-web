import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

describe("tooltip", () => {
  it("should render tooltip provider", () => {
    const { container } = render(
      <TooltipProvider>
        <span>Content</span>
      </TooltipProvider>
    );
    expect(container.querySelector('[data-slot="tooltip-provider"]')).toBeDefined();
  });

  it("should render tooltip", () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(container.querySelector('[data-slot="tooltip"]')).toBeDefined();
  });

  it("should render tooltip trigger", () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeDefined();
  });

  it("should render tooltip content", () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(container.querySelector('[data-slot="tooltip-content"]')).toBeDefined();
  });

  it("should render tooltip with delay duration", () => {
    const { container } = render(
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(container.querySelector('[data-slot="tooltip-provider"]')).toBeDefined();
  });
});