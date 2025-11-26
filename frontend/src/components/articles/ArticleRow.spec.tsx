import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleRow } from "./ArticleRow";
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
  shopFloorFields: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <trpc.Provider client={trpc.createClient({ links: [] })} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <table>
        <tbody>{children}</tbody>
      </table>
    </QueryClientProvider>
  </trpc.Provider>
);

describe("ArticleRow", () => {
  it("renders article information", () => {
    render(<ArticleRow article={mockArticle} onEdit={() => {}} />, { wrapper });

    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("Test Org")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders edit and delete buttons", () => {
    render(<ArticleRow article={mockArticle} onEdit={() => {}} />, { wrapper });

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("displays correct badge variant for active status", () => {
    render(<ArticleRow article={mockArticle} onEdit={() => {}} />, { wrapper });

    const badge = screen.getByText("active");
    expect(badge).toHaveClass("bg-black");
  });

  it("displays correct badge variant for inactive status", () => {
    const inactiveArticle = { ...mockArticle, status: "inactive" as const };
    render(<ArticleRow article={inactiveArticle} onEdit={() => {}} />, { wrapper });

    const badge = screen.getByText("inactive");
    expect(badge).toHaveClass("bg-zinc-100");
  });
});
