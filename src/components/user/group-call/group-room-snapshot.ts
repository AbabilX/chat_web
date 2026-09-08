import {
  Room,
  Track,
  type LocalTrack,
  type Participant,
  type RemoteTrack,
} from "livekit-client";
import type {
  GroupMediaSnapshot,
  GroupScreenView,
} from "./group-call-context";
import { participantAvatarUrl } from "./group-participant-metadata";

/**
 * One MediaStream per underlying track. LiveKit usually hands one over; when it
 * does not, a fresh object on every snapshot would re-attach the video element
 * and flicker the screen share on unrelated changes.
 */
const streamCache = new WeakMap<MediaStreamTrack, MediaStream>();

function streamOf(track: LocalTrack | RemoteTrack): MediaStream {
  if (track.mediaStream) return track.mediaStream;
  const cached = streamCache.get(track.mediaStreamTrack);
  if (cached) return cached;
  const stream = new MediaStream([track.mediaStreamTrack]);
  streamCache.set(track.mediaStreamTrack, stream);
  return stream;
}

export function groupRoomSnapshot(room: Room, screenOwnerId?: string): GroupMediaSnapshot {
  const members: Participant[] = [
    room.localParticipant,
    ...room.remoteParticipants.values(),
  ];
  let screen: GroupScreenView | null = null;
  const participants = members.map((participant) => {
    const microphone = participant.getTrackPublication(Track.Source.Microphone);
    const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
    const preferredScreen = !screenOwnerId || participant.identity === screenOwnerId;
    if (!screen && preferredScreen && screenPublication?.track) {
      screen = {
        participantName: participant.name || participant.identity,
        isLocal: participant === room.localParticipant,
        stream: streamOf(screenPublication.track as LocalTrack | RemoteTrack),
      };
    }
    return {
      identity: participant.identity,
      name: participant.name || participant.identity,
      avatarUrl: participantAvatarUrl(participant.metadata),
      isLocal: participant === room.localParticipant,
      isSpeaking: participant.isSpeaking,
      isMuted: !microphone || microphone.isMuted,
    };
  });
  const localMicrophone = room.localParticipant.getTrackPublication(
    Track.Source.Microphone,
  );
  const localScreen = room.localParticipant.getTrackPublication(
    Track.Source.ScreenShare,
  );
  return {
    participants,
    screen,
    muted: !localMicrophone || localMicrophone.isMuted,
    sharingScreen: !!localScreen?.track,
    audioBlocked: !room.canPlaybackAudio,
  };
}
