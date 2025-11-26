import { Box, Hammer, ClipboardCheck } from "lucide-react";
import { DisplayCards } from "./DisplayCards";

export function ShopFloorCards() {
  const shopCards = [
    {
      icon: <Box className="size-4 text-zinc-700" />,
      title: "Injection Molding",
      description: "Batch #8821 - In Progress",
      date: "Started 10:42 AM",
      aiHint: "Pressure drop detected. Recommend checking nozzle temp.",
      className: "md:[grid-area:stack] md:hover:-translate-y-12 z-10 bg-white border-zinc-200",
    },
    {
      icon: <Hammer className="size-4 text-zinc-700" />,
      title: "Hardness Test",
      description: "Spec: 56-58 HRC",
      date: "Pending QC",
      aiHint: "Previous batch showed trend towards 58.5. Verify calibration.",
      className:
        "md:[grid-area:stack] md:translate-x-12 md:translate-y-12 md:hover:-translate-y-2 z-20 bg-white border-zinc-200",
    },
    {
      icon: <ClipboardCheck className="size-4 text-zinc-700" />,
      title: "Final QC Check",
      description: "Visual Inspection",
      date: "Scheduled 14:00",
      aiHint: "High defect rate in 'Finish' field recently. Focus on surface texture.",
      className:
        "md:[grid-area:stack] md:translate-x-24 md:translate-y-24 md:hover:translate-y-10 z-30 bg-white border-zinc-200",
    },
  ];

  return <DisplayCards cards={shopCards} />;
}
