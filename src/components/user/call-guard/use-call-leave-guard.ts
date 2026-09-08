"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isReloadKey(event: KeyboardEvent) {
  if (event.key === "F5") return true;
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r";
}

export function useCallLeaveGuard(active: boolean, onLeave: () => Promise<void>) {
  const [open, setOpen] = useState(false);
  const [reloadAfter, setReloadAfter] = useState(false);
  const leavingRef = useRef(false);
  const onLeaveRef = useRef(onLeave);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (!active) return;

    leavingRef.current = false;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isReloadKey(event)) return;
      event.preventDefault();
      setReloadAfter(true);
      setOpen(true);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [active]);

  const requestLeave = useCallback(() => {
    setReloadAfter(false);
    setOpen(true);
  }, []);

  const stay = useCallback(() => {
    setOpen(false);
    setReloadAfter(false);
  }, []);

  const confirmLeave = useCallback(async () => {
    leavingRef.current = true;
    const shouldReload = reloadAfter;
    setOpen(false);
    await onLeaveRef.current();
    if (shouldReload) window.location.reload();
  }, [reloadAfter]);

  return { open: active && open, reloadAfter, requestLeave, stay, confirmLeave };
}
