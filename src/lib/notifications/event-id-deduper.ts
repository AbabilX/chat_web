/** Bounded memory for at-least-once WebSocket notification delivery. */
export class EventIdDeduper {
  private readonly ids = new Set<string>();

  constructor(private readonly limit = 512) {}

  /** Returns true exactly once for each non-empty event ID. */
  remember(id: string): boolean {
    if (!id || this.ids.has(id)) return false;
    this.ids.add(id);
    while (this.ids.size > this.limit) {
      this.ids.delete(this.ids.values().next().value!);
    }
    return true;
  }
}
