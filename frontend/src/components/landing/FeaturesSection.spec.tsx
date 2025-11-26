import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturesSectionWithHoverEffects } from "./FeaturesSection";

describe("FeaturesSectionWithHoverEffects", () => {
  it("renders all 8 features", () => {
    render(<FeaturesSectionWithHoverEffects />);

    expect(screen.getByText("Dynamic Schema Engine")).toBeInTheDocument();
    expect(screen.getByText("AI-Assisted Definition")).toBeInTheDocument();
    expect(screen.getByText("Validated Data Collection")).toBeInTheDocument();
    expect(screen.getByText("Intelligent Search")).toBeInTheDocument();
    expect(screen.getByText("Migration Ready")).toBeInTheDocument();
    expect(screen.getByText("IoT Integration")).toBeInTheDocument();
    expect(screen.getByText("Digital Audit Trails")).toBeInTheDocument();
    expect(screen.getByText("Multi-Platform")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<FeaturesSectionWithHoverEffects />);

    expect(screen.getByText(/define custom fields, color pallets/i)).toBeInTheDocument();
    expect(screen.getByText(/our ai suggests industry standard fields/i)).toBeInTheDocument();
  });

  it("renders feature icons", () => {
    const { container } = render(<FeaturesSectionWithHoverEffects />);

    // Check that SVG icons are rendered
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("applies grid layout classes", () => {
    const { container } = render(<FeaturesSectionWithHoverEffects />);

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass("lg:grid-cols-4");
  });
});
