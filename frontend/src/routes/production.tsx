import { createFileRoute } from "@tanstack/react-router";
import { ProductionBoard } from "@/components/production/ProductionBoard";
import { ProductionStats } from "@/components/production/ProductionStats";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import { trpc } from "@/trpc";
import { useAutoRefresh } from "@/lib/useProductionSocket";

export const Route = createFileRoute("/production")({
  component: ProductionPage,
});

function ProductionPage() {
  const utils = trpc.useUtils();

  const { data: stats } = trpc.entries.getStats.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Auto-refresh data when production events occur
  useAutoRefresh(() => {
    utils.entries.list.invalidate();
    utils.entries.getStats.invalidate();
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
          {/* Presence indicator - shows who's viewing */}
          <PresenceIndicator />
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
