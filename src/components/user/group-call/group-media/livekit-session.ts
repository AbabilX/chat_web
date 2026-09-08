import { Room, Track } from "livekit-client";
import type { GroupCallCredentials } from "@/lib/api";
import { enableGroupMicrophone } from "../group-call-microphone";
import { attachGroupRoom } from "../group-room-events";
import { groupRoomSnapshot } from "../group-room-snapshot";
import type { GroupMediaHandlers, GroupMediaSession } from "./group-media-session";

/** Connects the call to LiveKit and projects it onto [GroupMediaSession]. */
export async function connectLiveKitSession(
  credentials: GroupCallCredentials,
  handlers: GroupMediaHandlers,
): Promise<GroupMediaSession> {
  const room = new Room({ adaptiveStream: true, dynacast: true });
  let screenOwnerId: string | undefined;
  const emit = () => handlers.onSnapshot(groupRoomSnapshot(room, screenOwnerId));

  const detach = attachGroupRoom(room, {
    sync: emit,
    onDisconnected: () => handlers.onClosed("The group call disconnected."),
    onLocalTrackUnpublished: (publication) => {
      if (publication.source === Track.Source.ScreenShare) handlers.onScreenEnded();
    },
  });

  await room.connect(credentials.server_url, credentials.participant_token);
  await room.startAudio().catch(() => {});
  const microphoneAvailable = await enableGroupMicrophone(room);
  emit();

  return {
    microphoneAvailable,
    async setMuted(muted) {
      await room.localParticipant.setMicrophoneEnabled(!muted);
      emit();
    },
    async setScreenShareEnabled(active) {
      await room.localParticipant.setScreenShareEnabled(
        active,
        active ? { audio: false, contentHint: "detail" } : undefined,
      );
      emit();
    },
    async resumeAudio() {
      await room.startAudio();
      emit();
    },
    refreshSnapshot(owner) {
      screenOwnerId = owner;
      emit();
    },
    disconnect() {
      detach();
      void room.disconnect();
    },
  };
}
