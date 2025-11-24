import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Eidolon</h1>
      <p className="text-muted-foreground text-lg">
        Intelligent Article Management & Shop Floor Data Collection
      </p>
      <div className="flex gap-4">
        <Button size="lg">Manage Articles</Button>
        <Button size="lg" variant="outline">Shop Floor Entry</Button>
      </div>
    </div>
  )
}
