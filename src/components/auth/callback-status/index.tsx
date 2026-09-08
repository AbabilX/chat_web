import { Zap } from "lucide-react";

export default function CallbackStatus({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4 px-4 text-center">
        <div
          className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl"
          style={{ background: "var(--indigo)" }}
        >
          <Zap size={22} className="text-white" />
        </div>
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        {children}
      </div>
    </div>
  );
}
