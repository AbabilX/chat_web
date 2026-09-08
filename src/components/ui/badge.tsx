import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 [data-theme=light]&:border-indigo-500/50 [data-theme=light]&:bg-indigo-500/8 [data-theme=light]&:text-indigo-600",
        secondary:
          "border-white/10 bg-white/[0.05] text-slate-300 [data-theme=light]&:border-black/10 [data-theme=light]&:bg-black/5 [data-theme=light]&:text-slate-700",
        success:
          "border-green-500/30 bg-green-500/10 text-green-400 [data-theme=light]&:border-green-600/30 [data-theme=light]&:bg-green-50 [data-theme=light]&:text-green-700",
        warning:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 [data-theme=light]&:border-yellow-600/30 [data-theme=light]&:bg-yellow-50 [data-theme=light]&:text-yellow-700",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400 [data-theme=light]&:border-red-600/30 [data-theme=light]&:bg-red-50 [data-theme=light]&:text-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
