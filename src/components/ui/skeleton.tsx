import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl", className)}
      style={{
        backgroundColor: "var(--skeleton)",
      }}
      {...props}
    />
  );
}

export { Skeleton };
