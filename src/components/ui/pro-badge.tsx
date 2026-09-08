import { CrownIcon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export default function ProBadge({ className }: { className?: string }) {
  return (
    <span
      title="Premium member"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-400 [data-theme=light]&:border-amber-600/30 [data-theme=light]&:bg-amber-50 [data-theme=light]&:text-amber-600",
        className,
      )}>
      <CrownIcon size={10} />
      Pro
    </span>
  );
}
