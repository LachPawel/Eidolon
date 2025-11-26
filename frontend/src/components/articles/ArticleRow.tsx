import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Article } from "@/types";

export function ArticleRow({ article, onEdit }: { article: Article; onEdit: () => void }) {
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
