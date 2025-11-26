import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShopFloorCards } from "./ShopFloorCards";

describe("ShopFloorCards", () => {
  it("renders all three shop floor cards", () => {
    render(<ShopFloorCards />);

    expect(screen.getByText("Injection Molding")).toBeInTheDocument();
    expect(screen.getByText("Hardness Test")).toBeInTheDocument();
    expect(screen.getByText("Final QC Check")).toBeInTheDocument();
  });

  it("renders batch information", () => {
    render(<ShopFloorCards />);

    expect(screen.getByText("Batch #8821 - In Progress")).toBeInTheDocument();
    expect(screen.getByText("Spec: 56-58 HRC")).toBeInTheDocument();
    expect(screen.getByText("Visual Inspection")).toBeInTheDocument();
  });

  it("renders AI hints for all cards", () => {
    render(<ShopFloorCards />);

    expect(screen.getByText(/pressure drop detected/i)).toBeInTheDocument();
    expect(screen.getByText(/verify calibration/i)).toBeInTheDocument();
    expect(screen.getByText(/focus on surface texture/i)).toBeInTheDocument();
  });

  it("renders timestamps", () => {
    render(<ShopFloorCards />);

    expect(screen.getByText("Started 10:42 AM")).toBeInTheDocument();
    expect(screen.getByText("Pending QC")).toBeInTheDocument();
    expect(screen.getByText("Scheduled 14:00")).toBeInTheDocument();
  });
});
