export default function ConversationSearchSection({
  label,
}: {
  label: string;
}) {
  return (
    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold tracking-wide text-[var(--sig-label-2)]">
      {label}
    </p>
  );
}
