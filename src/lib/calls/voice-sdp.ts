export function sdpSendsVideo(sdp: string) {
  const videoSection = sdp
    .split(/(?=m=)/)
    .find((section) => section.startsWith("m=video "));
  if (!videoSection) return false;
  const direction = videoSection.match(/^a=(sendrecv|sendonly|recvonly|inactive)\r?$/m)?.[1];
  return !direction || direction === "sendrecv" || direction === "sendonly";
}
