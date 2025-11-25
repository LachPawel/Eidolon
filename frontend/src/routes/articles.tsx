import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import type { Article } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Settings2,
  Factory,
  X,
  CheckCircle2,
  Zap,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { AIFieldHints } from "@/components/AIFieldHints";
import { AISchemaAdvisor } from "@/components/AISchemaAdvisor";

export const Route = createFileRoute("/articles")({
  component: Articles,
});

export function Articles() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [useAlgolia, setUseAlgolia] = useState(false); // Default to PostgreSQL search
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // PostgreSQL search (with pagination)
  const postgresQuery = trpc.articles.list.useInfiniteQuery(
    { limit: 20, search: debouncedSearch || undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: (previousData) => previousData,
      enabled: !useAlgolia,
    }
  );

  // Algolia fast search
  const algoliaQuery = trpc.articles.fastSearch.useQuery(
    { query: debouncedSearch, hitsPerPage: 50 },
    {
      enabled: useAlgolia && debouncedSearch.length > 0,
      staleTime: 5000,
    }
  );

  // Combine loading states
  const isLoading = useAlgolia ? algoliaQuery.isLoading : postgresQuery.isLoading;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = postgresQuery;

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage || useAlgolia) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, useAlgolia]);

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  // Map Algolia hits to Article format for display
  const algoliaArticles = (algoliaQuery.data?.hits ?? []).map((hit) => ({
    id: parseInt(hit.objectID, 10),
    name: hit.name,
    organization: hit.organization,
    status: hit.status as "draft" | "active" | "archived",
    attributeFields: [] as Article["attributeFields"],
    shopFloorFields: [] as Article["shopFloorFields"],
    createdAt: new Date(hit.createdAt).toISOString(),
    updatedAt: new Date(hit.createdAt).toISOString(),
  }));

  // Use Algolia results when searching with Algolia, otherwise PostgreSQL
  const allArticles =
    useAlgolia && debouncedSearch
      ? algoliaArticles
      : (postgresQuery.data?.pages.flatMap((page) => page.items) ?? []);

  return (
    <div className="min-h-screen font-sans text-zinc-900 bg-white">
      <div className="container mx-auto px-6 py-12">
        <ServiceStatus />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Article Management</h1>
            <p className="text-zinc-500">Define and manage your manufacturing catalog.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={18} />
              Create Article
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search articles by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 shadow-sm transition-all"
            />
          </div>

          {/* Search engine toggle */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setUseAlgolia(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                useAlgolia
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Zap size={14} className={useAlgolia ? "text-yellow-500" : ""} />
              Algolia
            </button>
            <button
              onClick={() => setUseAlgolia(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                !useAlgolia
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Database size={14} />
              PostgreSQL
            </button>
          </div>

          {/* Search performance indicator */}
          {debouncedSearch && useAlgolia && algoliaQuery.data && (
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                <Zap size={12} />
                {algoliaQuery.data.processingTimeMs}ms
              </span>
              <span>{algoliaQuery.data.nbHits} results</span>
            </div>
          )}
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Settings2 size={14} /> Attributes
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Factory size={14} /> Shop Floor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      Loading articles...
                    </td>
                  </tr>
                ) : allArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  allArticles.map((article) => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      onEdit={() => handleEdit(article)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasNextPage && (
          <div ref={loadMoreRef} className="py-8 text-center text-zinc-400">
            {isFetchingNextPage ? "Loading more..." : "Scroll to load more"}
          </div>
        )}
      </div>

      {showForm && <ArticleForm initialData={editingArticle} onClose={handleCloseForm} />}
    </div>
  );
}

function ArticleRow({ article, onEdit }: { article: Article; onEdit: () => void }) {
  const utils = trpc.useUtils();
  const deleteArticle = trpc.articles.delete.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${article.name}"?`)) {
      deleteArticle.mutate({ id: article.id });
    }
  };

  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-zinc-900">{article.name}</td>
      <td className="px-6 py-4 text-zinc-600">{article.organization}</td>
      <td className="px-6 py-4">
        <Badge variant={article.status === "active" ? "default" : "secondary"}>
          {article.status}
        </Badge>
      </td>
      <td className="px-6 py-4 text-zinc-600">{article.attributeFields?.length || 0} fields</td>
      <td className="px-6 py-4 text-zinc-600">{article.shopFloorFields?.length || 0} fields</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteArticle.isPending}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

type FieldInput = {
  id?: number;
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

function ArticleForm({
  initialData,
  onClose,
}: {
  initialData: Article | null;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const createArticle = trpc.articles.create.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      onClose();
    },
  });
  const updateArticle = trpc.articles.update.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      onClose();
    },
  });

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    organization: initialData?.organization || "",
    status: (initialData?.status || "draft") as "draft" | "active" | "archived",
  });

  const [attributeFields, setAttributeFields] = useState<FieldInput[]>(
    initialData?.attributeFields?.map((f) => ({
      ...f,
      fieldType: f.fieldType as FieldInput["fieldType"],
      validation: f.validation || { required: false },
    })) || []
  );
  const [shopFloorFields, setShopFloorFields] = useState<FieldInput[]>(
    initialData?.shopFloorFields?.map((f) => ({
      ...f,
      fieldType: f.fieldType as FieldInput["fieldType"],
      validation: f.validation || { required: false },
    })) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateArticle.mutate({
        id: initialData.id,
        ...formData,
        attributeFields,
        shopFloorFields,
      });
    } else {
      createArticle.mutate({
        ...formData,
        attributeFields,
        shopFloorFields,
      });
    }
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

  const isPending = createArticle.isPending || updateArticle.isPending;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {initialData ? "Edit Article" : "Create Article"}
            </h2>
            <p className="text-zinc-500 text-sm">Configure article properties and schema.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="article-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Article Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="e.g. Injection Molded Casing"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Organization / Client</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Status</label>
              <div className="flex gap-4">
                {["draft", "active", "archived"].map((status) => (
                  <label
                    key={status}
                    className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all ${formData.status === status ? "bg-zinc-900 text-white border-zinc-900 shadow-md" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as "draft" | "active" | "archived",
                          })
                        }
                        className="hidden"
                      />
                      <span className="capitalize font-medium">{status}</span>
                    </div>
                    {formData.status === status && <CheckCircle2 size={16} />}
                  </label>
                ))}
              </div>
            </div>

            {/* AI Schema Advisor - Deep analysis */}
            <AISchemaAdvisor
              articleName={formData.name}
              organization={formData.organization}
              fields={[...attributeFields, ...shopFloorFields]}
            />

            {/* AI Field Suggestions - powered by Pinecone */}
            <AIFieldHints
              articleName={formData.name}
              materialType={formData.organization}
              existingFieldKeys={[...attributeFields, ...shopFloorFields].map((f) => f.fieldKey)}
              onAddField={(suggestedField) => {
                const newField: FieldInput = {
                  fieldKey: suggestedField.fieldKey,
                  fieldLabel: suggestedField.fieldLabel,
                  fieldType: suggestedField.fieldType as "text" | "number" | "boolean" | "select",
                  scope: "attribute",
                  validation: {},
                };
                setAttributeFields([...attributeFields, newField]);
              }}
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-zinc-400" size={18} />
                  <h3 className="text-lg font-bold text-zinc-900">Attribute Fields</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField("attribute")}
                  className="gap-2"
                >
                  <Plus size={14} /> Add Field
                </Button>
              </div>
              <div className="space-y-4">
                {attributeFields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-sm">
                    No attribute fields defined.
                  </div>
                )}
                {attributeFields.map((field, index) => (
                  <FieldBuilder
                    key={index}
                    field={field}
                    onUpdate={(updates) => updateField("attribute", index, updates)}
                    onRemove={() => removeField("attribute", index)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-center gap-2">
                  <Factory className="text-zinc-400" size={18} />
                  <h3 className="text-lg font-bold text-zinc-900">Shop Floor Fields</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField("shop_floor")}
                  className="gap-2"
                >
                  <Plus size={14} /> Add Field
                </Button>
              </div>
              <div className="space-y-4">
                {shopFloorFields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-sm">
                    No shop floor fields defined.
                  </div>
                )}
                {shopFloorFields.map((field, index) => (
                  <FieldBuilder
                    key={index}
                    field={field}
                    onUpdate={(updates) => updateField("shop_floor", index, updates)}
                    onRemove={() => removeField("shop_floor", index)}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="article-form" disabled={isPending} className="min-w-[120px]">
            {isPending ? "Saving..." : initialData ? "Update Article" : "Create Article"}
          </Button>
        </div>
      </motion.div>
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

// Service status indicator
function ServiceStatus() {
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
