import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/articles")({
  component: Articles,
});

function Articles() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: articles, isLoading } = trpc.articles.list.useQuery();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const filteredArticles = articles?.filter(
    (article) =>
      article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Article</Button>
      </div>

      {showAddForm && <AddArticleForm onClose={() => setShowAddForm(false)} />}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-md"
        />
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Organization
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Shop Floor Fields
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Attribute Fields
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr key={article.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">{article.name}</td>
                <td className="p-4 align-middle">{article.organization}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      article.status === "active"
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                        : article.status === "draft"
                          ? "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="p-4 align-middle">{article.shopFloorFields?.length || 0}</td>
                <td className="p-4 align-middle">{article.attributeFields?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type FieldInput = {
  fieldKey: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "boolean" | "select";
  scope: "attribute" | "shop_floor";
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    options?: string[];
  };
};

function AddArticleForm({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const createArticle = trpc.articles.create.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      onClose();
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    status: "draft" as "draft" | "active" | "archived",
  });

  const [attributeFields, setAttributeFields] = useState<FieldInput[]>([]);
  const [shopFloorFields, setShopFloorFields] = useState<FieldInput[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createArticle.mutate({
      ...formData,
      attributeFields,
      shopFloorFields,
    });
  };

  const addField = (scope: "attribute" | "shop_floor") => {
    const newField: FieldInput = {
      fieldKey: "",
      fieldLabel: "",
      fieldType: "text",
      scope,
      validation: { required: false },
    };
    if (scope === "attribute") {
      setAttributeFields([...attributeFields, newField]);
    } else {
      setShopFloorFields([...shopFloorFields, newField]);
    }
  };

  const updateField = (
    scope: "attribute" | "shop_floor",
    index: number,
    updates: Partial<FieldInput>
  ) => {
    const fields = scope === "attribute" ? attributeFields : shopFloorFields;
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    if (scope === "attribute") {
      setAttributeFields(updated);
    } else {
      setShopFloorFields(updated);
    }
  };

  const removeField = (scope: "attribute" | "shop_floor", index: number) => {
    if (scope === "attribute") {
      setAttributeFields(attributeFields.filter((_, i) => i !== index));
    } else {
      setShopFloorFields(shopFloorFields.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-background rounded-lg p-6 max-w-3xl w-full my-8">
        <h2 className="text-2xl font-bold mb-4">Add New Article</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "active" | "archived",
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Attribute Fields</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField("attribute")}
              >
                Add Field
              </Button>
            </div>
            {attributeFields.map((field, index) => (
              <FieldBuilder
                key={index}
                field={field}
                onUpdate={(updates) => updateField("attribute", index, updates)}
                onRemove={() => removeField("attribute", index)}
              />
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Shop Floor Fields</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addField("shop_floor")}
              >
                Add Field
              </Button>
            </div>
            {shopFloorFields.map((field, index) => (
              <FieldBuilder
                key={index}
                field={field}
                onUpdate={(updates) => updateField("shop_floor", index, updates)}
                onRemove={() => removeField("shop_floor", index)}
              />
            ))}
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button type="submit" disabled={createArticle.isPending}>
              {createArticle.isPending ? "Creating..." : "Create Article"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldBuilder({
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
    onUpdate({
      fieldLabel: label,
      fieldKey: generateFieldKey(label),
    });
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
    <div className="border rounded-md p-4 mb-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Field Label</label>
          <input
            type="text"
            value={field.fieldLabel}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g., Batch Number"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Field Type</label>
          <select
            value={field.fieldType}
            onChange={(e) => {
              const newType = e.target.value as FieldInput["fieldType"];
              onUpdate({ fieldType: newType });
            }}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="select">Select</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={field.validation?.required || false}
            onChange={(e) =>
              onUpdate({
                validation: { ...field.validation, required: e.target.checked },
              })
            }
          />
          Required
        </label>

        {field.fieldType === "number" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs">Min:</label>
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
                className="w-20 px-2 py-1 border rounded text-sm"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs">Max:</label>
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
                className="w-20 px-2 py-1 border rounded text-sm"
                placeholder="Optional"
              />
            </div>
          </>
        )}

        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="ml-auto">
          Remove
        </Button>
      </div>

      {field.fieldType === "select" && (
        <div className="space-y-2">
          <label className="block text-xs font-medium">Options</label>
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
              className="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Add option and press Enter"
            />
            <Button type="button" size="sm" onClick={addOption}>
              Add
            </Button>
          </div>
          {field.validation?.options && field.validation.options.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.validation.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm"
                >
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
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
