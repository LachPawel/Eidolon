import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shopfloor')({
  component: ShopFloor,
})

function ShopFloor() {
  return (
    <div className="p-8 container mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Shop Floor Entry</h1>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-muted-foreground">Select an article to enter data...</p>
      </div>
    </div>
  )
}
