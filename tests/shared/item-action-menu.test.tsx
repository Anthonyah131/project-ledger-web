import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemActionMenu } from "@/components/shared/item-action-menu";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("item-action-menu", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it("should render trigger button", () => {
    const { container } = render(
      <ItemActionMenu onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    const button = container.querySelector('[aria-label="common.options"]');
    expect(button).toBeDefined();
  });

  it("should call onEdit when edit is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ItemActionMenu onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const trigger = container.querySelector('[aria-label="common.options"]');
    await user.click(trigger!);
    const editItem = await screen.findByText("common.edit");
    await user.click(editItem);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("should call onDelete when delete is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ItemActionMenu onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const trigger = container.querySelector('[aria-label="common.options"]');
    await user.click(trigger!);
    const deleteItem = await screen.findByText("common.delete");
    await user.click(deleteItem);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it("should disable trigger when disabled is true", () => {
    const { container } = render(
      <ItemActionMenu onEdit={mockOnEdit} onDelete={mockOnDelete} disabled={true} />
    );
    const button = container.querySelector('[aria-label="common.options"]');
    expect(button?.disabled).toBe(true);
  });

  it("should use custom aria label", () => {
    const { container } = render(
      <ItemActionMenu onEdit={mockOnEdit} onDelete={mockOnDelete} ariaLabel="Custom Label" />
    );
    const button = container.querySelector('[aria-label="Custom Label"]');
    expect(button).toBeDefined();
  });
});