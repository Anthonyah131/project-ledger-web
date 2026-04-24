import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

describe("dropdown-menu", () => {
  it("should render dropdown menu", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("should render dropdown menu trigger", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeDefined();
  });

  it("should render dropdown menu content", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-content"]')).toBeDefined();
  });

  it("should render dropdown menu item", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-item"]')).toBeDefined();
  });

  it("should render dropdown menu label", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-label"]')).toBeDefined();
  });

  it("should render dropdown menu separator", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-separator"]')).toBeDefined();
  });

  it("should render dropdown menu group", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>Group</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-group"]')).toBeDefined();
  });

  it("should render dropdown menu checkbox item", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false}>Checkbox</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeDefined();
  });

  it("should render dropdown menu radio group", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>Radio Group</DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-radio-group"]')).toBeDefined();
  });

  it("should render dropdown menu radio item", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioItem>Radio</DropdownMenuRadioItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container.querySelector('[data-slot="dropdown-menu-radio-item"]')).toBeDefined();
  });
});