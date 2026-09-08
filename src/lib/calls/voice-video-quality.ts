/**
 * Send-side limits for the two video lanes of a 1:1 call.
 *
 * Left alone, a browser sends as much as the path appears to allow — routinely
 * 2 Mbps from a camera. A 1:1 call with no direct route runs every byte
 * through coturn, and a stream that size congested the relay: the pair went
 * `disconnected` and the call died. Audio never hit this at ~50 kbps, which is
 * why video calls dropped and voice calls did not.
 *
 * The camera is capped harder than the screen: a face survives a low bitrate,
 * shared text does not, so the screen keeps resolution and drops frames.
 */
export const CAMERA_MAX_BITRATE = 800_000;
export const SCREEN_MAX_BITRATE = 1_200_000;

/** Never fatal: an uncapped call is better than no call. */
export async function capVideoSendBitrate(
  sender: RTCRtpSender,
  maxBitrate: number,
  degradationPreference: RTCDegradationPreference,
) {
  try {
    const params = sender.getParameters();
    params.encodings = params.encodings?.length
      ? params.encodings.map((encoding) => ({ ...encoding, maxBitrate }))
      : [{ maxBitrate }];
    params.degradationPreference = degradationPreference;
    await sender.setParameters(params);
  } catch (error) {
    console.warn("[voice-call] could not cap video bitrate", error);
  }
}
