import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import type { Article, Field } from "@/types";

export const Route = createFileRoute("/shopfloor")({
  component: ShopFloor,
});

function ShopFloor() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
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

  if (isLoading) return <div className="p-8">Loading...</div>;

  const allArticles = data?.pages.flatMap((page) => page.items) ?? [];
  const selectedArticle = allArticles.find((a) => a.id === selectedArticleId) as
    | Article
    | undefined;

  return (
    <div className="p-8 container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Shop Floor Entry</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg bg-card p-4">
          <h2 className="text-xl font-semibold mb-4">Select Article</h2>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {allArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticleId(article.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedArticleId === article.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className="font-medium">{article.name}</div>
                <div className="text-sm opacity-80">{article.organization}</div>
              </button>
            ))}
            {hasNextPage && (
              <div ref={loadMoreRef} className="p-2 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? "Loading more..." : "Scroll for more"}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 border rounded-lg bg-card p-4">
          {selectedArticle ? (
            <EntryForm article={selectedArticle} />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select an article to enter data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntryForm({ article }: { article: Article }) {
  const utils = trpc.useUtils();
  const createEntry = trpc.entries.create.useMutation({
    onSuccess: () => {
      utils.entries.list.invalidate();
      setFormValues({});
    },
  });

  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate({
      articleId: article.id,
      values: formValues,
    });
  };

  const handleFieldChange = (fieldKey: string, value: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Enter Data for: {article.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {article.shopFloorFields?.map((field: Field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-1">
              {field.fieldLabel}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.fieldType === "text" && (
              <input
                type="text"
                value={String(formValues[field.fieldKey] || "")}
                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required={field.validation?.required}
              />
            )}
            {field.fieldType === "number" && (
              <input
                type="number"
                value={
                  typeof formValues[field.fieldKey] === "number"
                    ? String(formValues[field.fieldKey])
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange(
                    field.fieldKey,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border rounded-md"
                required={field.validation?.required}
                min={field.validation?.min}
                max={field.validation?.max}
              />
            )}
            {field.fieldType === "boolean" && (
              <input
                type="checkbox"
                checked={Boolean(formValues[field.fieldKey])}
                onChange={(e) => handleFieldChange(field.fieldKey, e.target.checked)}
                className="h-4 w-4"
              />
            )}
            {field.fieldType === "select" && field.validation?.options && (
              <select
                value={String(formValues[field.fieldKey] || "")}
                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required={field.validation?.required}
              >
                <option value="">Select...</option>
                {field.validation.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <Button type="submit" disabled={createEntry.isPending}>
          {createEntry.isPending ? "Submitting..." : "Submit Entry"}
        </Button>
      </form>
    </div>
  );
}
