import { ShieldAlert } from "lucide-react";

/**
 * States the cost plainly before anything is requested. AbabilX holds no copy
 * of anyone's message key, so old messages genuinely cannot be brought back —
 * not by us, not by support, not by anyone.
 */
export default function ResetWarning() {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
      <ShieldAlert className="mt-0.5 size-4 shrink-0" />
      Starting fresh cannot be undone. Every message you already have stays
      encrypted to a key nobody holds, so it becomes permanently unreadable. New
      messages work normally. If you still have a device where your messages
      open, link this one from there instead and keep everything.
    </p>
  );
}
