import { createFileRoute } from "@tanstack/react-router";
import { ProductionBoard } from "@/components/production/ProductionBoard";
import { ProductionStats } from "@/components/production/ProductionStats";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/production")({
  component: ProductionPage,
});

function ProductionPage() {
  const { data: stats } = trpc.entries.getStats.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="min-h-screen font-sans text-zinc-900 bg-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2 text-zinc-900">Production</h1>
            <p className="text-zinc-500 font-light">Zentio AI-based production planning.</p>
          </div>
        </div>

        {/* Stats Overview (Minimalist) */}
        <ProductionStats stats={stats} />

        {/* Production Board Container */}
        <div className="h-[600px] border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white relative">
          <ProductionBoard />
        </div>
      </div>
    </div>
  );
}
