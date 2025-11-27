import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { DotBackground } from "@/components/DotBackground";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { FeaturesSectionWithHoverEffects } from "@/components/landing/FeaturesSection";
import { ShopFloorCards } from "@/components/landing/ShopFloorCards";
import { ProductionVisual } from "@/components/landing/ProductionVisual";
import { Layers, MoveRight, PhoneCall } from "lucide-react";

export const Route = createFileRoute("/")({
  component: EidolonLanding,
});

function EidolonLanding() {
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(() => ["Precise", "Dynamic", "Intelligent", "Scalable", "Connected"], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="min-h-screen font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white relative">
      {/* 2D Canvas Background */}
      <DotBackground />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative z-10">
        <div className="container mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-8 py-10">
            <div>
              <Button variant="secondary" size="sm" className="gap-4">
                Manufacturing Intelligence V3.0 <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-bold">
                <span className="text-zinc-900">Manufacturing made</span>
                <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                  &nbsp;
                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute text-zinc-400"
                      initial={{ opacity: 0, y: "-100" }}
                      transition={{ type: "spring", stiffness: 50 }}
                      animate={
                        titleNumber === index
                          ? {
                              y: 0,
                              opacity: 1,
                            }
                          : {
                              y: titleNumber > index ? -150 : 150,
                              opacity: 0,
                            }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-500 mb-6 max-w-2xl mx-auto leading-relaxed">
                Configure dynamic manufacturing articles with AI-driven precision. Bridge the gap
                between engineering definition and shop Floor execution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
              <Button size="lg" className="gap-4 w-full sm:w-auto" asChild>
                <Link to="/articles">
                  Start Defining <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-4 w-full sm:w-auto">
                Schedule Demo <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="relative">
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* Features Grid with Hover Effects */}
      <section
        id="features"
        className="py-24 bg-white/80 backdrop-blur-sm border-t border-zinc-200 relative z-10"
      >
        <div className="container mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the flexible factory.</h2>
            <p className="text-zinc-500 text-lg">
              Whether you produce polymers, metals, or electronics, Eidolon's schema adapts to your
              reality, not the other way around.
            </p>
          </div>

          <FeaturesSectionWithHoverEffects />
        </div>
      </section>

      {/* Value Prop / Split Section */}
      <section className="py-24 border-t border-zinc-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Left side with the Display Cards Stack */}
            <div className="w-full md:w-1/2 flex justify-center pl-10">
              <ShopFloorCards />
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Empower the Shop Floor</h2>
              <p className="text-lg text-zinc-500 mb-8 leading-relaxed">
                Operators shouldn't struggle with complex ERP screens. Eidolon delivers
                context-aware forms that only ask for what's needed, formatted exactly how it should
                be.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Auto-generated forms based on Article Config",
                  "Mobile-first design for tablet & handheld usage",
                  "Real-time tolerance checking",
                  "Digital audit trail for every data point",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="!text-black !border-zinc-300 hover:!bg-zinc-50 hover:!border-zinc-400"
                asChild
              >
                <Link to="/shopfloor">Explore Shop Floor App</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section className="py-24 border-t border-zinc-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Production Planning
              </h2>
              <p className="text-lg text-zinc-500 mb-8 leading-relaxed">
                Stop guessing with spreadsheets. Zentio AI analyzes your capacity, deadlines, and
                constraints to generate the optimal production schedule.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "AI-driven schedule optimization",
                  "Real-time capacity analysis",
                  "Drag-and-drop Gantt charts",
                  "Predictive bottleneck detection",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="!text-black !border-zinc-300 hover:!bg-zinc-50 hover:!border-zinc-400"
                asChild
              >
                <Link to="/production">View Production Board</Link>
              </Button>
            </div>

            <div className="w-full md:w-1/2 flex justify-center">
              <ProductionVisual />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-zinc-900 text-white relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Standardize the non-standard.
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join the organizations using Eidolon to bring structure to their manufacturing
            diversity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white text-black hover:bg-zinc-200 border-none w-full sm:w-auto h-14 px-8 text-lg">
              Get Started for Free
            </Button>
            <Button variant="darkOutline" className="w-full sm:w-auto h-14 px-8 text-lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md py-16 border-t border-zinc-200 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <Layers className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-bold">eidolon</span>
              </div>
              <p className="text-zinc-500 text-sm max-w-xs">
                Next-generation article management and data collection for modern manufacturing.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div>
                <h4 className="font-semibold mb-4 text-sm">Product</h4>
                <ul className="space-y-3 text-sm text-zinc-500">
                  <li>
                    <a href="#" className="hover:text-black">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">Company</h4>
                <ul className="space-y-3 text-sm text-zinc-500">
                  <li>
                    <a href="#" className="hover:text-black">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
            <p>© 2025 Eidolon Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-black">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
