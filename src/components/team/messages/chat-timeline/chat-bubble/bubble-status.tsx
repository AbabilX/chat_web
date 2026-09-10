"use client";

import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/lib/api";

/**
 * Signal's three states, on the sender's own bubble only: one tick when the
 * server has it, two when a recipient device has it, two filled once one has
 * read it.
 *
 * `delivery` is absent until the first acknowledgement, which is the same
 * thing as "sent" — so a missing summary renders a single tick rather than
 * nothing. A message still in flight has no row here at all, since it is not
 * in the feed until the server answers.
 */
export default function BubbleStatus({
  delivery,
}: {
  delivery?: ChatMessage["delivery"];
}) {
  const read = (delivery?.read_devices ?? 0) > 0;
  const delivered = (delivery?.delivered_devices ?? 0) > 0;
  const Icon = read || delivered ? CheckCheck : Check;
  const label = read ? "Read" : delivered ? "Delivered" : "Sent";
  return (
    <Icon
      aria-label={label}
      className="h-3.5 w-3.5 shrink-0"
      // Read is the one state worth a colour: the other two are progress, and
      // three shades of grey on a coloured bubble read as noise.
      style={{ opacity: read ? 1 : 0.75 }}
      strokeWidth={read ? 3 : 2}
    />
  );
}
