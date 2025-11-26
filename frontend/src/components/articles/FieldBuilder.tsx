import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import type { FieldInput } from "@/types";

export function FieldBuilder({
  field,
  onUpdate,
  onRemove,
}: {
  field: FieldInput;
  onUpdate: (updates: Partial<FieldInput>) => void;
  onRemove: () => void;
}) {
  const [optionInput, setOptionInput] = useState("");

  const generateFieldKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleLabelChange = (label: string) => {
    const updates: Partial<FieldInput> = { fieldLabel: label };
    if (!field.fieldKey || field.fieldKey === generateFieldKey(field.fieldLabel)) {
      updates.fieldKey = generateFieldKey(label);
    }
    onUpdate(updates);
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    const currentOptions = field.validation?.options || [];
    onUpdate({
      validation: {
        ...field.validation,
        options: [...currentOptions, optionInput.trim()],
      },
    });
    setOptionInput("");
  };

  const removeOption = (index: number) => {
    const currentOptions = field.validation?.options || [];
    onUpdate({
      validation: {
        ...field.validation,
        options: currentOptions.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4 transition-all hover:border-zinc-300 hover:shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
            Label
          </label>
          <input
            type="text"
            value={field.fieldLabel}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            placeholder="Field Name"
            required
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
            Type
          </label>
          <select
            value={field.fieldType}
            onChange={(e) => {
              const newType = e.target.value as FieldInput["fieldType"];
              onUpdate({ fieldType: newType });
            }}
            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="select">Select</option>
          </select>
        </div>
        <div className="md:col-span-3 flex items-end justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} className="mr-2" /> Remove
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-200/50">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.validation?.required || false}
            onChange={(e) =>
              onUpdate({
                validation: { ...field.validation, required: e.target.checked },
              })
            }
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <span className="font-medium text-zinc-700">Required Field</span>
        </label>

        {field.fieldType === "number" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500 uppercase">Min</label>
              <input
                type="number"
                value={field.validation?.min ?? ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="w-20 px-2 py-1 bg-white border border-zinc-200 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500 uppercase">Max</label>
              <input
                type="number"
                value={field.validation?.max ?? ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="w-20 px-2 py-1 bg-white border border-zinc-200 rounded text-sm"
              />
            </div>
          </>
        )}
      </div>

      {field.fieldType === "select" && (
        <div className="bg-zinc-100/50 p-3 rounded-lg space-y-2">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Options
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm"
              placeholder="Type option and press Enter"
            />
            <Button type="button" size="sm" variant="secondary" onClick={addOption}>
              Add
            </Button>
          </div>
          {field.validation?.options && field.validation.options.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.validation.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-white border border-zinc-200 px-2 py-1 rounded-md text-sm shadow-sm"
                >
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-zinc-400 hover:text-red-500 ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
