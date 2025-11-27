import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductionVisual } from "./ProductionVisual";

describe("ProductionVisual", () => {
  it("renders the production schedule header", () => {
    render(<ProductionVisual />);
    expect(screen.getByText("Production Schedule")).toBeInTheDocument();
    expect(screen.getByText(/Week 42/)).toBeInTheDocument();
  });

  it("renders all resources", () => {
    render(<ProductionVisual />);
    expect(screen.getByText("Inj. Mold A")).toBeInTheDocument();
    expect(screen.getByText("Assembly 1")).toBeInTheDocument();
    expect(screen.getByText("Packaging")).toBeInTheDocument();
  });

  it("renders order information", () => {
    render(<ProductionVisual />);
    expect(screen.getByText("Order #4421")).toBeInTheDocument();
    expect(screen.getByText("Order #4425")).toBeInTheDocument();
    expect(screen.getByText("Order #4419")).toBeInTheDocument();
  });

  it("renders status indicators", () => {
    render(<ProductionVisual />);
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Delayed 15m")).toBeInTheDocument();
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("renders AI insight", () => {
    render(<ProductionVisual />);
    expect(screen.getByText("AI Insight:")).toBeInTheDocument();
    expect(screen.getByText(/Moving Order #4425 to Line B/)).toBeInTheDocument();
  });
});
