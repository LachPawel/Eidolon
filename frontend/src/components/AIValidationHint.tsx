import { trpc } from "@/trpc";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AIValidationHintProps {
  materialType: string;
  fieldKey: string;
  onApplyValidation?: (validation: { min?: number; max?: number; required?: boolean }) => void;
}

export function AIValidationHint({
  materialType,
  fieldKey,
  onApplyValidation,
}: AIValidationHintProps) {
  const { data, isLoading } = trpc.articles.getValidationHint.useQuery(
    {
      materialType,
      fieldKey,
    },
    {
      enabled: materialType.length > 0 && fieldKey.length > 0,
      staleTime: 60000, // Cache for 1 minute
      retry: 1,
    }
  );

  // Don't show if no hint available
  if (isLoading || !data?.hint) return null;

  return (
    <div className="flex items-start gap-2 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg mt-2">
      <AlertCircle size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-purple-200">{data.hint}</p>
        {data.suggestedValidation && onApplyValidation && (
          <button
            onClick={() => onApplyValidation(data.suggestedValidation!)}
            className="mt-2 text-xs text-purple-300 hover:text-purple-100 flex items-center gap-1 transition-colors"
          >
            <CheckCircle2 size={12} />
            Apply suggested validation
            {data.suggestedValidation.min !== undefined &&
              data.suggestedValidation.max !== undefined && (
                <span className="text-purple-400">
                  ({data.suggestedValidation.min} - {data.suggestedValidation.max})
                </span>
              )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AIValidationHint;
