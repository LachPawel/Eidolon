import { trpc } from "@/trpc";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import type { Article } from "@/types";

interface ArticleListProps {
  selectedArticleId: number | null;
  onSelectArticle: (article: Article) => void;
}

export function ArticleList({ selectedArticleId, onSelectArticle }: ArticleListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.articles.list.useInfiniteQuery(
      { limit: 20, search: debouncedSearch || undefined },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: (previousData) => previousData,
      }
    );

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allArticles = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-250px)] min-h-[500px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 shadow-sm transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-zinc-100/50 rounded-xl animate-pulse" />
            ))
          : allArticles.map((article) => (
              <motion.button
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelectArticle(article)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                  selectedArticleId === article.id
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
                    : "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:shadow-md"
                }`}
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg leading-tight mb-1">{article.name}</div>
                    <div
                      className={`text-sm font-mono ${selectedArticleId === article.id ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {article.organization}
                    </div>
                  </div>
                  {selectedArticleId === article.id && <ChevronRight className="text-zinc-400" />}
                </div>
              </motion.button>
            ))}
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-4 text-center text-sm text-zinc-400">
            {isFetchingNextPage ? "Loading more..." : "Scroll for more"}
          </div>
        )}
      </div>
    </div>
  );
}
