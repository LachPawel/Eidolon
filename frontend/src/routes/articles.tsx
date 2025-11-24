import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/trpc'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/articles')({
  component: Articles,
})

function Articles() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-8 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <Button>Add Article</Button>
      </div>
      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Organization</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles?.map((article) => (
              <tr key={article.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">{article.name}</td>
                <td className="p-4 align-middle">{article.organization}</td>
                <td className="p-4 align-middle">{article.status}</td>
                <td className="p-4 align-middle">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
