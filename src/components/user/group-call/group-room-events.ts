import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";

type GroupRoomHandlers = {
  sync: () => void;
  onDisconnected: () => void;
  onLocalTrackUnpublished: (publication: { source?: Track.Source }) => void;
};

/** Every event that can change what the participant grid should show. */
const syncedEvents = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ActiveSpeakersChanged,
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
  RoomEvent.AudioPlaybackStatusChanged,
];

/**
 * Wires snapshot syncing and remote audio playback onto a connected room.
 * Returns the detach function.
 */
export function attachGroupRoom(room: Room, handlers: GroupRoomHandlers) {
  syncedEvents.forEach((event) => room.on(event, handlers.sync));

  const attachAudio = (track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    const element = track.attach();
    element.classList.add("lk-group-call-audio");
    document.body.appendChild(element);
  };
  const detachAudio = (track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    track.detach().forEach((element) => element.remove());
  };

  room.on(RoomEvent.TrackSubscribed, attachAudio);
  room.on(RoomEvent.TrackUnsubscribed, detachAudio);
  room.on(RoomEvent.Disconnected, handlers.onDisconnected);
  room.on(RoomEvent.LocalTrackUnpublished, handlers.onLocalTrackUnpublished);

  return () => {
    syncedEvents.forEach((event) => room.off(event, handlers.sync));
    room.off(RoomEvent.TrackSubscribed, attachAudio);
    room.off(RoomEvent.TrackUnsubscribed, detachAudio);
    room.off(RoomEvent.Disconnected, handlers.onDisconnected);
    room.off(RoomEvent.LocalTrackUnpublished, handlers.onLocalTrackUnpublished);
    document
      .querySelectorAll(".lk-group-call-audio")
      .forEach((element) => element.remove());
  };
}
