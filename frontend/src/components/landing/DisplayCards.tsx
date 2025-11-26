import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

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

export function DisplayCard({
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
        "relative flex w-full max-w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-white/95 backdrop-blur-sm px-5 py-5 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-full after:bg-gradient-to-l after:from-zinc-50 after:to-transparent after:content-[''] hover:border-zinc-400 hover:bg-white [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-sm hover:shadow-2xl hover:z-50 hover:scale-[1.02]",
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

export function DisplayCards({ cards }: { cards: DisplayCardProps[] }) {
  return (
    <div className="grid grid-cols-1 gap-10 md:gap-0 md:[grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 py-10 perspective-1000">
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
