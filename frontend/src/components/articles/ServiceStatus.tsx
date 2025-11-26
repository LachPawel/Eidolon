import { trpc } from "@/trpc";

export function ServiceStatus() {
  const { data } = trpc.articles.getSearchServicesStatus.useQuery();

  if (!data) return null;

  const allConfigured = data.algolia.configured && data.pinecone.configured;

  if (allConfigured) return null; // Don't show if everything is working

  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      <strong>⚠️ Search services not fully configured:</strong>
      <ul className="mt-1 ml-4 list-disc">
        {!data.algolia.configured && <li>Algolia: Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY</li>}
        {!data.pinecone.configured && <li>Pinecone: Set PINECONE_API_KEY and OPENAI_API_KEY</li>}
      </ul>
    </div>
  );
}
