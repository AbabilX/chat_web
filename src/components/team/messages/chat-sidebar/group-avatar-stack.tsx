"use client";

import { UserGroupIcon } from "hugeicons-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { chatInitials } from "../chat-utils";
import { cn } from "@/lib/utils";

/**
 * The picture beside a group in a list or a header.
 *
 * A group that has chosen its own photo shows it, everywhere and without
 * exception. The stacked member avatars are the fallback for a group that has
 * not — not the other way round: a set photo losing to a montage of faces
 * reads as the photo having failed to save.
 *
 * - `stack` (default): 1 circle, 2–3 overlapping circles, 4-person grid.
 * - `row`: Slack-style horizontal overlapping row for headers.
 */
export default function GroupAvatarStack({
  avatars,
  avatarUrl,
  name,
  variant = "stack",
  count,
  compact = false,
}: {
  avatars?: string[];
  /** The group's own photo, which wins over the member montage. */
  avatarUrl?: string;
  name?: string;
  variant?: "stack" | "row";
  /** Total members — shown in AvatarGroupCount when provided. */
  count?: number;
  /** Smaller row variant for tight capsule headers. */
  compact?: boolean;
}) {
  const pics = (avatars ?? []).filter(Boolean);
  const own = avatarUrl?.trim();

  if (own) {
    const size =
      variant === "row" ? (compact ? "size-5" : "size-7") : "size-9";
    return (
      <Avatar className={cn(size, "shrink-0 rounded-lg")}>
        <AvatarImage src={own} alt="" className="rounded-lg object-cover" />
        <AvatarFallback className="rounded-lg text-[10px]">
          {chatInitials(name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (variant === "row") {
    const shown = pics.slice(0, compact ? 3 : 4);
    const avatarSize = compact ? "size-5" : "size-6";
    const avatarRound = compact ? "rounded-sm" : "rounded-md";
    const fbText = compact ? "text-[7px]" : "text-[9px]";

    if (shown.length === 0) {
      return (
        <div
          className={cn(
            "flex items-center justify-center rounded-full text-muted-foreground",
            compact ? "size-5" : "size-7",
          )}
          style={{ background: "var(--surface2)" }}
        >
          <UserGroupIcon size={compact ? 11 : 14} />
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center rounded-lg",
          compact
            ? "gap-1 px-0 py-0"
            : "gap-1.5 border border-[var(--border)] px-1.5 py-1",
        )}
        style={compact ? undefined : { background: "var(--surface)" }}
      >
        <AvatarGroup className={cn("-space-x-1.5 *:data-[slot=avatar]:ring-(--surface)", compact && "-space-x-1")}>
          {shown.map((src, i) => (
            <Avatar
              key={`${src}-${i}`}
              size="sm"
              className={cn(avatarSize, avatarRound)}
            >
              <AvatarImage src={src} alt="" className={avatarRound} />
              <AvatarFallback className={cn(avatarRound, fbText)}>
                {chatInitials(name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        {typeof count === "number" && count > 0 ? (
          <span className={cn("pr-0.5 font-medium tabular-nums text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
            {count}
          </span>
        ) : null}
      </div>
    );
  }

  const stackPics = pics.slice(0, 4);

  if (stackPics.length === 0) {
    return (
      <div
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        style={{ background: "var(--surface2)" }}
      >
        <UserGroupIcon size={18} />
      </div>
    );
  }

  if (stackPics.length === 1) {
    return (
      <Avatar className="size-9">
        <AvatarImage src={stackPics[0]} alt="" />
        <AvatarFallback className="text-[10px]">
          {chatInitials(name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (stackPics.length >= 4) {
    return (
      <div className="grid size-9 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-lg bg-[var(--surface2)]">
        {stackPics.slice(0, 4).map((src, i) => (
          <Avatar key={`${src}-${i}`} size="sm" className="size-full rounded-none">
            <AvatarImage src={src} alt="" className="rounded-none" />
            <AvatarFallback className="rounded-none text-[7px]">
              {chatInitials(name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  }

  if (stackPics.length === 3) {
    return (
      <div className="grid size-9 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-lg bg-[var(--surface2)]">
        <Avatar
          size="sm"
          className="col-span-2 size-full h-auto min-h-0 rounded-none"
        >
          <AvatarImage src={stackPics[0]} alt="" className="rounded-none object-cover" />
          <AvatarFallback className="rounded-none text-[7px]">
            {chatInitials(name)}
          </AvatarFallback>
        </Avatar>
        <Avatar size="sm" className="size-full min-h-0 rounded-none">
          <AvatarImage src={stackPics[1]} alt="" className="rounded-none" />
          <AvatarFallback className="rounded-none text-[7px]">
            {chatInitials(name)}
          </AvatarFallback>
        </Avatar>
        <Avatar size="sm" className="size-full min-h-0 rounded-none">
          <AvatarImage src={stackPics[2]} alt="" className="rounded-none" />
          <AvatarFallback className="rounded-none text-[7px]">
            {chatInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // 2: overlapping circles
  return (
    <div className="relative size-9">
      <Avatar className="absolute left-0 top-0 size-6 ring-2 ring-(--surface)">
        <AvatarImage src={stackPics[0]} alt="" />
        <AvatarFallback className="text-[8px]">
          {chatInitials(name)}
        </AvatarFallback>
      </Avatar>
      <Avatar className="absolute bottom-0 right-0 size-6 ring-2 ring-(--surface)">
        <AvatarImage src={stackPics[1]} alt="" />
        <AvatarFallback className="text-[8px]">
          {chatInitials(name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
