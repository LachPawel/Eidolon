import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Article } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Factory } from "lucide-react";
import { ArticleList } from "@/components/shopfloor/ArticleList";
import { EntryForm } from "@/components/shopfloor/EntryForm";

export const Route = createFileRoute("/shopfloor")({
  component: ShopFloor,
});

function ShopFloor() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="min-h-screen font-sans text-zinc-900 relative flex flex-col bg-white">
      <div className="container mx-auto px-6 py-12 relative z-10 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Shop Floor Entry</h1>
          <p className="text-zinc-500 text-lg">Record production data for active articles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Sidebar / Article Selection */}
          <div className="lg:col-span-4">
            <ArticleList
              selectedArticleId={selectedArticle?.id ?? null}
              onSelectArticle={setSelectedArticle}
            />
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
