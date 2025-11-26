import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import type { Article } from "@/types";
import { Plus, Search, Settings2, Factory, Zap, Database } from "lucide-react";
import { ArticleRow } from "@/components/articles/ArticleRow";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { ServiceStatus } from "@/components/articles/ServiceStatus";

export const Route = createFileRoute("/articles")({
  component: Articles,
});

export function Articles() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [useAlgolia, setUseAlgolia] = useState(false); // Default to PostgreSQL search
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // PostgreSQL search (with pagination)
  const postgresQuery = trpc.articles.list.useInfiniteQuery(
    { limit: 20, search: debouncedSearch || undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: (previousData) => previousData,
      enabled: !useAlgolia,
    }
  );

  // Algolia fast search
  const algoliaQuery = trpc.articles.fastSearch.useQuery(
    { query: debouncedSearch, hitsPerPage: 50 },
    {
      enabled: useAlgolia && debouncedSearch.length > 0,
      staleTime: 5000,
    }
  );

  // Combine loading states
  const isLoading = useAlgolia ? algoliaQuery.isLoading : postgresQuery.isLoading;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = postgresQuery;

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage || useAlgolia) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, useAlgolia]);

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  // Map Algolia hits to Article format for display
  const algoliaArticles = (algoliaQuery.data?.hits ?? []).map((hit) => ({
    id: parseInt(hit.objectID, 10),
    name: hit.name,
    organization: hit.organization,
    status: hit.status as "draft" | "active" | "archived",
    attributeFields: [] as Article["attributeFields"],
    shopFloorFields: [] as Article["shopFloorFields"],
    createdAt: new Date(hit.createdAt).toISOString(),
    updatedAt: new Date(hit.createdAt).toISOString(),
  }));

  // Use Algolia results when searching with Algolia, otherwise PostgreSQL
  const allArticles =
    useAlgolia && debouncedSearch
      ? algoliaArticles
      : (postgresQuery.data?.pages.flatMap((page) => page.items) ?? []);

  return (
    <div className="min-h-screen font-sans text-zinc-900 bg-white">
      <div className="container mx-auto px-6 py-12">
        <ServiceStatus />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Article Management</h1>
            <p className="text-zinc-500">Define and manage your manufacturing catalog.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={18} />
              Create Article
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search articles by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 shadow-sm transition-all"
            />
          </div>

          {/* Search engine toggle */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setUseAlgolia(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                useAlgolia
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Zap size={14} className={useAlgolia ? "text-yellow-500" : ""} />
              Algolia
            </button>
            <button
              onClick={() => setUseAlgolia(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                !useAlgolia
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Database size={14} />
              PostgreSQL
            </button>
          </div>

          {/* Search performance indicator */}
          {debouncedSearch && useAlgolia && algoliaQuery.data && (
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                <Zap size={12} />
                {algoliaQuery.data.processingTimeMs}ms
              </span>
              <span>{algoliaQuery.data.nbHits} results</span>
            </div>
          )}
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Settings2 size={14} /> Attributes
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Factory size={14} /> Shop Floor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      Loading articles...
                    </td>
                  </tr>
                ) : allArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  allArticles.map((article) => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      onEdit={() => handleEdit(article)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasNextPage && (
          <div ref={loadMoreRef} className="py-8 text-center text-zinc-400">
            {isFetchingNextPage ? "Loading more..." : "Scroll to load more"}
          </div>
        )}
      </div>
      {showForm && <ArticleForm initialData={editingArticle} onClose={handleCloseForm} />}
    </div>
  );
}
