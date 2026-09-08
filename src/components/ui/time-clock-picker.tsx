"use client";

import { useState } from "react";
import { Clock01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Phase = "hour" | "minute";

function parseHHMM(value: string): { hour: number; minute: number } | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { hour: h, minute: m };
}

function toHHMM(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toMinutes(hhmm: string) {
  const p = parseHHMM(hhmm);
  return p ? p.hour * 60 + p.minute : 0;
}

function polar(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = (index / total) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function formatDisplay(hhmm: string) {
  const p = parseHHMM(hhmm);
  if (!p) return "Select time";
  const h12 = p.hour % 12 || 12;
  const suffix = p.hour >= 12 ? "PM" : "AM";
  return `${h12}:${String(p.minute).padStart(2, "0")} ${suffix}`;
}

export function TimeClockPicker({
  value,
  onChange,
  disabled = false,
  minTime,
  maxTime,
  placeholder = "Select time",
  className,
}: {
  value: string;
  onChange: (hhmm: string) => void;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("hour");

  const parsed = parseHHMM(value);
  const selectedHour = parsed?.hour ?? parseHHMM(minTime ?? "00:00")?.hour ?? 9;
  const selectedMinute = parsed?.minute ?? 0;

  const minMins = minTime ? toMinutes(minTime) : 0;
  const maxMins = maxTime ? toMinutes(maxTime) : 24 * 60 - 1;

  const minH = Math.floor(minMins / 60);
  const maxH = Math.floor(maxMins / 60);
  const hours = Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5).filter((m) => {
    const total = selectedHour * 60 + m;
    return total >= minMins && total <= maxMins;
  });

  function pickHour(hour: number) {
    const hourMinutes = Array.from({ length: 12 }, (_, i) => i * 5).filter((m) => {
      const total = hour * 60 + m;
      return total >= minMins && total <= maxMins;
    });
    const minute =
      parsed && parsed.hour === hour
        ? parsed.minute
        : hourMinutes.includes(selectedMinute)
          ? selectedMinute
          : (hourMinutes[0] ?? 0);
    onChange(toHHMM(hour, minute));
    setPhase("minute");
  }

  function pickMinute(minute: number) {
    onChange(toHHMM(selectedHour, minute));
    setOpen(false);
    setPhase("hour");
  }

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (!next) setPhase("hour");
      }}
      modal={false}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            disabled && "opacity-70",
            className,
          )}
        >
          <Clock01Icon size={16} className="mr-2 shrink-0" />
          {value ? formatDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        nested
        className="w-[280px] p-4"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="mb-3 text-center">
          <p className="text-xs text-muted-foreground">
            {phase === "hour" ? "Set hour" : "Set minute"}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--text)]">
            {value ? toHHMM(selectedHour, selectedMinute) : "--:--"}
          </p>
        </div>

        <svg viewBox="0 0 220 220" className="mx-auto block h-[220px] w-[220px]">
          <circle
            cx="110"
            cy="110"
            r="98"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <circle
            cx="110"
            cy="110"
            r="72"
            fill="none"
            stroke="color-mix(in srgb, var(--border) 60%, transparent)"
            strokeWidth="1"
          />

          {phase === "hour"
            ? hours.map((hour, i) => {
                const { x, y } = polar(110, 110, 78, i, hours.length);
                const active = selectedHour === hour;
                return (
                  <g key={hour}>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={
                        active
                          ? "color-mix(in srgb, var(--indigo) 25%, var(--surface))"
                          : "var(--surface2)"
                      }
                      stroke={active ? "var(--indigo)" : "var(--border)"}
                      strokeWidth="1"
                      className="cursor-pointer"
                      onClick={() => pickHour(hour)}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="pointer-events-none fill-[var(--text)] text-[11px] font-medium"
                    >
                      {hour}
                    </text>
                  </g>
                );
              })
            : minutes.map((minute, i) => {
                const { x, y } = polar(110, 110, 78, i, Math.max(minutes.length, 1));
                const active = selectedMinute === minute;
                return (
                  <g key={minute}>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={
                        active
                          ? "color-mix(in srgb, var(--indigo) 25%, var(--surface))"
                          : "var(--surface2)"
                      }
                      stroke={active ? "var(--indigo)" : "var(--border)"}
                      strokeWidth="1"
                      className="cursor-pointer"
                      onClick={() => pickMinute(minute)}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="pointer-events-none fill-[var(--text)] text-[11px] font-medium"
                    >
                      {String(minute).padStart(2, "0")}
                    </text>
                  </g>
                );
              })}

          <circle cx="110" cy="110" r="4" fill="var(--indigo)" />
        </svg>

        <div className="mt-2 flex gap-2">
          {phase === "minute" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setPhase("hour")}
            >
              Back to hour
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => {
              setOpen(false);
              setPhase("hour");
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
