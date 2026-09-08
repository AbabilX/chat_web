"use client";

import { useEffect, useState } from "react";

export default function ConnectedTime({ since }: { since?: number }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!since) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1_000);
    return () => clearInterval(timer);
  }, [since]);
  if (!since) return null;
  return <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>;
}
