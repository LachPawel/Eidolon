import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AISchemaAdvisor } from "./AISchemaAdvisor";

// Mock the trpc hook
const mockUseQuery = vi.fn();
const mockRefetch = vi.fn();

vi.mock("@/trpc", () => ({
  trpc: {
    articles: {
      analyzeSchema: {
        useQuery: (...args: unknown[]) => {
          mockUseQuery(...args);
          return {
            data: mockUseQuery(...args)?.data,
            isLoading: mockUseQuery(...args)?.isLoading,
            refetch: mockRefetch,
          };
        },
      },
    },
  },
}));

describe("AISchemaAdvisor", () => {
  const defaultProps = {
    articleName: "Test Article",
    organization: "Test Org",
    fields: [{ fieldKey: "f1", fieldLabel: "Field 1", fieldType: "text" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it("should render the Analyze button initially", () => {
    render(<AISchemaAdvisor {...defaultProps} />);
    expect(screen.getByText("Analyze Schema with AI")).toBeInTheDocument();
  });

  it("should trigger analysis when button is clicked", () => {
    render(<AISchemaAdvisor {...defaultProps} />);

    const button = screen.getByText("Analyze Schema with AI");
    fireEvent.click(button);

    // The component should now be in "enabled" state and showing loading or results
    // Since we mocked useQuery to return loading: false, data: undefined, it might show nothing or loading depending on implementation
    // But we can check if useQuery was called with enabled: true

    // Wait, the useQuery hook is called on every render.
    // We need to check the arguments passed to it.
    // The second argument to useQuery is the options object { enabled: ... }

    expect(mockUseQuery).toHaveBeenCalled();
    const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1];
    expect(lastCall[1].enabled).toBe(true);
  });

  it("should show loading state", () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
      data: undefined,
    });

    render(<AISchemaAdvisor {...defaultProps} />);

    // Click to enable
    const button = screen.getByText("Analyze Schema with AI");
    fireEvent.click(button);

    expect(screen.getByText("Analyzing schema structure...")).toBeInTheDocument();
  });

  it("should show suggestions when data is returned", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        duplicates: [],
        missing: [{ fieldLabel: "Missing Field", fieldType: "text", reason: "Because X" }],
        nameFeedback: null,
      },
    });

    render(<AISchemaAdvisor {...defaultProps} />);

    // Click to enable
    const button = screen.getByText("Analyze Schema with AI");
    fireEvent.click(button);

    expect(screen.getByText(/Missing Field/)).toBeInTheDocument();
    expect(screen.getByText("Because X")).toBeInTheDocument();
  });
});
