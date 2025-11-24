import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/articles")({
  component: Articles,
});

function Articles() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: articles, isLoading } = trpc.articles.list.useQuery();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Article</Button>
      </div>

      {showAddForm && <AddArticleForm onClose={() => setShowAddForm(false)} />}

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
            {articles?.map((article) => (
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createArticle.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Article</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex gap-2">
            <Button type="submit" disabled={createArticle.isPending}>
              {createArticle.isPending ? "Creating..." : "Create"}
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
