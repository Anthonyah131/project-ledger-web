import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Pagination } from "@/components/shared/pagination";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string, params?: { start: number; end: number; total: number }) => {
      if (params) return `${params.start}-${params.end} of ${params.total}`;
      return key;
    },
  }),
}));

describe("pagination", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return null when only one page", () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={5} onPageChange={mockOnPageChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render pagination when multiple pages", () => {
    render(
      <Pagination page={1} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    expect(screen.getByText("1-10 of 25")).toBeDefined();
  });

  it("should render page buttons", () => {
    render(
      <Pagination page={1} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("should call onPageChange when page button clicked", () => {
    render(
      <Pagination page={1} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    screen.getByText("2").click();
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("should disable previous button on first page", () => {
    render(
      <Pagination page={1} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    const prevButton = screen.getByLabelText("common.previousPage");
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(
      <Pagination page={3} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    const nextButton = screen.getByLabelText("common.nextPage");
    expect(nextButton).toBeDisabled();
  });

  it("should enable next button when not on last page", () => {
    render(
      <Pagination page={1} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    const nextButton = screen.getByLabelText("common.nextPage");
    expect(nextButton).not.toBeDisabled();
  });

  it("should enable previous button when not on first page", () => {
    render(
      <Pagination page={2} pageSize={10} total={25} onPageChange={mockOnPageChange} />
    );
    const prevButton = screen.getByLabelText("common.previousPage");
    expect(prevButton).not.toBeDisabled();
  });

  it("should show dots for large page ranges", () => {
    render(
      <Pagination page={5} pageSize={10} total={100} onPageChange={mockOnPageChange} />
    );
    expect(screen.getAllByText("...").length).toBeGreaterThanOrEqual(2);
  });
});