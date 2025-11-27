import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Layers } from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-white font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white">
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-6 flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900"
              >
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                  <Layers size={18} strokeWidth={3} />
                </div>
                Eidolon
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link
                  to="/articles"
                  className="text-zinc-500 hover:text-zinc-900 transition-colors [&.active]:text-zinc-900 [&.active]:font-semibold"
                >
                  Articles
                </Link>
                <Link
                  to="/shopfloor"
                  className="text-zinc-500 hover:text-zinc-900 transition-colors [&.active]:text-zinc-900 [&.active]:font-semibold"
                >
                  Shop Floor
                </Link>
                <Link
                  to="/production"
                  className="text-zinc-500 hover:text-zinc-900 transition-colors [&.active]:text-zinc-900 [&.active]:font-semibold"
                >
                  Production
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 relative">
          <Outlet />
        </main>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
