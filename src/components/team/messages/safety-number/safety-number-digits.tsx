"use client";

/**
 * The digits themselves, in a fixed grid of five-digit groups. Monospace and a
 * fixed column count matter more than they look: two people reading numbers to
 * each other need to be able to say "third row, second group".
 */
export default function SafetyNumberDigits({ digits }: { digits: string }) {
  const groups = digits.split(" ");
  return (
    <div
      className="grid grid-cols-3 gap-x-3 gap-y-1.5 rounded-lg px-3 py-3 font-mono text-sm tracking-wider text-[var(--text)] select-all"
      style={{ background: "var(--surface3)" }}>
      {groups.map((group, index) => (
        <span key={`${group}-${index}`} className="text-center">
          {group}
        </span>
      ))}
    </div>
  );
}
