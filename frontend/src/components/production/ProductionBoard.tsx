import { useEffect, useRef, useState } from "react";
import { trpc } from "@/trpc";
import { Sparkles } from "lucide-react";

const COLUMNS = ["PREPARATION", "IN PRODUCTION", "READY"];
const COLUMN_WIDTH_PERCENT = 1 / 3;
const HEADER_HEIGHT = 44;
const PADDING = 20;
const CARD_MIN_HEIGHT = 40;

// Colors matching the Articles table style
const COLORS = {
  background: "#ffffff",
  headerBg: "#ffffff", // Clean white
  headerText: "#18181b", // zinc-900
  gridLine: "#f4f4f5", // zinc-100 (very subtle)

  // Card Colors (Minimalist)
  cardBg: "#ffffff",
  cardBgHover: "#fafafa", // zinc-50
  cardBorder: "#e4e4e7", // zinc-200
  cardText: "#18181b", // zinc-900
  cardTextSecondary: "#71717a", // zinc-500

  resizeHandle: "#d4d4d8", // zinc-300

  // Accents
  accent: "#18181b", // zinc-900
};

interface VisualEntry {
  id: number;
  articleName: string;
  status: string;
  quantity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
  isResizing: boolean;
  // Mock timeline data
  startTime: string;
  endTime: string;
  progress: number;
}

