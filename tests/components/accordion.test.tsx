import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

describe("accordion", () => {
  it("should render accordion item", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText("Trigger")).toBeDefined();
  });

  it("should render accordion with proper data-slot", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion"]')).toBeDefined();
  });

  it("should render accordion item with proper data-slot", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion-item"]')).toBeDefined();
  });

  it("should render accordion trigger with proper data-slot", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion-trigger"]')).toBeDefined();
  });

  it("should render accordion content with proper data-slot", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeDefined();
  });

  it("should render multiple accordion items", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const items = container.querySelectorAll('[data-slot="accordion-item"]');
    expect(items.length).toBe(2);
  });

  it("should render accordion with type multiple", () => {
    const { container } = render(
      <Accordion type="multiple">
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('[data-slot="accordion"]')).toBeDefined();
  });
});