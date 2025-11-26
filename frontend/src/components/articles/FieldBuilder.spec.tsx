import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FieldBuilder } from "./FieldBuilder";
import type { FieldInput } from "@/types";

const mockField: FieldInput = {
  fieldKey: "test_field",
  fieldLabel: "Test Field",
  fieldType: "text",
  scope: "attribute",
  validation: {
    required: false,
  },
};

describe("FieldBuilder", () => {
  it("renders field label input", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const labelInput = screen.getByLabelText(/field label/i);
    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveValue("Test Field");
  });

  it("renders field key input", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const keyInput = screen.getByLabelText(/field key/i);
    expect(keyInput).toBeInTheDocument();
    expect(keyInput).toHaveValue("test_field");
  });

  it("renders field type dropdown", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const typeSelect = screen.getByLabelText(/field type/i);
    expect(typeSelect).toBeInTheDocument();
    expect(typeSelect).toHaveValue("text");
  });

  it("renders remove button", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();
  });

  it("calls onRemove when remove button clicked", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("calls onUpdate when label changes", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const labelInput = screen.getByLabelText(/field label/i);
    fireEvent.change(labelInput, { target: { value: "New Label" } });

    expect(onUpdate).toHaveBeenCalled();
  });

  it("generates field key from label", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const fieldWithEmptyKey = { ...mockField, fieldKey: "" };
    render(<FieldBuilder field={fieldWithEmptyKey} onUpdate={onUpdate} onRemove={onRemove} />);

    const labelInput = screen.getByLabelText(/field label/i);
    fireEvent.change(labelInput, { target: { value: "My Test Field" } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldLabel: "My Test Field",
        fieldKey: "my_test_field",
      })
    );
  });

  it("renders required checkbox", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(<FieldBuilder field={mockField} onUpdate={onUpdate} onRemove={onRemove} />);

    const requiredCheckbox = screen.getByLabelText(/required/i);
    expect(requiredCheckbox).toBeInTheDocument();
  });

  it("renders number type specific fields when type is number", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const numberField = { ...mockField, fieldType: "number" as const };
    render(<FieldBuilder field={numberField} onUpdate={onUpdate} onRemove={onRemove} />);

    expect(screen.getByLabelText(/minimum value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum value/i)).toBeInTheDocument();
  });

  it("renders options input when type is select", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const selectField = {
      ...mockField,
      fieldType: "select" as const,
      validation: { required: false, options: ["Option 1", "Option 2"] },
    };
    render(<FieldBuilder field={selectField} onUpdate={onUpdate} onRemove={onRemove} />);

    expect(screen.getByPlaceholderText(/add option/i)).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("adds new option when add button clicked", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const selectField = {
      ...mockField,
      fieldType: "select" as const,
      validation: { required: false, options: [] },
    };
    render(<FieldBuilder field={selectField} onUpdate={onUpdate} onRemove={onRemove} />);

    const optionInput = screen.getByPlaceholderText(/add option/i);
    fireEvent.change(optionInput, { target: { value: "New Option" } });

    const addButton = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addButton);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        validation: expect.objectContaining({
          options: ["New Option"],
        }),
      })
    );
  });

  it("removes option when remove button clicked", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    const selectField = {
      ...mockField,
      fieldType: "select" as const,
      validation: { required: false, options: ["Option 1", "Option 2"] },
    };
    render(<FieldBuilder field={selectField} onUpdate={onUpdate} onRemove={onRemove} />);

    const removeButtons = screen.getAllByRole("button", { name: /remove option/i });
    fireEvent.click(removeButtons[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        validation: expect.objectContaining({
          options: ["Option 2"],
        }),
      })
    );
  });
});
