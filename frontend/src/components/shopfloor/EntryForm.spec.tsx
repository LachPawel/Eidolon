import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntryForm } from "./EntryForm";
import { trpc } from "@/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockArticle = {
  id: 1,
  name: "Test Article",
  organization: "Test Org",
  status: "active" as const,
  attributeFields: [],
  shopFloorFields: [
    {
      id: 1,
      fieldKey: "operator",
      fieldLabel: "Operator Name",
      fieldType: "text" as const,
      scope: "shop_floor" as const,
      validation: { required: true },
    },
    {
      id: 2,
      fieldKey: "quantity",
      fieldLabel: "Quantity",
      fieldType: "number" as const,
      scope: "shop_floor" as const,
      validation: { required: true, min: 1 },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <trpc.Provider client={trpc.createClient({ links: [] })} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </trpc.Provider>
);

describe("EntryForm", () => {
  it("renders article name", () => {
    render(<EntryForm article={mockArticle} />, { wrapper });

    expect(screen.getByText("Test Article")).toBeInTheDocument();
  });

  it("renders all shop floor fields", () => {
    render(<EntryForm article={mockArticle} />, { wrapper });

    expect(screen.getByLabelText(/operator name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<EntryForm article={mockArticle} />, { wrapper });

    expect(screen.getByRole("button", { name: /submit entry/i })).toBeInTheDocument();
  });

  it("shows required indicators for required fields", () => {
    render(<EntryForm article={mockArticle} />, { wrapper });

    const requiredLabels = screen.getAllByText("*");
    expect(requiredLabels.length).toBeGreaterThan(0);
  });

  it("renders empty state when no shop floor fields", () => {
    const articleWithoutFields = {
      ...mockArticle,
      shopFloorFields: [],
    };
    render(<EntryForm article={articleWithoutFields} />, { wrapper });

    expect(screen.getByText(/no shop floor fields configured/i)).toBeInTheDocument();
  });
});
