import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductionBoard } from "./ProductionBoard";
import { Providers } from "@/components/Providers";

describe("ProductionBoard", () => {
  it("renders canvas element", () => {
    const { container } = render(
      <Providers>
        <ProductionBoard />
      </Providers>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders component without crashing", () => {
    const { container } = render(
      <Providers>
        <ProductionBoard />
      </Providers>
    );

    expect(container).toBeInTheDocument();
  });

  it("applies correct dimensions to canvas", () => {
    const { container } = render(
      <Providers>
        <ProductionBoard />
      </Providers>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("width");
    expect(canvas).toHaveAttribute("height");
  });
});
