import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EmptyState } from "@/components/shared/empty-state";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("empty-state", () => {
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    mockOnCreate.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render without search", () => {
    render(<EmptyState hasSearch={false} onCreate={mockOnCreate} />);
    expect(screen.getByText("common.noRecords")).toBeDefined();
  });

  it("should render with search", () => {
    render(<EmptyState hasSearch={true} onCreate={mockOnCreate} />);
    expect(screen.getByText("common.noResults")).toBeDefined();
  });

  it("should show custom title", () => {
    render(<EmptyState hasSearch={false} onCreate={mockOnCreate} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeDefined();
  });

  it("should show custom description", () => {
    render(<EmptyState hasSearch={false} onCreate={mockOnCreate} description="Custom Description" />);
    expect(screen.getByText("Custom Description")).toBeDefined();
  });

  it("should render create button when not searching", () => {
    render(<EmptyState hasSearch={false} onCreate={mockOnCreate} />);
    expect(screen.queryByRole("button", { name: /common.createNew/i })).toBeDefined();
  });

  it("should hide create button when searching", () => {
    render(<EmptyState hasSearch={true} onCreate={mockOnCreate} />);
    expect(screen.queryByRole("button", { name: /common.createNew/i })).toBeNull();
  });
});