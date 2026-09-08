/** Small bounded tombstone set for late/replayed call events. */
export class FinishedCallMemory {
  private readonly ids = new Set<string>();

  remember(callId?: string) {
    if (!callId) return;
    this.ids.delete(callId);
    this.ids.add(callId);
    while (this.ids.size > 64) this.ids.delete(this.ids.values().next().value!);
  }

  has(callId: string) {
    return this.ids.has(callId);
  }
}
