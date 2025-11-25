import { trpc } from "@/trpc";
import { BarChart3, Zap, Database, Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  count: number;
  color: string;
}

function MetricCard({ title, icon, avgMs, minMs, maxMs, p95Ms, count, color }: MetricCardProps) {
  if (count === 0) {
    return (
      <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-medium text-zinc-300">{title}</h3>
        </div>
        <p className="text-sm text-zinc-500">No data yet</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-zinc-800 rounded-lg border ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-zinc-400">Average</p>
          <p className="text-lg font-bold text-white">{avgMs.toFixed(1)}ms</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">P95</p>
          <p className="text-lg font-bold text-zinc-300">{p95Ms.toFixed(1)}ms</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Min / Max</p>
          <p className="text-sm text-zinc-400">
            {minMs.toFixed(1)} / {maxMs.toFixed(1)}ms
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Samples</p>
          <p className="text-sm text-zinc-400">{count}</p>
        </div>
      </div>
    </div>
  );
}

export function PerformanceDashboard() {
  const { data: comparison, refetch, isLoading } = trpc.articles.getSearchPerformance.useQuery();
  const { data: status } = trpc.articles.getSearchServicesStatus.useQuery();
  const { data: report } = trpc.articles.getBenchmarkReport.useQuery();

  return (
    <div className="p-6 bg-zinc-900 rounded-xl text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold">Search Performance</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-zinc-400 hover:text-white"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Service Status */}
      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status?.algolia.configured ? "bg-green-500" : "bg-zinc-500"}`}
          />
          <span className="text-sm text-zinc-400">Algolia</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status?.pinecone.configured ? "bg-green-500" : "bg-zinc-500"}`}
          />
          <span className="text-sm text-zinc-400">Pinecone</span>
        </div>
      </div>

      {/* Metrics Grid */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="PostgreSQL"
            icon={<Database size={16} className="text-blue-400" />}
            avgMs={comparison.postgres.avgMs}
            minMs={comparison.postgres.minMs}
            maxMs={comparison.postgres.maxMs}
            p95Ms={comparison.postgres.p95Ms}
            count={comparison.postgres.count}
            color="border-blue-500/30"
          />
          <MetricCard
            title="Algolia"
            icon={<Zap size={16} className="text-yellow-400" />}
            avgMs={comparison.algolia.avgMs}
            minMs={comparison.algolia.minMs}
            maxMs={comparison.algolia.maxMs}
            p95Ms={comparison.algolia.p95Ms}
            count={comparison.algolia.count}
            color="border-yellow-500/30"
          />
          <MetricCard
            title="Pinecone"
            icon={<Brain size={16} className="text-purple-400" />}
            avgMs={comparison.pinecone.avgMs}
            minMs={comparison.pinecone.minMs}
            maxMs={comparison.pinecone.maxMs}
            p95Ms={comparison.pinecone.p95Ms}
            count={comparison.pinecone.count}
            color="border-purple-500/30"
          />
        </div>
      )}

      {/* Recommendations */}
      {report?.recommendations && report.recommendations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-purple-400">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Speedup indicator */}
      {comparison &&
        comparison.postgres.count > 0 &&
        comparison.algolia.count > 0 &&
        comparison.algolia.avgMs > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-200">
              <Zap size={14} className="inline mr-1" />
              Algolia is{" "}
              <span className="font-bold text-white">
                {(comparison.postgres.avgMs / comparison.algolia.avgMs).toFixed(1)}x faster
              </span>{" "}
              than PostgreSQL for text search
            </p>
          </div>
        )}
    </div>
  );
}

export default PerformanceDashboard;
