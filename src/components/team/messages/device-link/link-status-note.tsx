const NOTES: Record<string, string> = {
  loading: "Preparing a code…",
  waiting: "Waiting for the other device…",
  linked: "Linked. Loading your messages…",
  denied: "That request was rejected on the other device.",
  expired: "This code has expired.",
};

/** One line of state under the QR, so the screen is never silently stuck. */
export default function LinkStatusNote({
  status,
  error,
}: {
  status: string;
  error: string;
}) {
  if (status === "error") {
    return (
      <p className="mt-4 text-center text-sm text-red-600">
        {error || "Could not link this device"}
      </p>
    );
  }
  const note = NOTES[status];
  if (!note) return null;
  return (
    <p className="mt-4 text-center text-sm text-[var(--text-muted)]">{note}</p>
  );
}
