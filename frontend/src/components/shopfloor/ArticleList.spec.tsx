import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleList } from "./ArticleList";
import { trpc } from "@/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <trpc.Provider client={trpc.createClient({ links: [] })} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </trpc.Provider>
);

describe("ArticleList", () => {
  it("renders search input", () => {
    render(<ArticleList selectedArticleId={null} onSelectArticle={() => {}} />, { wrapper });

    expect(screen.getByPlaceholderText(/search articles/i)).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<ArticleList selectedArticleId={null} onSelectArticle={() => {}} />, { wrapper });

    expect(screen.getByText(/select article/i)).toBeInTheDocument();
  });

  it("renders loading state initially", () => {
    render(<ArticleList selectedArticleId={null} onSelectArticle={() => {}} />, { wrapper });

    expect(screen.getByText(/loading articles/i)).toBeInTheDocument();
  });
});
