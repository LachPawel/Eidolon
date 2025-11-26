import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InteractiveDemo } from "./InteractiveDemo";

describe("InteractiveDemo", () => {
  it("renders configuration sidebar", () => {
    render(<InteractiveDemo />);

    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Article Definition")).toBeInTheDocument();
  });

  it("renders shopfloor view section", () => {
    render(<InteractiveDemo />);

    expect(screen.getByText("Shopfloor View")).toBeInTheDocument();
    expect(screen.getByText("Live Connection")).toBeInTheDocument();
  });

  it("renders plastic and metal component buttons", () => {
    render(<InteractiveDemo />);

    expect(screen.getByText("Plastic Component")).toBeInTheDocument();
    expect(screen.getByText("Metal Component")).toBeInTheDocument();
  });

  it("starts with plastic component selected", () => {
    render(<InteractiveDemo />);

    expect(screen.getByText("Injection Molded Casing")).toBeInTheDocument();
    expect(screen.getByText("ART-8821")).toBeInTheDocument();
    expect(screen.getByText("Polymer Type")).toBeInTheDocument();
  });

  it("switches to metal component when clicked", () => {
    render(<InteractiveDemo />);

    const metalButton = screen.getByText("Metal Component");
    fireEvent.click(metalButton);

    expect(screen.getByText("Titanium Structural Mount")).toBeInTheDocument();
    expect(screen.getByText("ART-9942")).toBeInTheDocument();
    expect(screen.getByText("Alloy Grade")).toBeInTheDocument();
  });

  it("renders AI hint for current selection", () => {
    render(<InteractiveDemo />);

    expect(screen.getByText("Eidolon AI")).toBeInTheDocument();
    expect(screen.getByText(/shrinkage rate/i)).toBeInTheDocument();
  });

  it("updates AI hint when switching components", () => {
    render(<InteractiveDemo />);

    const metalButton = screen.getByText("Metal Component");
    fireEvent.click(metalButton);

    expect(screen.getByText(/surface roughness/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<InteractiveDemo />);

    expect(screen.getByRole("button", { name: /submit record/i })).toBeInTheDocument();
  });

  it("renders form fields based on selected type", () => {
    render(<InteractiveDemo />);

    // Plastic fields
    expect(screen.getByText("Polymer Type")).toBeInTheDocument();
    expect(screen.getByText("Color Code")).toBeInTheDocument();
    expect(screen.getByText("Finish")).toBeInTheDocument();

    // Switch to metal
    const metalButton = screen.getByText("Metal Component");
    fireEvent.click(metalButton);

    // Metal fields
    expect(screen.getByText("Alloy Grade")).toBeInTheDocument();
    expect(screen.getByText("Hardness (HRC)")).toBeInTheDocument();
    expect(screen.getByText("Tensile Strength")).toBeInTheDocument();
  });
});
