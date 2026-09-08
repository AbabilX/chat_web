"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConnectionUserRow from "./connection-user-row";
import { useUserSearch } from "./use-connections";

/**
 * Find people by username, exact email or exact phone. Nothing in the results
 * echoes back the email or phone that matched.
 */
export default function ConnectionSearchTab({
  onMessage,
}: {
  onMessage: (userId: string) => void;
}) {
  const { query, setQuery, results, searching, searched, search } =
    useUserSearch();

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Username, email or +8801…"
          autoFocus
        />
        <Button type="submit" disabled={searching}>
          {searching ? "Searching…" : "Search"}
        </Button>
      </form>

      <div className="max-h-72 space-y-0.5 overflow-y-auto">
        {results.map((user) => (
          <ConnectionUserRow
            key={user.user_id}
            user={user}
            onMessage={onMessage}
          />
        ))}
        {searched && results.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No one found. Email and phone have to match exactly, and people can
            turn discovery off.
          </p>
        ) : null}
      </div>
    </div>
  );
}
