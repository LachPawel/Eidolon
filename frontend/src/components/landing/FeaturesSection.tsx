import { cn } from "@/lib/utils";
import {
  Settings2,
  Sparkles,
  CheckCircle2,
  Search,
  Database,
  Cpu,
  ScrollText,
  Smartphone,
} from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

function Feature({ title, description, icon, index }: FeatureProps) {
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
}

export function FeaturesSectionWithHoverEffects() {
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
