import { cn } from "@/lib/utils";

export function CsvTable({
  rows,
  maxRows,
  maxCols,
  compact = false,
}: {
  rows: string[][];
  maxRows?: number;
  maxCols?: number;
  compact?: boolean;
}) {
  const shown = rows.slice(0, maxRows ?? rows.length);
  const colCount = Math.min(
    maxCols ?? Math.max(0, ...shown.map((r) => r.length)),
    Math.max(0, ...shown.map((r) => r.length)),
  );
  const header = shown[0] ?? [];
  const body = shown.slice(1);

  if (shown.length === 0) {
    return (
      <p className="p-3 text-xs text-muted-foreground">This CSV is empty.</p>
    );
  }

  return (
    <div className="min-w-0 overflow-auto">
      <table
        className={cn(
          "w-max min-w-full border-collapse text-left",
          compact ? "text-[10px] leading-tight" : "text-xs",
        )}
      >
        <thead>
          <tr>
            {Array.from({ length: colCount }, (_, i) => (
              <th
                key={i}
                className={cn(
                  "sticky top-0 border-b bg-[var(--surface2)] font-semibold text-[var(--text)]",
                  compact ? "px-1.5 py-1" : "px-2.5 py-1.5",
                )}
                style={{ borderColor: "var(--border)" }}
              >
                {header[i]?.trim() || `Column ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {Array.from({ length: colCount }, (_, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "max-w-[180px] truncate border-b text-[var(--text)]",
                    compact ? "px-1.5 py-0.5" : "px-2.5 py-1.5",
                  )}
                  style={{ borderColor: "var(--border)" }}
                  title={row[ci]}
                >
                  {row[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
