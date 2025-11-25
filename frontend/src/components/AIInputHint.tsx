import { trpc } from "@/trpc";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface AIInputHintProps {
  articleName: string;
  organization: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  currentValue?: string | number;
}

export function AIInputHint({
  articleName,
  organization,
  fieldKey,
  fieldLabel,
  fieldType,
  currentValue,
}: AIInputHintProps) {
  const [debouncedValue, setDebouncedValue] = useState(currentValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(currentValue);
    }, 1000); // Debounce for 1 second to avoid spamming AI

    return () => clearTimeout(timer);
  }, [currentValue]);

  const { data, isLoading, isFetching } = trpc.articles.getInputHint.useQuery(
    {
      articleName,
      organization,
      fieldKey,
      fieldLabel,
      fieldType,
      currentValue: debouncedValue,
    },
    {
      enabled: fieldKey.length > 0 && organization.length > 0,
      staleTime: 10000, // Cache for 10 seconds
      retry: 1,
      placeholderData: (prev) => prev,
    }
  );

  // Don't show if no hints
  if (isLoading && !data) {
    return (
      <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-400">
        <Loader2 size={12} className="animate-spin" />
        <span>Analyzing...</span>
      </div>
    );
  }

  if (!data?.hasHints || data.tips.length === 0) return null;

  const isInvalid = data.isValid === false;

  return (
    <div
      className={`mt-2 p-3 border rounded-lg transition-colors shadow-sm ${
        isInvalid ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {isInvalid ? (
          <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
        ) : (
          <Sparkles size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
        )}

        <div className="flex-1 space-y-1">
          {data.tips.map((tip, index) => (
            <p
              key={index}
              className={`text-sm ${isInvalid ? "text-red-800 font-medium" : "text-purple-900"}`}
            >
              {tip}
            </p>
          ))}
          {isFetching && (
            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
              <Loader2 size={12} className="animate-spin" />
              <span>Updating analysis...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIInputHint;
