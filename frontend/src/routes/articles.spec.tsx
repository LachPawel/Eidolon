import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Articles } from "@/routes/articles";
import { trpc } from "@/trpc";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock trpc
vi.mock("@/trpc", () => ({
  trpc: {
    articles: {
      list: {
        useInfiniteQuery: vi.fn(),
      },
      create: {
        useMutation: vi.fn(),
      },
      update: {
        useMutation: vi.fn(),
      },
      delete: {
        useMutation: vi.fn(),
      },
    },
    useUtils: vi.fn(() => ({
      articles: {
        list: {
          invalidate: vi.fn(),
        },
      },
    })),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Articles Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vi.mocked(trpc.articles.list.useInfiniteQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof trpc.articles.list.useInfiniteQuery>);

    render(<Articles />, { wrapper: createWrapper() });
    expect(screen.getByText("Loading articles...")).toBeInTheDocument();
  });

  it("renders articles when data is loaded", () => {
    vi.mocked(trpc.articles.list.useInfiniteQuery).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 1,
                name: "Test Article",
                organization: "Test Org",
                status: "active",
                attributeFields: [],
                shopFloorFields: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof trpc.articles.list.useInfiniteQuery>);

    vi.mocked(trpc.articles.delete.useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof trpc.articles.delete.useMutation>);

    render(<Articles />, { wrapper: createWrapper() });
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("Test Org")).toBeInTheDocument();
  });

  it("opens create form when Create Article button is clicked", async () => {
    vi.mocked(trpc.articles.list.useInfiniteQuery).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof trpc.articles.list.useInfiniteQuery>);

    vi.mocked(trpc.articles.create.useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof trpc.articles.create.useMutation>);

    vi.mocked(trpc.articles.update.useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof trpc.articles.update.useMutation>);

    render(<Articles />, { wrapper: createWrapper() });

    const createButton = screen.getByText("Create Article");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Configure article properties and schema.")).toBeInTheDocument();
    });
  });
});
