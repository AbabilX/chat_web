import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/lib/api";

export default function MessageDeliveryStatus({
  delivery,
}: {
  delivery?: ChatMessage["delivery"];
}) {
  const read = (delivery?.read_devices ?? 0) > 0;
  const delivered = (delivery?.delivered_devices ?? 0) > 0;
  const Icon = read || delivered ? CheckCheck : Check;
  const label = read ? "Read" : delivered ? "Delivered" : "Sent";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${
        read ? "text-[var(--indigo)]" : "text-muted-foreground"
      }`}
      title={label}
      aria-label={label}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
