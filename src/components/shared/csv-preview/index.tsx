"use client";

import { useEffect, useState } from "react";
import { Download01Icon, LinkSquare02Icon, TableIcon } from "hugeicons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { displayFileName } from "@/lib/display-file-name";
import { cn } from "@/lib/utils";
import { parseCsv } from "./parse-csv";
import { CsvTable } from "./csv-table";

const PREVIEW_ROWS = 8;
const PREVIEW_COLS = 6;
const DIALOG_ROWS = 200;
const MAX_BYTES = 512_000;

export default function CsvPreview({
  fileName,
  fileUrl,
}: {
  fileName: string;
  fileUrl: string;
}) {
  const displayName = displayFileName(fileName);
  const [prevUrl, setPrevUrl] = useState(fileUrl);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (fileUrl !== prevUrl) {
    setPrevUrl(fileUrl);
    setLoading(true);
    setError("");
    setRows([]);
  }

  useEffect(() => {
    const ac = new AbortController();

    fetch(fileUrl, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load CSV");
        const buf = await res.arrayBuffer();
        const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
        const text = new TextDecoder("utf-8").decode(slice);
        return parseCsv(text);
      })
      .then((parsed) => {
        setRows(parsed);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Could not preview CSV");
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [fileUrl]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "group/csv mt-2 w-full max-w-sm cursor-pointer select-none overflow-hidden rounded-xl border text-left transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/30 hover:shadow-md sm:max-w-md",
        )}
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setDialogOpen(true);
          }
        }}
      >
        <div
          className="flex items-center gap-3 border-b bg-black/10 p-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <TableIcon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-semibold leading-tight text-[var(--text)] transition-colors group-hover/csv:text-emerald-400">
              {displayName}
            </h4>
            <p className="mt-0.5 text-[10px] font-semibold uppercase leading-none text-muted-foreground">
              CSV
              {rows.length > 0 ? ` · ${rows.length} rows` : ""}
            </p>
          </div>
        </div>

        <div className="relative h-[180px] overflow-hidden bg-[var(--bg)]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground animate-pulse">
              Loading preview...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-muted-foreground">
              {error}. Click to open the file.
            </div>
          ) : (
            <div className="pointer-events-none p-1">
              <CsvTable
                rows={rows}
                maxRows={PREVIEW_ROWS}
                maxCols={PREVIEW_COLS}
                compact
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex h-[85vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0 sm:h-[90vh]">
          <DialogHeader
            className="flex shrink-0 flex-row items-center justify-between border-b px-3 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="min-w-0 flex-1 pr-8">
              <DialogTitle className="max-w-[70vw] truncate text-sm font-semibold text-[var(--text)]">
                {displayName}
              </DialogTitle>
              <DialogDescription className="sr-only">
                CSV preview for {displayName}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : error ? (
              <p className="p-4 text-sm text-muted-foreground">{error}</p>
            ) : (
              <CsvTable rows={rows} maxRows={DIALOG_ROWS} />
            )}
          </div>

          <div
            className="flex shrink-0 items-center justify-center gap-5 border-t px-3 py-2 text-xs"
            style={{ borderColor: "var(--border)" }}
          >
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              <LinkSquare02Icon size={14} className="shrink-0" />
              Open in new tab
            </a>
            <a
              href={fileUrl}
              download={displayName}
              className="inline-flex items-center gap-1.5 font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              <Download01Icon size={14} className="shrink-0" />
              Download CSV
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
