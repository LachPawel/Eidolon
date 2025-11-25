import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIInputHint } from "./AIInputHint";

// Mock the trpc hook
const mockUseQuery = vi.fn();

vi.mock("@/trpc", () => ({
  trpc: {
    articles: {
      getInputHint: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

describe("AIInputHint", () => {
  const defaultProps = {
    articleName: "Test Article",
    organization: "Test Org",
    fieldKey: "ph_level",
    fieldLabel: "pH Level",
    fieldType: "number",
    currentValue: "7",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state when fetching", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<AIInputHint {...defaultProps} />);
    expect(screen.getByText("Analyzing...")).toBeInTheDocument();
  });

  it("should render nothing if no hints returned", () => {
    mockUseQuery.mockReturnValue({
      data: { hasHints: false, tips: [] },
      isLoading: false,
    });

    const { container } = render(<AIInputHint {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render valid hints (purple)", () => {
    mockUseQuery.mockReturnValue({
      data: {
        hasHints: true,
        isValid: true,
        tips: ["Typical range is 6-8"],
      },
      isLoading: false,
    });

    render(<AIInputHint {...defaultProps} />);

    const tip = screen.getByText("Typical range is 6-8");
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveClass("text-purple-900");
  });

  it("should render warning hints (red) when invalid", () => {
    mockUseQuery.mockReturnValue({
      data: {
        hasHints: true,
        isValid: false,
        tips: ["⚠️ Value is too high"],
      },
      isLoading: false,
    });

    render(<AIInputHint {...defaultProps} />);

    const tip = screen.getByText("⚠️ Value is too high");
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveClass("text-red-800");
  });
});
