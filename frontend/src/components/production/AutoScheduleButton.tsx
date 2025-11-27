import { Sparkles } from "lucide-react";

interface AutoScheduleButtonProps {
  onClick: () => void;
  isPending: boolean;
}

export function AutoScheduleButton({ onClick, isPending }: AutoScheduleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl shadow-sm hover:bg-zinc-800 transition-all font-medium text-xs uppercase tracking-wider border border-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Optimizing...
        </>
      ) : (
        <>
          <Sparkles size={14} />
          Auto-Schedule
        </>
      )}
    </button>
  );
}
