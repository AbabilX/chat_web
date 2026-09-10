import { describe, expect, test } from "bun:test";
import { VoiceMediaMap } from "./voice-media-map.ts";

const stream = (id) => ({ id });

describe("VoiceMediaMap", () => {
  test("routes by the ids the peer sent", () => {
    const map = new VoiceMediaMap();
    map.streams.set("cam", stream("cam"));
    map.streams.set("scr", stream("scr"));
    map.apply({ kind: "media", camera_stream: "cam", screen_stream: "scr" });
    expect(map.camera?.id).toBe("cam");
    expect(map.screen?.id).toBe("scr");
  });

  test("awaits a stream the peer named and has not sent yet", () => {
    const map = new VoiceMediaMap();
    map.streams.set("cam", stream("cam"));
    map.apply({ kind: "media", camera_stream: "", screen_stream: "scr" });
    expect(map.awaiting).toBe(true);
    map.streams.set("scr", stream("scr"));
    expect(map.awaiting).toBe(false);
  });

  test("a camera already held is not awaited again", () => {
    const map = new VoiceMediaMap();
    map.streams.set("cam", stream("cam"));
    map.apply({ kind: "media", camera_stream: "cam", screen_stream: "" });
    expect(map.awaiting).toBe(false);
  });

  test("nothing named, nothing awaited", () => {
    const map = new VoiceMediaMap();
    map.apply({ kind: "media", camera_stream: "", screen_stream: "" });
    expect(map.awaiting).toBe(false);
  });
});
