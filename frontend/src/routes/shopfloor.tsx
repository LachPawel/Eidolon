import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import type { Article, Field } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Factory, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { AIInputHint } from "@/components/AIInputHint";

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

  const allArticles = data?.pages.flatMap((page) => page.items) ?? [];
  const selectedArticle = allArticles.find((a) => a.id === selectedArticleId) as
    | Article
    | undefined;

  return (
    <div className="min-h-screen font-sans text-zinc-900 relative flex flex-col bg-white">
      <div className="container mx-auto px-6 py-12 relative z-10 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Shop Floor Entry</h1>
          <p className="text-zinc-500 text-lg">Record production data for active articles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Sidebar / Article Selection */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-[calc(100vh-250px)] min-h-[500px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
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
                      onClick={() => setSelectedArticleId(article.id)}
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
                        {selectedArticleId === article.id && (
                          <ChevronRight className="text-zinc-400" />
                        )}
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

          {/* Main Content / Form */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedArticle ? (
                <motion.div
                  key={selectedArticle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl p-8 shadow-xl h-full"
                >
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100">
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200">
                      <Factory className="text-zinc-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900">{selectedArticle.name}</h2>
                      <p className="text-zinc-500">Enter shop floor data</p>
                    </div>
                  </div>

                  <EntryForm article={selectedArticle} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 p-12 text-center"
                >
                  <Factory size={48} className="mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold text-zinc-600 mb-2">No Article Selected</h3>
                  <p>Select an article from the list to begin data entry.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntryForm({ article }: { article: Article }) {
  const utils = trpc.useUtils();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createEntry = trpc.entries.create.useMutation({
    onSuccess: () => {
      utils.entries.list.invalidate();
      setFormValues({});
      setSuccessMessage("Entry submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
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

  if (!article.shopFloorFields || article.shopFloorFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <AlertCircle size={32} className="mb-3 text-amber-500" />
        <p>This article has no shop floor fields configured.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6">
        {article.shopFloorFields.map((field: Field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">
              {field.fieldLabel}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.fieldType === "text" && (
              <>
                <input
                  type="text"
                  value={String(formValues[field.fieldKey] || "")}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
                  required={field.validation?.required}
                />
                <AIInputHint
                  articleName={article.name}
                  organization={article.organization}
                  fieldKey={field.fieldKey}
                  fieldLabel={field.fieldLabel}
                  fieldType={field.fieldType}
                  currentValue={formValues[field.fieldKey] as string}
                />
              </>
            )}

            {field.fieldType === "number" && (
              <>
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
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="0"
                  required={field.validation?.required}
                  min={field.validation?.min}
                  max={field.validation?.max}
                />
                {/* AI Input Hint for number fields */}
                <AIInputHint
                  articleName={article.name}
                  organization={article.organization}
                  fieldKey={field.fieldKey}
                  fieldLabel={field.fieldLabel}
                  fieldType={field.fieldType}
                  currentValue={formValues[field.fieldKey] as number}
                />
              </>
            )}

            {field.fieldType === "boolean" && (
              <label className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(formValues[field.fieldKey])}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-zinc-700">Yes, {field.fieldLabel.toLowerCase()}</span>
              </label>
            )}

            {field.fieldType === "select" && field.validation?.options && (
              <div className="relative">
                <select
                  value={String(formValues[field.fieldKey] || "")}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all appearance-none"
                  required={field.validation?.required}
                >
                  <option value="">Select an option...</option>
                  {field.validation.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 flex items-center gap-4">
        <Button
          type="submit"
          disabled={createEntry.isPending}
          className="w-full md:w-auto min-w-[150px] h-12 text-lg"
        >
          {createEntry.isPending ? "Submitting..." : "Submit Entry"}
        </Button>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-600 font-medium"
            >
              <CheckCircle2 size={20} />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
