import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--indigo)] text-white shadow-[0_18px_45px_var(--indigo-glow)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30 [data-theme=light]&:bg-red-100/60 [data-theme=light]&:text-red-700 [data-theme=light]&:border-red-200",
        outline:
          "border transition-colors text-slate-200 hover:border-white/20 [data-theme=light]&:border-black/20 [data-theme=light]&:bg-white/50 [data-theme=light]&:text-slate-700 [data-theme=light]&:hover:bg-white/70",
        secondary:
          "bg-white/[0.05] text-slate-200 hover:bg-white/[0.08] [data-theme=light]&:bg-black/5 [data-theme=light]&:text-slate-700 [data-theme=light]&:hover:bg-black/8",
        ghost:
          "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 [data-theme=light]&:text-slate-600 [data-theme=light]&:hover:bg-black/5 [data-theme=light]&:hover:text-slate-900",
        link: "text-[var(--indigo)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-11 rounded-2xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
