import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/form-modal";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

function TestFormWrapper({
  open,
  onClose,
  title,
  description,
  onSubmit,
  submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const form = useForm();
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      form={form}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
    >
      <input data-testid="child-input" />
    </FormModal>
  );
}

describe("form-modal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it("should render with title and description", () => {
    render(
      <TestFormWrapper
        open={true}
        onClose={mockOnClose}
        title="Test Title"
        description="Test Description"
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );
    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
  });

  it("should not render when open is false", () => {
    const { container } = render(
      <TestFormWrapper
        open={false}
        onClose={mockOnClose}
        title="Test Title"
        description="Test Description"
        onSubmit={mockOnSubmit}
        submitLabel="Save"
      />
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });
});