export function ProductionBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visualEntries, setVisualEntries] = useState<VisualEntry[]>([]);

  const [dragState, setDragState] = useState<{
    type: "move" | "resize" | null;
    entryId: number | null;
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
    originalHeight: number;
    originalQuantity: number;
  }>({
    type: null,
    entryId: null,
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0,
    originalHeight: 0,
    originalQuantity: 0,
  });

  const { data: entries, refetch } = trpc.entries.list.useQuery({});
  const updateEntry = trpc.entries.update.useMutation({ onSuccess: () => refetch() });
  const optimizeSchedule = trpc.ai.optimizeSchedule.useMutation({ onSuccess: () => refetch() });

  const handleOptimize = () => {
    optimizeSchedule.mutate();
  };

  const [prevEntries, setPrevEntries] = useState(entries);

  // Initialize visual entries from data (Sync during render to avoid effect cascade)
  if (entries !== prevEntries) {
    setPrevEntries(entries);
    if (entries) {
      const newVisualEntries = entries.map((entry) => {
        const status = entry.status || "PREPARATION";

        // Real time data or fallback
        const startTime = entry.startedAt ? new Date(entry.startedAt) : null;
        const endTime = entry.completedAt
          ? new Date(entry.completedAt)
          : startTime
            ? new Date(startTime.getTime() + 3600000)
            : null; // Default 1h duration

        let progress = 0;
        if (startTime && status === "IN PRODUCTION") {
          const now = new Date();
          const total = (endTime?.getTime() || 0) - startTime.getTime();
          const elapsed = now.getTime() - startTime.getTime();
          progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        } else if (status === "READY") {
          progress = 100;
        }

        return {
          id: entry.id,
          articleName: entry.articleName,
          status: status,
          quantity: entry.quantity,
          x: 0,
          y: 0,
          width: 0,
          height: Math.max(CARD_MIN_HEIGHT, entry.quantity * 4),
          isDragging: false,
          isResizing: false,
          startTime: startTime
            ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--:--",
          endTime: endTime
            ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--:--",
          progress: progress,
        };
      });

      // Deep comparison to avoid infinite loops
      const prevStr = JSON.stringify(
        visualEntries.map((e) => ({ id: e.id, status: e.status, q: e.quantity, t: e.startTime }))
      );
      const newStr = JSON.stringify(
        newVisualEntries.map((e) => ({ id: e.id, status: e.status, q: e.quantity, t: e.startTime }))
      );

      if (prevStr !== newStr) {
        setVisualEntries(newVisualEntries);
      }
    }
  }

  // Layout and Render
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

      // 1. Calculate Layout & Total Height
      const colWidth = containerWidth * COLUMN_WIDTH_PERCENT;
      const columnY: Record<string, number> = {
        PREPARATION: HEADER_HEIGHT + PADDING,
        "IN PRODUCTION": HEADER_HEIGHT + PADDING,
        READY: HEADER_HEIGHT + PADDING,
      };

      // Calculate positions for drawing
      visualEntries.forEach((entry) => {
        if (!entry.isDragging) {
          const colIndex = COLUMNS.indexOf(entry.status);
          const targetX = colIndex * colWidth + PADDING;
          const targetY = columnY[entry.status];
          const targetWidth = colWidth - PADDING * 2;

          entry.x = targetX;
          entry.y = targetY;
          entry.width = targetWidth;

          columnY[entry.status] += entry.height + PADDING;
        }
      });

      const maxContentHeight = Math.max(...Object.values(columnY));
      const totalHeight = Math.max(containerHeight, maxContentHeight + 100);

      // 2. Resize Canvas
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== containerWidth * dpr || canvas.height !== totalHeight * dpr) {
        canvas.width = containerWidth * dpr;
        canvas.height = totalHeight * dpr;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${totalHeight}px`;
        ctx.scale(dpr, dpr);
      }

      // 3. Draw
      // Clear
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, containerWidth, totalHeight);

      // Draw Column Backgrounds (Uniform)
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, containerWidth, totalHeight);

      // Draw Grid Lines (Horizontal - Timeline style)
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let y = HEADER_HEIGHT; y < totalHeight; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(containerWidth, y);
        ctx.stroke();
      }

      // Draw Vertical Dividers
      COLUMNS.forEach((_, index) => {
        if (index > 0) {
          const x = index * colWidth;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, totalHeight);
          ctx.strokeStyle = COLORS.gridLine;
          ctx.stroke();
        }
      });

      // Draw Header
      ctx.fillStyle = COLORS.headerBg;
      ctx.fillRect(0, 0, containerWidth, HEADER_HEIGHT);
      ctx.strokeStyle = COLORS.gridLine;
      ctx.beginPath();
      ctx.moveTo(0, HEADER_HEIGHT);
      ctx.lineTo(containerWidth, HEADER_HEIGHT);
      ctx.stroke();

      // Header Text
      COLUMNS.forEach((col, index) => {
        const x = index * colWidth;
        const text = col.toUpperCase();

        ctx.fillStyle = COLORS.headerText;
        ctx.font = "500 11px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(text, x + PADDING, 28);

        // Count badge
        const count = visualEntries.filter((e) => e.status === col).length;
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = "#f4f4f5"; // zinc-100
        ctx.beginPath();
        ctx.roundRect(x + PADDING + textWidth + 8, 16, 20, 16, 6);
        ctx.fill();

        ctx.fillStyle = "#71717a"; // zinc-500
        ctx.font = "10px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(count.toString(), x + PADDING + textWidth + 18, 28);
      });

      // Draw Entries
      visualEntries.forEach((entry) => {
        // Draw Card
        const radius = 4; // Sharper corners for minimalist look

        ctx.save();

        // Shadow
        if (entry.isDragging) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 12;
          ctx.globalAlpha = 0.95;
        } else {
          ctx.shadowColor = "rgba(0,0,0,0.02)";
          ctx.shadowBlur = 2;
          ctx.shadowOffsetY = 1;
        }

        // Card Shape
        ctx.beginPath();
        ctx.roundRect(entry.x, entry.y, entry.width, entry.height, radius);
        ctx.fillStyle = entry.isDragging ? COLORS.cardBgHover : COLORS.cardBg;
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.cardBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Content
        const contentPadding = 12;

        // Title
        ctx.fillStyle = COLORS.cardText;
        ctx.font = "500 13px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(entry.articleName, entry.x + contentPadding, entry.y + contentPadding + 6);

        // Time Info (Minimalist)
        ctx.fillStyle = COLORS.cardTextSecondary;
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(
          `${entry.startTime} - ${entry.endTime}`,
          entry.x + contentPadding,
          entry.y + contentPadding + 22
        );

        // Quantity Pill (Minimalist)
        const qtyText = `${entry.quantity} units`;
        const qtyWidth = ctx.measureText(qtyText).width + 12;

        ctx.fillStyle = "#f4f4f5"; // zinc-100
        ctx.beginPath();
        ctx.roundRect(entry.x + contentPadding, entry.y + contentPadding + 32, qtyWidth, 18, 4);
        ctx.fill();

        ctx.fillStyle = COLORS.cardTextSecondary;
        ctx.fillText(qtyText, entry.x + contentPadding + 6, entry.y + contentPadding + 45);

        // Progress Bar (Timeline aspect)
        const progressWidth = (entry.width - contentPadding * 2) * (entry.progress / 100);
        ctx.fillStyle = "#e4e4e7"; // zinc-200 (track)
        ctx.beginPath();
        ctx.roundRect(
          entry.x + contentPadding,
          entry.y + entry.height - 8,
          entry.width - contentPadding * 2,
          2,
          1
        );
        ctx.fill();

        ctx.fillStyle = COLORS.accent; // zinc-900 (progress)
        ctx.beginPath();
        ctx.roundRect(entry.x + contentPadding, entry.y + entry.height - 8, progressWidth, 2, 1);
        ctx.fill();

        // Resize Handle
        if (entry.isResizing || (!entry.isDragging && !dragState.type)) {
          ctx.fillStyle = COLORS.resizeHandle;
          ctx.beginPath();
          ctx.roundRect(entry.x + entry.width / 2 - 16, entry.y + entry.height - 4, 32, 2, 1);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [visualEntries, dragState]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for resize handle first (bottom 10px)
    for (let i = visualEntries.length - 1; i >= 0; i--) {
      const entry = visualEntries[i];
      if (
        x >= entry.x &&
        x <= entry.x + entry.width &&
        y >= entry.y + entry.height - 10 &&
        y <= entry.y + entry.height
      ) {
        setDragState({
          type: "resize",
          entryId: entry.id,
          startX: x,
          startY: y,
          originalX: entry.x,
          originalY: entry.y,
          originalHeight: entry.height,
          originalQuantity: entry.quantity,
        });
        const newEntries = [...visualEntries];
        newEntries[i].isResizing = true;
        setVisualEntries(newEntries);
        return;
      }
    }

    // Check for drag body
    for (let i = visualEntries.length - 1; i >= 0; i--) {
      const entry = visualEntries[i];
      if (
        x >= entry.x &&
        x <= entry.x + entry.width &&
        y >= entry.y &&
        y <= entry.y + entry.height
      ) {
        setDragState({
          type: "move",
          entryId: entry.id,
          startX: x,
          startY: y,
          originalX: entry.x,
          originalY: entry.y,
          originalHeight: entry.height,
          originalQuantity: entry.quantity,
        });
        const newEntries = [...visualEntries];
        newEntries[i].isDragging = true;
        // Move to end to draw on top
        const dragged = newEntries.splice(i, 1)[0];
        newEntries.push(dragged);
        setVisualEntries(newEntries);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.type || dragState.entryId === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragState.startX;
    const dy = y - dragState.startY;

    setVisualEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== dragState.entryId) return entry;

        if (dragState.type === "move") {
          return {
            ...entry,
            x: dragState.originalX + dx,
            y: dragState.originalY + dy,
          };
        } else if (dragState.type === "resize") {
          const newHeight = Math.max(CARD_MIN_HEIGHT, dragState.originalHeight + dy);
          const newQuantity = Math.max(1, Math.round(newHeight / 4));
          return {
            ...entry,
            height: newHeight,
            quantity: newQuantity,
          };
        }
        return entry;
      })
    );
  };

  const handleMouseUp = () => {
    if (!dragState.type || dragState.entryId === null) return;

    const entry = visualEntries.find((e) => e.id === dragState.entryId);
    if (entry) {
      if (dragState.type === "move") {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const colWidth = width * COLUMN_WIDTH_PERCENT;
        const colIndex = Math.floor((entry.x + entry.width / 2) / colWidth);
        const newStatus = COLUMNS[Math.max(0, Math.min(2, colIndex))];

        if (newStatus !== entry.status) {
          updateEntry.mutate({ id: entry.id, status: newStatus });
          setVisualEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id ? { ...e, status: newStatus, isDragging: false } : e
            )
          );
        } else {
          setVisualEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, isDragging: false } : e))
          );
        }
      } else if (dragState.type === "resize") {
        if (entry.quantity !== dragState.originalQuantity) {
          updateEntry.mutate({ id: entry.id, quantity: entry.quantity });
        }
        setVisualEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, isResizing: false } : e))
        );
      }
    }

    setDragState({
      type: null,
      entryId: null,
      startX: 0,
      startY: 0,
      originalX: 0,
      originalY: 0,
      originalHeight: 0,
      originalQuantity: 0,
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* AI Optimize Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleOptimize}
          disabled={optimizeSchedule.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-none shadow-sm hover:bg-zinc-800 transition-all font-medium text-xs uppercase tracking-wider border border-zinc-900"
        >
          {optimizeSchedule.isPending ? (
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
      </div>

      <div ref={containerRef} className="w-full h-full bg-white overflow-y-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
