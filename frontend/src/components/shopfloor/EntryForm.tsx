import { trpc } from "@/trpc";
import { useState } from "react";
import type { Article, Field } from "@/types";
import { ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { AIInputHint } from "@/components/AIInputHint";
import { Button } from "@/components/ui/button";

export function EntryForm({ article }: { article: Article }) {
  const utils = trpc.useUtils();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createEntry = trpc.entries.create.useMutation({
    onSuccess: () => {
      utils.entries.list.invalidate();
      setFormValues({});
      setSuccessMessage("Entry submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate({
      articleId: article.id,
      values: formValues,
    });
  };

  const handleFieldChange = (fieldKey: string, value: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  if (!article.shopFloorFields || article.shopFloorFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <AlertCircle size={32} className="mb-3 text-amber-500" />
        <p>This article has no shop floor fields configured.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6">
        {article.shopFloorFields.map((field: Field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">
              {field.fieldLabel}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.fieldType === "text" && (
              <>
                <input
                  type="text"
                  value={String(formValues[field.fieldKey] || "")}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
                  required={field.validation?.required}
                />
                <AIInputHint
                  articleName={article.name}
                  organization={article.organization}
                  fieldKey={field.fieldKey}
                  fieldLabel={field.fieldLabel}
                  fieldType={field.fieldType}
                  currentValue={formValues[field.fieldKey] as string}
                />
              </>
            )}

            {field.fieldType === "number" && (
              <>
                <input
                  type="number"
                  value={
                    typeof formValues[field.fieldKey] === "number"
                      ? String(formValues[field.fieldKey])
                      : ""
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      field.fieldKey,
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="0"
                  required={field.validation?.required}
                  min={field.validation?.min}
                  max={field.validation?.max}
                />
                {/* AI Input Hint for number fields */}
                <AIInputHint
                  articleName={article.name}
                  organization={article.organization}
                  fieldKey={field.fieldKey}
                  fieldLabel={field.fieldLabel}
                  fieldType={field.fieldType}
                  currentValue={formValues[field.fieldKey] as number}
                />
              </>
            )}

            {field.fieldType === "boolean" && (
              <label className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(formValues[field.fieldKey])}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-zinc-700">Yes, {field.fieldLabel.toLowerCase()}</span>
              </label>
            )}

            {field.fieldType === "select" && field.validation?.options && (
              <div className="relative">
                <select
                  value={String(formValues[field.fieldKey] || "")}
                  onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all appearance-none"
                  required={field.validation?.required}
                >
                  <option value="">Select an option...</option>
                  {field.validation.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={createEntry.isPending}
          className="w-full md:w-auto min-w-[200px] h-12 text-lg"
        >
          {createEntry.isPending ? "Submitting..." : "Submit Entry"}
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
    </form>
  );
}
