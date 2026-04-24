import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectGroup, SelectSeparator } from "@/components/ui/select";

describe("select", () => {
  it("should render select trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText("Select an option")).toBeDefined();
  });

  it("should render select value", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-value"]')).toBeDefined();
  });

  it("should render select trigger with data-slot", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Test" />
        </SelectTrigger>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-trigger"]')).toBeDefined();
  });

  it("should render select group", () => {
    const { container } = render(
      <Select>
        <SelectGroup data-testid="select-group">
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
        </SelectGroup>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-group"]')).toBeDefined();
  });

  it("should render select label within group", () => {
    const { container } = render(
      <Select>
        <SelectGroup>
          <SelectLabel>Group Label</SelectLabel>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
        </SelectGroup>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-label"]')).toBeDefined();
    expect(screen.getByText("Group Label")).toBeDefined();
  });

  it("should render select separator", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectSeparator data-testid="select-separator" />
          <SelectItem value="opt2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-separator"]')).toBeDefined();
  });

  it("should render select item indicator", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(container.querySelector('[data-slot="select-item-indicator"]')).toBeDefined();
  });
});