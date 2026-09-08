"use client";

import { useEffect, useState } from "react";
import { Download01Icon, LinkSquare02Icon } from "hugeicons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { displayFileName } from "@/lib/display-file-name";
import { cn } from "@/lib/utils";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.body.appendChild(script);
  });
}

interface PdfJsPage {
  getViewport: (options: { scale: number }) => {
    height: number;
    width: number;
  };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: {
      height: number;
      width: number;
    };
  }) => {
    promise: Promise<void>;
  };
}

interface PdfJsDoc {
  getPage: (pageNum: number) => Promise<PdfJsPage>;
}

interface PdfJsLib {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (url: string) => {
    promise: Promise<PdfJsDoc>;
  };
}

export default function PdfPreview({
  fileName,
  fileUrl,
  hideFileName = false,
}: {
  fileName: string;
  fileUrl: string;
  /** Feed cards: show thumbnail only, no filename row. */
  hideFileName?: boolean;
}) {
  const displayName = displayFileName(fileName);
  const [prevUrl, setPrevUrl] = useState(fileUrl);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (fileUrl !== prevUrl) {
    setPrevUrl(fileUrl);
    setLoading(true);
    setPreviewImg(null);
  }

  useEffect(() => {
    let active = true;
    const pdfJsSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";

    loadScript(pdfJsSrc)
      .then(() => {
        if (!active) return;
        const pdfjsLib = (window as unknown as { pdfjsLib?: PdfJsLib }).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("pdfjsLib not available");
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        return loadingTask.promise;
      })
      .then((pdf) => {
        if (!active || !pdf) return;
        return pdf.getPage(1);
      })
      .then((page) => {
        if (!active || !page) return;

        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context failed");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        return page.render(renderContext).promise.then(() => {
          if (!active) return;
          const dataUrl = canvas.toDataURL("image/png");
          setPreviewImg(dataUrl);
        });
      })
      .catch((err: Error) => {
        console.warn("Could not generate PDF preview (CORS or format issue):", err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fileUrl]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "group/pdf flex w-full cursor-pointer select-none overflow-hidden text-left transition-all duration-300",
          hideFileName
            ? "max-h-[360px] border-0 hover:opacity-95"
            : "mt-2 max-w-sm rounded-xl border hover:scale-[1.01] hover:border-red-500/30 hover:shadow-md sm:max-w-md",
        )}
        style={{
          borderColor: hideFileName ? undefined : "var(--border)",
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
        <div className="flex w-full flex-col">
          {!hideFileName ? (
            <div
              className="flex items-center gap-3 border-b bg-black/10 p-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ec1c24] text-white shadow-sm select-none">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm4.5-3.5H17v1.5h1.5V13H17v2h-1.5V9H19v1zm-11 1.5H7v-1h1c.3 0 .5.2.5.5v.5zm5 2h-1v-2h1c.3 0 .5.2.5.5v1c0 .3-.2.5-.5.5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-semibold leading-tight text-[var(--text)] transition-colors group-hover/pdf:text-red-400">
                  {displayName}
                </h4>
                <p className="mt-0.5 text-[10px] font-semibold uppercase leading-none text-muted-foreground">
                  PDF
                </p>
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "relative flex w-full items-start justify-start overflow-hidden bg-white",
              hideFileName ? "h-[360px] max-h-[360px]" : "h-[260px] max-h-[260px] border-t border-white/[0.04]",
            )}
          >
            {loading ? (
              <div className="flex h-full w-full items-center justify-center bg-black/5 text-[11px] text-muted-foreground animate-pulse">
                Loading preview...
              </div>
            ) : previewImg ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewImg}
                alt={hideFileName ? "PDF preview" : displayName}
                className="h-full w-full object-cover object-left-top"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-start justify-center gap-2 bg-black/[0.04] p-4 text-left">
                <svg
                  className="h-10 w-10 text-muted-foreground/60 transition-all duration-300 group-hover/pdf:scale-105 group-hover/pdf:text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {!hideFileName ? (
                  <span className="text-[11px] font-medium text-muted-foreground/80">
                    Click to open PDF document
                  </span>
                ) : null}
              </div>
            )}
          </div>
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
                Inline PDF Preview Dialog for {displayName}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div
            className="relative min-h-0 flex-1 overflow-hidden border-b bg-black/20"
            style={{ borderColor: "var(--border)" }}
          >
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="h-full w-full border-0"
              title={displayName}
            />
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
              Download PDF
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
