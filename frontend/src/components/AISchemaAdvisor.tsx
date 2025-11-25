import { trpc } from "@/trpc";
import { AlertTriangle, Lightbulb, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AISchemaAdvisorProps {
  articleName: string;
  organization: string;
  fields: { fieldKey: string; fieldLabel: string; fieldType: string }[];
}

export function AISchemaAdvisor({ articleName, organization, fields }: AISchemaAdvisorProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const { data, isLoading, refetch } = trpc.articles.analyzeSchema.useQuery(
    {
      articleName,
      organization,
      fields,
    },
    {
      enabled: isEnabled && articleName.length > 2 && organization.length > 0 && fields.length > 0,
      staleTime: 30000,
      retry: 1,
    }
  );

  const handleAnalyze = () => {
    setIsEnabled(true);
    // If already enabled, refetch to get fresh data
    if (isEnabled) {
      refetch();
    }
  };

  if (!isEnabled) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <Sparkles size={14} />
          Analyze Schema with AI
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2 text-zinc-500 text-sm animate-pulse">
        <Loader2 size={16} className="animate-spin" />
        Analyzing schema structure...
      </div>
    );
  }

  if (!data || (data.duplicates.length === 0 && data.missing.length === 0 && !data.nameFeedback)) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
        <CheckCircle2 size={16} />
        Schema looks good! No issues found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          AI Analysis Results
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="h-6 text-xs text-zinc-400"
        >
          Refresh
        </Button>
      </div>

      {data.nameFeedback && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <Lightbulb size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Name Suggestion</h4>
            <p className="text-xs text-amber-700 mt-1">{data.nameFeedback}</p>
          </div>
        </div>
      )}

      {data.duplicates.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h4 className="text-sm font-medium text-red-800">Potential Duplicates</h4>
          </div>
          <ul className="space-y-1">
            {data.duplicates.map((dup, i) => (
              <li key={i} className="text-xs text-red-700">
                <span className="font-medium">{dup.fieldKey}:</span> {dup.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.missing.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-blue-600" />
            <h4 className="text-sm font-medium text-blue-800">Recommended Fields</h4>
          </div>
          <ul className="space-y-2">
            {data.missing.map((miss, i) => (
              <li key={i} className="text-xs text-blue-700">
                <div className="font-medium">
                  {miss.fieldLabel} ({miss.fieldType})
                </div>
                <div className="opacity-80">{miss.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
