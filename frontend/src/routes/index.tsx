import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import { DotBackground } from "@/components/DotBackground";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Box,
  Layers,
  Cpu,
  Search,
  CheckCircle2,
  Settings2,
  Database,
  Factory,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ScrollText,
  Smartphone,
  MoveRight,
  PhoneCall,
  ClipboardCheck,
  Hammer,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: EidolonLanding,
});

// --- Utils ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components: Button (Shadcn UI) ---

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900",
        link: "text-zinc-900 underline-offset-4 hover:underline",
        darkOutline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "darkOutline";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

// --- Components: Display Cards (Integrated & Styled with AI Hints) ---

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  aiHint?: string | null;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-zinc-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  aiHint = null,
  titleClassName = "text-zinc-900",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-white/95 backdrop-blur-sm px-5 py-5 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[22rem] after:bg-gradient-to-l after:from-zinc-50 after:to-transparent after:content-[''] hover:border-zinc-400 hover:bg-white [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-sm hover:shadow-2xl hover:z-50 hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex items-center justify-center rounded-lg bg-zinc-100 p-2 border border-zinc-200">
            {icon}
          </span>
          <div>
            <p className={cn("text-base font-bold leading-none", titleClassName)}>{title}</p>
            <p className="text-xs text-zinc-400 font-mono mt-1">{date}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2">
        <p className="whitespace-nowrap text-sm text-zinc-700 font-medium">{description}</p>
      </div>

      {aiHint && (
        <div className="mt-2 p-3 bg-zinc-900 rounded-lg text-white border border-zinc-800 relative z-10">
          <div className="flex items-center gap-2 mb-1 text-purple-300">
            <Sparkles size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Eidolon AI</span>
          </div>
          <p className="text-xs text-zinc-300 leading-snug">{aiHint}</p>
        </div>
      )}
    </div>
  );
}

