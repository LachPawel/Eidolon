import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, CheckCircle2, Factory, ChevronRight, Box } from "lucide-react";
import { Sparkles } from "lucide-react";

export function InteractiveDemo() {
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
}
