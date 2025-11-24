import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <Link to="/" className="mr-6 flex items-center space-x-2 font-bold">
                Eidolon
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link to="/articles" className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground">
                  Articles
                </Link>
                <Link to="/shopfloor" className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground">
                  Shop Floor
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