function DisplayCards({ cards }: { cards: DisplayCardProps[] }) {
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 py-10 perspective-1000">
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

const ShopFloorCards = () => {
  const shopCards = [
    {
      icon: <Box className="size-4 text-zinc-700" />,
      title: "Injection Molding",
      description: "Batch #8821 - In Progress",
      date: "Started 10:42 AM",
      aiHint: "Pressure drop detected. Recommend checking nozzle temp.",
      className: "[grid-area:stack] hover:-translate-y-12 z-10 bg-white border-zinc-200",
    },
    {
      icon: <Hammer className="size-4 text-zinc-700" />,
      title: "Hardness Test",
      description: "Spec: 56-58 HRC",
      date: "Pending QC",
      aiHint: "Previous batch showed trend towards 58.5. Verify calibration.",
      className:
        "[grid-area:stack] translate-x-12 translate-y-12 hover:-translate-y-2 z-20 bg-white border-zinc-200",
    },
    {
      icon: <ClipboardCheck className="size-4 text-zinc-700" />,
      title: "Final QC Check",
      description: "Visual Inspection",
      date: "Scheduled 14:00",
      aiHint: "High defect rate in 'Finish' field recently. Focus on surface texture.",
      className:
        "[grid-area:stack] translate-x-24 translate-y-24 hover:translate-y-10 z-30 bg-white border-zinc-200",
    },
  ];

  return <DisplayCards cards={shopCards} />;
};

// --- Features Component ---

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-zinc-200/50 backdrop-blur-sm",
        (index === 0 || index === 4) && "lg:border-l border-zinc-200/50",
        index < 4 && "lg:border-b border-zinc-200/50"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-zinc-100/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-zinc-100/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-zinc-400 group-hover/feature:text-black transition-colors duration-200">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-zinc-200 group-hover/feature:bg-black transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-zinc-900">
          {title}
        </span>
      </div>
      <p className="text-sm text-zinc-500 max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Dynamic Schema Engine",
      description:
        "Define custom fields, color pallets, and hardness scales specific to each article family.",
      icon: <Settings2 size={24} />,
    },
    {
      title: "AI-Assisted Definition",
      description:
        "Our AI suggests industry standard fields and tolerance values based on material type.",
      icon: <Sparkles size={24} />,
    },
    {
      title: "Validated Data Collection",
      description:
        "Shopfloor forms are auto-generated with strict type validation for zero-error inputs.",
      icon: <CheckCircle2 size={24} />,
    },
    {
      title: "Intelligent Search",
      description:
        "Find articles instantly across thousands of SKUs using technical attribute queries.",
      icon: <Search size={24} />,
    },
    {
      title: "Migration Ready",
      description:
        "Import existing catalogs and let Eidolon structure unstructured data automatically.",
      icon: <Database size={24} />,
    },
    {
      title: "IoT Integration",
      description:
        "Map data fields to receive direct inputs from connected digital calipers and sensors.",
      icon: <Cpu size={24} />,
    },
    {
      title: "Digital Audit Trails",
      description: "Complete history of every modification, production run, and quality check.",
      icon: <ScrollText size={24} />,
    },
    {
      title: "Multi-Platform",
      description: "Optimized for desktop configuration and tablet-based shopfloor execution.",
      icon: <Smartphone size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

// --- Interactive Demo Section ---

const InteractiveDemo = () => {
  const [activeType, setActiveType] = useState<"plastic" | "metal">("plastic");

  const definitions = {
    plastic: {
      id: "ART-8821",
      name: "Injection Molded Casing",
      fields: [
        { label: "Polymer Type", type: "select", value: "ABS-HighHeat" },
        { label: "Color Code", type: "color", value: "#1a1a1a" },
        { label: "Finish", type: "text", value: "Matte Texture" },
      ],
    },
    metal: {
      id: "ART-9942",
      name: "Titanium Structural Mount",
      fields: [
        { label: "Alloy Grade", type: "text", value: "Ti-6Al-4V" },
        { label: "Hardness (HRC)", type: "number", value: "36" },
        { label: "Tensile Strength", type: "metric", value: "950 MPa" },
      ],
    },
  };

  const currentDef = definitions[activeType];

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col md:flex-row relative z-20">
      {/* Sidebar / Configuration */}
      <div className="w-full md:w-1/3 bg-zinc-50/80 border-r border-zinc-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8 text-zinc-400 text-xs font-mono uppercase tracking-widest">
          <Settings2 size={14} />
          <span>Configuration</span>
        </div>

        <h4 className="font-semibold text-zinc-900 mb-4">Article Definition</h4>
        <div className="space-y-3">
          <button
            onClick={() => setActiveType("plastic")}
            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${activeType === "plastic" ? "bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900" : "bg-transparent border-transparent hover:bg-zinc-200/50 text-zinc-500"}`}
          >
            <span className="font-medium">Plastic Component</span>
            {activeType === "plastic" && <CheckCircle2 size={16} />}
          </button>
          <button
            onClick={() => setActiveType("metal")}
            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${activeType === "metal" ? "bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900" : "bg-transparent border-transparent hover:bg-zinc-200/50 text-zinc-500"}`}
          >
            <span className="font-medium">Metal Component</span>
            {activeType === "metal" && <CheckCircle2 size={16} />}
          </button>
        </div>

        <div className="mt-auto pt-8">
          <div className="p-4 bg-zinc-900 rounded-xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-purple-300">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Eidolon AI</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Based on "{activeType}", I recommend adding a{" "}
              <strong>{activeType === "plastic" ? "Shrinkage Rate" : "Surface Roughness"}</strong>{" "}
              field validation check.
            </p>
          </div>
        </div>
      </div>

      {/* Main View / Shopfloor Form */}
      <div className="w-full md:w-2/3 p-8 bg-white/50">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono uppercase tracking-widest">
            <Factory size={14} />
            <span>Shopfloor View</span>
          </div>
          <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100 font-medium">
            Live Connection
          </span>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{currentDef.name}</h2>
              <p className="text-zinc-500 font-mono text-sm">{currentDef.id}</p>
            </div>
            <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center">
              <Box className="text-zinc-400" size={20} />
            </div>
          </div>

          <div className="space-y-6">
            {currentDef.fields.map((field, idx) => (
              <div
                key={idx}
                className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <label className="text-sm font-medium text-zinc-700 flex justify-between">
                  {field.label}
                  <span className="text-zinc-400 text-xs font-normal">Required</span>
                </label>
                {field.type === "select" ? (
                  <div className="p-3 bg-white/80 border border-zinc-200 rounded-lg text-zinc-900 w-full flex justify-between items-center shadow-sm">
                    {field.value}
                    <ChevronRight size={16} className="rotate-90 text-zinc-400" />
                  </div>
                ) : field.type === "color" ? (
                  <div className="flex items-center gap-3 p-3 bg-white/80 border border-zinc-200 rounded-lg shadow-sm">
                    <div
                      className="w-6 h-6 rounded-full border border-zinc-200"
                      style={{ backgroundColor: field.value }}
                    ></div>
                    <span className="font-mono text-sm">{field.value}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={field.value}
                    className="w-full p-3 bg-white/80 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 shadow-sm"
                  />
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-zinc-100 mt-6">
              <Button className="w-full gap-2">Submit Record</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Landing Page ---

function EidolonLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(() => ["Precise", "Dynamic", "Intelligent", "Scalable", "Connected"], []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-zinc-200 py-4" : "bg-transparent py-6"}`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">eidolon</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-black transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="hover:text-black transition-colors">
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm font-medium hover:text-black transition-colors">
              Log in
            </a>
            <Button size="sm">Get Started</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-zinc-200 p-6 md:hidden flex flex-col gap-4 shadow-xl">
            <a href="#features" className="text-lg font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-lg font-medium">
              How it Works
            </a>
            <hr className="border-zinc-100" />
            <div className="flex flex-col gap-3">
              <Button variant="secondary" className="w-full justify-center">
                Log in
              </Button>
              <Button className="w-full justify-center">Get Started</Button>
            </div>
          </div>
        )}
      </nav>

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

            <div className="flex flex-row gap-3 mb-10">
              <Button size="lg" className="gap-4">
                Start Defining <MoveRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-4">
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
              >
                Explore Shop Floor App
              </Button>
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
