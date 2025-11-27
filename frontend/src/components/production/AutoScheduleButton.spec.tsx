import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AutoScheduleButton } from "./AutoScheduleButton";

describe("AutoScheduleButton", () => {
  it("renders correctly in idle state", () => {
    render(<AutoScheduleButton onClick={() => {}} isPending={false} />);

    expect(screen.getByText("Auto-Schedule")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("renders correctly in pending state", () => {
    render(<AutoScheduleButton onClick={() => {}} isPending={true} />);

    expect(screen.getByText("Optimizing...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<AutoScheduleButton onClick={handleClick} isPending={false} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<AutoScheduleButton onClick={handleClick} isPending={true} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
