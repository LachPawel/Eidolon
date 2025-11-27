import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductionStats, type ProductionStatsData } from "./ProductionStats";

describe("ProductionStats", () => {
  const mockStats: ProductionStatsData = {
    activeJobs: 12,
    efficiency: 87,
    bottleneckStage: "Assembly",
    completedJobs: 45,
  };

  it("renders all stat cards", () => {
    render(<ProductionStats stats={mockStats} />);

    expect(screen.getByText("Active Jobs")).toBeInTheDocument();
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
    expect(screen.getByText("Bottlenecks")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("displays correct values", () => {
    render(<ProductionStats stats={mockStats} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("Assembly")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("renders without stats (undefined)", () => {
    render(<ProductionStats />);

    // Should show dashes when stats are undefined
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("renders with high efficiency", () => {
    const highEfficiencyStats: ProductionStatsData = {
      ...mockStats,
      efficiency: 99,
    };

    render(<ProductionStats stats={highEfficiencyStats} />);

    expect(screen.getByText("99%")).toBeInTheDocument();
  });

  it("displays dash for bottleneck when set to None", () => {
    const noBottleneckStats: ProductionStatsData = {
      ...mockStats,
      bottleneckStage: "None",
    };

    render(<ProductionStats stats={noBottleneckStats} />);

    // The bottleneck section should show a dash
    const bottleneckLabel = screen.getByText("Bottlenecks");
    const bottleneckCard = bottleneckLabel.parentElement?.parentElement;
    expect(bottleneckCard?.textContent).toContain("-");
  });
});
