import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { DeleteConfirmModal } from "@/components/shared/delete-confirm-modal";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("delete-confirm-modal", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render when open", () => {
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    expect(screen.getByText("Delete Item")).toBeDefined();
    expect(screen.getByText("Are you sure?")).toBeDefined();
    expect(screen.getByText("This action cannot be undone.")).toBeDefined();
  });

  it("should not render when closed", () => {
    const { container } = render(
      <DeleteConfirmModal
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should call onConfirm when delete button clicked", async () => {
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    screen.getByText("common.delete").click();
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should call onClose when cancel button clicked", () => {
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    screen.getByText("common.cancel").click();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show deleting state when submitting", async () => {
    mockOnConfirm.mockImplementation(() => new Promise(() => {}));
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    screen.getByText("common.delete").click();
    await waitFor(() => {
      expect(screen.getByText("common.deleting")).toBeDefined();
    });
  });

  it("should close modal when onConfirm returns true", async () => {
    mockOnConfirm.mockResolvedValue(true);
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    await screen.getByText("common.delete").click();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should not close modal when onConfirm returns false", async () => {
    mockOnConfirm.mockResolvedValue(false);
    render(
      <DeleteConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        description="Are you sure?"
        message="This action cannot be undone."
      />
    );
    await screen.getByText("common.delete").click();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});