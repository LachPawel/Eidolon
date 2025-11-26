import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArticleForm } from "./ArticleForm";
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
  attributeFields: [
    {
      id: 1,
      fieldKey: "color",
      fieldLabel: "Color",
      fieldType: "text" as const,
      scope: "attribute" as const,
      validation: { required: false },
    },
  ],
  shopFloorFields: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <trpc.Provider client={trpc.createClient({ links: [] })} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </trpc.Provider>
);

describe("ArticleForm", () => {
  it("renders create mode when no initialData provided", () => {
    const onClose = vi.fn();
    render(<ArticleForm initialData={null} onClose={onClose} />, { wrapper });

    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  it("renders edit mode when initialData provided", () => {
    const onClose = vi.fn();
    render(<ArticleForm initialData={mockArticle} onClose={onClose} />, { wrapper });

    expect(screen.getByText("Edit Article")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Article")).toBeInTheDocument();
  });

  it("renders close button", () => {
    const onClose = vi.fn();
    render(<ArticleForm initialData={null} onClose={onClose} />, { wrapper });

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ArticleForm initialData={null} onClose={onClose} />, { wrapper });

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders article definition tabs", () => {
    const onClose = vi.fn();
    render(<ArticleForm initialData={null} onClose={onClose} />, { wrapper });

    expect(screen.getByText("Article Definition")).toBeInTheDocument();
    expect(screen.getByText("Attribute Fields")).toBeInTheDocument();
    expect(screen.getByText("Shop Floor Fields")).toBeInTheDocument();
  });
});
