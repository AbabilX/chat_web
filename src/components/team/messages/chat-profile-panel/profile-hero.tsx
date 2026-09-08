export default function ProfileHero({
  name,
  avatarUrl,
  initials,
  onOpenPhoto,
}: {
  name: string;
  avatarUrl?: string;
  initials: string;
  onOpenPhoto?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!onOpenPhoto}
      onClick={onOpenPhoto}
      className="relative block aspect-square w-full overflow-hidden bg-[var(--surface2)] disabled:cursor-default"
      aria-label={onOpenPhoto ? `View ${name}'s photo` : name}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-4xl font-semibold text-muted-foreground">
          {initials}
        </span>
      )}
    </button>
  );
}
