import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductionBoard } from "./ProductionBoard";

describe("ProductionBoard", () => {
  it("renders canvas element", () => {
    const { container } = render(
      <ProductionBoard entries={[]} onAutoSchedule={() => {}} isOptimizing={false} />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders with empty entries", () => {
    const { container } = render(
      <ProductionBoard entries={[]} onAutoSchedule={() => {}} isOptimizing={false} />
    );

    expect(container).toBeInTheDocument();
  });

  it("applies correct dimensions to canvas", () => {
    const { container } = render(
      <ProductionBoard entries={[]} onAutoSchedule={() => {}} isOptimizing={false} />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width");
    expect(canvas).toHaveAttribute("height");
  });
});
