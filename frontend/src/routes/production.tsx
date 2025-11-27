import { createFileRoute } from "@tanstack/react-router";
import { ProductionBoard } from "@/components/production/ProductionBoard";
import { Factory, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 border border-zinc-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Active Jobs
              </span>
              <Factory size={16} className="text-zinc-900" />
            </div>
            <div className="text-3xl font-light text-zinc-900">{stats?.activeJobs ?? "-"}</div>
            <div className="text-xs text-zinc-400 mt-2 font-mono">Real-time</div>
          </div>
          <div className="p-6 border border-zinc-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Efficiency
              </span>
              <TrendingUp size={16} className="text-zinc-900" />
            </div>
            <div className="text-3xl font-light text-zinc-900">{stats?.efficiency ?? "-"}%</div>
            <div className="text-xs text-zinc-900 mt-2 font-mono flex items-center gap-1">
              <TrendingUp size={10} /> Based on completion
            </div>
          </div>
          <div className="p-6 border border-zinc-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Bottlenecks
              </span>
              <AlertCircle size={16} className="text-zinc-900" />
            </div>
            <div className="text-3xl font-light text-zinc-900">
              {stats?.bottleneckStage === "None" ? "-" : stats?.bottleneckStage}
            </div>
            <div className="text-xs text-zinc-400 mt-2 font-mono">Most items</div>
          </div>
          <div className="p-6 border border-zinc-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Completed
              </span>
              <CheckCircle2 size={16} className="text-zinc-900" />
            </div>
            <div className="text-3xl font-light text-zinc-900">{stats?.completedJobs ?? "-"}</div>
            <div className="text-xs text-zinc-400 mt-2 font-mono">Total units</div>
          </div>
        </div>

        {/* Production Board Container */}
        <div className="h-[600px] border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white relative">
          <ProductionBoard />
        </div>
      </div>
    </div>
  );
}
