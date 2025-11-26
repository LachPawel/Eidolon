import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Settings2, Plus, Factory } from "lucide-react";
import { motion } from "framer-motion";
import { AIFieldHints } from "@/components/AIFieldHints";
import { AISchemaAdvisor } from "@/components/AISchemaAdvisor";
import { FieldBuilder } from "./FieldBuilder";
import type { Article, FieldInput } from "@/types";
import { useState } from "react";

export function ArticleForm({
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
