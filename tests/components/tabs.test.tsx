import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("tabs", () => {
  it("should render tabs components", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeDefined();
    expect(screen.getByText("Tab 2")).toBeDefined();
  });

  it("should render tabs list", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(container.querySelector('[data-slot="tabs-list"]')).toBeDefined();
  });

  it("should render tabs trigger", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(container.querySelector('[data-slot="tabs-trigger"]')).toBeDefined();
  });

  it("should render tabs content", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[data-slot="tabs-content"]')).toBeDefined();
  });

  it("should render with default variant", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const tabsList = container.querySelector('[data-slot="tabs-list"]');
    expect(tabsList?.getAttribute("data-variant")).toBe("default");
  });

  it("should render with line variant", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList variant="line">
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const tabsList = container.querySelector('[data-slot="tabs-list"]');
    expect(tabsList?.getAttribute("data-variant")).toBe("line");
  });

  it("should set orientation attribute", () => {
    const { container } = render(
      <Tabs defaultValue="tab1" orientation="vertical">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const tabs = container.querySelector('[data-slot="tabs"]');
    expect(tabs?.getAttribute("data-orientation")).toBe("vertical");
  });
});