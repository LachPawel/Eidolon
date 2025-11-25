import { trpc } from "@/trpc";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldSuggestion {
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  reason: string;
  confidence: number;
}

interface AIFieldHintsProps {
  articleName: string;
  materialType: string;
  existingFieldKeys: string[];
  onAddField: (field: { fieldKey: string; fieldLabel: string; fieldType: string }) => void;
}

export function AIFieldHints({
  articleName,
  materialType,
  existingFieldKeys,
  onAddField,
}: AIFieldHintsProps) {
  const { data, isLoading, isError } = trpc.articles.getAIHints.useQuery(
    {
      articleName,
      materialType,
      existingFieldKeys,
    },
    {
      enabled: articleName.length > 2 && materialType.length > 0,
      staleTime: 30000, // Cache for 30 seconds
      retry: 1,
    }
  );

  // Don't render anything if not enough context
  if (articleName.length <= 2 || !materialType) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 bg-zinc-900 rounded-xl text-white shadow-xl animate-pulse">
        <div className="flex items-center gap-2 text-purple-300">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Analyzing...</span>
        </div>
      </div>
    );
  }

  // Error or no suggestions
  if (isError || !data?.suggestedFields?.length) return null;

  return (
    <div className="p-4 bg-zinc-900 rounded-xl text-white shadow-xl">
      <div className="flex items-center gap-2 mb-3 text-purple-300">
        <Sparkles size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Eidolon AI</span>
      </div>
      <p className="text-sm text-zinc-300 mb-4">
        Based on &quot;{materialType}&quot;, I recommend adding:
      </p>
      <div className="space-y-2">
        {data.suggestedFields.map((field: FieldSuggestion) => (
          <div
            key={field.fieldKey}
            className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg transition-colors hover:bg-zinc-700"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{field.fieldLabel}</span>
                <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded">
                  {field.fieldType}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{field.reason}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onAddField({
                  fieldKey: field.fieldKey,
                  fieldLabel: field.fieldLabel,
                  fieldType: field.fieldType,
                })
              }
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
            >
              <Plus size={16} />
            </Button>
          </div>
        ))}
      </div>
      {data.suggestedFields.some((f: FieldSuggestion) => f.confidence > 0.7) && (
        <p className="text-xs text-purple-400 mt-3 flex items-center gap-1">
          <Sparkles size={12} />
          High confidence suggestions based on similar articles
        </p>
      )}
    </div>
  );
}

export default AIFieldHints;
