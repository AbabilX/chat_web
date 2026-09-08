import type { Room } from "livekit-client";
import { isMicrophoneUnavailableError } from "@/lib/calls/voice-media";

export async function enableGroupMicrophone(room: Room) {
  try {
    const publication = await room.localParticipant.setMicrophoneEnabled(true);
    return !!publication?.track;
  } catch (error) {
    if (!isMicrophoneUnavailableError(error)) throw error;
    return false;
  }
}
