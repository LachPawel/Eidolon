import { performance } from "perf_hooks";

export interface PerformanceMetrics {
  operation: string;
  durationMs: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AggregateMetrics {
  avgMs: number;
  minMs: number;
  maxMs: number;
  medianMs: number;
  p95Ms: number;
  count: number;
}

export interface SearchPerformanceComparison {
  postgres: AggregateMetrics;
  algolia: AggregateMetrics;
  pinecone: AggregateMetrics;
}

// In-memory metrics store (consider Redis or another store for production)
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS = 10000; // Limit memory usage

/**
 * Measure the performance of an async operation
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const start = performance.now();

  try {
    const result = await fn();
    const durationMs = performance.now() - start;

    const metrics: PerformanceMetrics = {
      operation,
      durationMs,
      timestamp: new Date(),
      metadata,
    };

    // Store metrics with size limit
    if (metricsStore.length >= MAX_METRICS) {
      metricsStore.shift(); // Remove oldest
    }
    metricsStore.push(metrics);

    // Log for monitoring
    console.log(`[PERF] ${operation}: ${durationMs.toFixed(2)}ms`, metadata);

    return { result, metrics };
  } catch (error) {
    const durationMs = performance.now() - start;
    console.error(`[PERF] ${operation} FAILED after ${durationMs.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Measure the performance of a sync operation
 */
export function measurePerformanceSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): { result: T; metrics: PerformanceMetrics } {
  const start = performance.now();

  try {
    const result = fn();
    const durationMs = performance.now() - start;

    const metrics: PerformanceMetrics = {
      operation,
      durationMs,
      timestamp: new Date(),
      metadata,
    };

    // Store metrics with size limit
    if (metricsStore.length >= MAX_METRICS) {
      metricsStore.shift(); // Remove oldest
    }
    metricsStore.push(metrics);

    console.log(`[PERF] ${operation}: ${durationMs.toFixed(2)}ms`, metadata);

    return { result, metrics };
  } catch (error) {
    const durationMs = performance.now() - start;
    console.error(`[PERF] ${operation} FAILED after ${durationMs.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Get raw metrics history, optionally filtered by operation
 */
export function getMetricsHistory(operation?: string): PerformanceMetrics[] {
  if (operation) {
    return metricsStore.filter((m) => m.operation === operation);
  }
  return [...metricsStore];
}

/**
 * Calculate aggregate metrics for a specific operation
 */
export function getAggregateMetrics(operation: string): AggregateMetrics {
  const metrics = metricsStore.filter((m) => m.operation === operation);

  if (metrics.length === 0) {
    return { avgMs: 0, minMs: 0, maxMs: 0, medianMs: 0, p95Ms: 0, count: 0 };
  }

  const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const count = durations.length;

  const sum = durations.reduce((a, b) => a + b, 0);
  const avgMs = sum / count;
  const minMs = durations[0];
  const maxMs = durations[count - 1];

  // Median
  const medianMs =
    count % 2 === 0
      ? (durations[count / 2 - 1] + durations[count / 2]) / 2
      : durations[Math.floor(count / 2)];

  // P95
  const p95Index = Math.ceil(count * 0.95) - 1;
  const p95Ms = durations[p95Index];

  return { avgMs, minMs, maxMs, medianMs, p95Ms, count };
}

/**
 * Compare search performance across different backends
 */
export function compareSearchPerformance(): SearchPerformanceComparison {
  return {
    postgres: getAggregateMetrics("postgres-search"),
    algolia: getAggregateMetrics("algolia-search"),
    pinecone: getAggregateMetrics("pinecone-search"),
  };
}

/**
 * Get recent metrics summary (last N minutes)
 */
export function getRecentMetricsSummary(minutesAgo: number = 5): Record<string, AggregateMetrics> {
  const cutoff = new Date(Date.now() - minutesAgo * 60 * 1000);
  const recentMetrics = metricsStore.filter((m) => m.timestamp >= cutoff);

  // Group by operation
  const operations = new Set(recentMetrics.map((m) => m.operation));
  const summary: Record<string, AggregateMetrics> = {};

  for (const op of operations) {
    const opMetrics = recentMetrics
      .filter((m) => m.operation === op)
      .map((m) => m.durationMs)
      .sort((a, b) => a - b);

    if (opMetrics.length === 0) continue;

    const count = opMetrics.length;
    const sum = opMetrics.reduce((a, b) => a + b, 0);

    summary[op] = {
      avgMs: sum / count,
      minMs: opMetrics[0],
      maxMs: opMetrics[count - 1],
      medianMs:
        count % 2 === 0
          ? (opMetrics[count / 2 - 1] + opMetrics[count / 2]) / 2
          : opMetrics[Math.floor(count / 2)],
      p95Ms: opMetrics[Math.ceil(count * 0.95) - 1],
      count,
    };
  }

  return summary;
}

/**
 * Clear all stored metrics
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}

/**
 * Create a performance benchmark report
 */
export function generateBenchmarkReport(): {
  comparison: SearchPerformanceComparison;
  summary: string;
  recommendations: string[];
} {
  const comparison = compareSearchPerformance();
  const recommendations: string[] = [];

  // Generate summary
  let summary = "=== Search Performance Benchmark Report ===\n\n";

  if (comparison.postgres.count > 0) {
    summary += `PostgreSQL Search:\n`;
    summary += `  Average: ${comparison.postgres.avgMs.toFixed(2)}ms\n`;
    summary += `  Min/Max: ${comparison.postgres.minMs.toFixed(2)}ms / ${comparison.postgres.maxMs.toFixed(2)}ms\n`;
    summary += `  P95: ${comparison.postgres.p95Ms.toFixed(2)}ms\n`;
    summary += `  Samples: ${comparison.postgres.count}\n\n`;
  }

  if (comparison.algolia.count > 0) {
    summary += `Algolia Search:\n`;
    summary += `  Average: ${comparison.algolia.avgMs.toFixed(2)}ms\n`;
    summary += `  Min/Max: ${comparison.algolia.minMs.toFixed(2)}ms / ${comparison.algolia.maxMs.toFixed(2)}ms\n`;
    summary += `  P95: ${comparison.algolia.p95Ms.toFixed(2)}ms\n`;
    summary += `  Samples: ${comparison.algolia.count}\n\n`;
  }

  if (comparison.pinecone.count > 0) {
    summary += `Pinecone Semantic Search:\n`;
    summary += `  Average: ${comparison.pinecone.avgMs.toFixed(2)}ms\n`;
    summary += `  Min/Max: ${comparison.pinecone.minMs.toFixed(2)}ms / ${comparison.pinecone.maxMs.toFixed(2)}ms\n`;
    summary += `  P95: ${comparison.pinecone.p95Ms.toFixed(2)}ms\n`;
    summary += `  Samples: ${comparison.pinecone.count}\n\n`;
  }

  // Generate recommendations
  if (comparison.postgres.count > 0 && comparison.algolia.count > 0) {
    const speedup = comparison.postgres.avgMs / comparison.algolia.avgMs;
    if (speedup > 2) {
      recommendations.push(
        `Algolia is ${speedup.toFixed(1)}x faster than PostgreSQL for text search. Consider using Algolia for user-facing search.`
      );
    } else if (speedup < 0.5) {
      recommendations.push(
        `PostgreSQL is faster than Algolia in this benchmark. Check Algolia configuration or network latency.`
      );
    }
  }

  if (comparison.postgres.p95Ms > 200) {
    recommendations.push(
      `PostgreSQL P95 latency is high (${comparison.postgres.p95Ms.toFixed(0)}ms). Consider adding database indexes.`
    );
  }

  if (comparison.pinecone.count > 0 && comparison.pinecone.avgMs > 500) {
    recommendations.push(
      `Pinecone semantic search is slow (${comparison.pinecone.avgMs.toFixed(0)}ms avg). Consider caching embeddings.`
    );
  }

  summary += "=== End of Report ===";

  return { comparison, summary, recommendations };
}

/**
 * Export metrics for external analysis
 */
export function exportMetrics(): {
  raw: PerformanceMetrics[];
  aggregated: Record<string, AggregateMetrics>;
  comparison: SearchPerformanceComparison;
} {
  // Group metrics by operation
  const operations = new Set(metricsStore.map((m) => m.operation));
  const aggregated: Record<string, AggregateMetrics> = {};

  for (const op of operations) {
    aggregated[op] = getAggregateMetrics(op);
  }

  return {
    raw: [...metricsStore],
    aggregated,
    comparison: compareSearchPerformance(),
  };
}
