import { motion } from "framer-motion";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";

export function ProductionVisual() {
  return (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 p-4 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Production Schedule</div>
            <div className="text-xs text-zinc-500">Week 42 • Oct 14 - Oct 20</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="flex border-b border-zinc-100 bg-white">
        <div className="w-24 border-r border-zinc-100 p-2 text-xs font-medium text-zinc-400">
          Resource
        </div>
        <div className="flex-1 grid grid-cols-6 divide-x divide-zinc-50">
          {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => (
            <div key={time} className="p-2 text-[10px] text-zinc-400 font-mono">
              {time}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-100 bg-white">
        {/* Row 1 */}
        <div className="flex group">
          <div className="w-24 border-r border-zinc-100 p-3 flex flex-col justify-center bg-zinc-50/30">
            <span className="text-xs font-medium text-zinc-700">Inj. Mold A</span>
            <span className="text-[10px] text-zinc-400">Cap: 100%</span>
          </div>
          <div className="flex-1 relative h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmMmYyZjIiLz48L3N2Zz4=')]">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "65%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-2 left-4 h-12 bg-zinc-900 rounded-md shadow-lg border border-zinc-800 p-2 flex flex-col justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-white">Order #4421</span>
                <MoreHorizontal className="w-3 h-3 text-zinc-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white">
                  JD
                </div>
                <span className="text-[9px] text-zinc-400">Running</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex group">
          <div className="w-24 border-r border-zinc-100 p-3 flex flex-col justify-center bg-zinc-50/30">
            <span className="text-xs font-medium text-zinc-700">Assembly 1</span>
            <span className="text-[10px] text-zinc-400">Cap: 85%</span>
          </div>
          <div className="flex-1 relative h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmMmYyZjIiLz48L3N2Zz4=')]">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute top-2 left-[40%] w-[30%] h-12 bg-white rounded-md shadow-sm border border-zinc-200 p-2 flex flex-col justify-between hover:border-zinc-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-900">Order #4425</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] text-zinc-500">Delayed 15m</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute top-2 left-[75%] w-[20%] h-12 bg-zinc-100 rounded-md border border-zinc-200 border-dashed p-2 flex items-center justify-center"
            >
              <span className="text-[9px] text-zinc-400">Maintenance</span>
            </motion.div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex group">
          <div className="w-24 border-r border-zinc-100 p-3 flex flex-col justify-center bg-zinc-50/30">
            <span className="text-xs font-medium text-zinc-700">Packaging</span>
            <span className="text-[10px] text-zinc-400">Cap: 40%</span>
          </div>
          <div className="flex-1 relative h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmMmYyZjIiLz48L3N2Zz4=')]">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "45%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute top-2 left-[10%] h-12 bg-zinc-50 rounded-md border border-zinc-200 p-2 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-700">Order #4419</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-400">On Track</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer AI Insight */}
      <div className="bg-zinc-900 p-3 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
        <span className="text-xs text-zinc-300">
          <span className="font-semibold text-white">AI Insight:</span> Moving Order #4425 to Line B
          would save 45 mins.
        </span>
      </div>
    </div>
  );
}
