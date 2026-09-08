"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 h-7 w-7 inline-flex items-center justify-center rounded-lg border transition-colors hover:opacity-75",
        ),
        button_next: cn(
          "absolute right-1 h-7 w-7 inline-flex items-center justify-center rounded-lg border transition-colors hover:opacity-75",
        ),
        weeks: "w-full border-collapse",
        weekdays: "flex",
        weekday: "rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
        week: "flex w-full mt-1",
        day: "relative flex-1 p-0 text-center text-sm",
        day_button: cn(
          "h-8 w-full inline-flex items-center justify-center rounded-lg text-sm font-normal",
          "hover:opacity-75 transition-colors",
          "focus:outline-none",
        ),
        selected:
          "[&>button]:bg-indigo-500 [&>button]:text-white [&>button]:hover:bg-indigo-600 [&>button]:rounded-lg",
        today: "[&>button]:opacity-60 [&>button]:font-semibold",
        outside: "[&>button]:opacity-50",
        disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed",
        range_middle: "[&>button]:aria-selected:opacity-40 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
