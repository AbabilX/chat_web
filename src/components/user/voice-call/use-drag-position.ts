"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Point = { x: number; y: number };

const EDGE = 12;

function clampToViewport(point: Point, width: number, height: number): Point {
  const maxX = Math.max(EDGE, window.innerWidth - width - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - height - EDGE);
  return {
    x: Math.min(Math.max(EDGE, point.x), maxX),
    y: Math.min(Math.max(EDGE, point.y), maxY),
  };
}

/**
 * Google-Meet-style dragging for the floating call panel. Position stays null
 * until the first drag so the panel can rest on its CSS bottom-right anchor —
 * that keeps it SSR-safe with no window read during render.
 */
export function useDragPosition() {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const grabRef = useRef<Point | null>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const node = nodeRef.current;
      if (!node) return;
      setPosition((current) =>
        current ? clampToViewport(current, node.offsetWidth, node.offsetHeight) : current,
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const node = nodeRef.current;
    // Ignore secondary buttons and drags that start on a control.
    if (!node || event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const rect = node.getBoundingClientRect();
    grabRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setPosition(clampToViewport({ x: rect.left, y: rect.top }, rect.width, rect.height));
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const grab = grabRef.current;
    const node = nodeRef.current;
    if (!grab || !node) return;
    event.preventDefault();
    setPosition(
      clampToViewport(
        { x: event.clientX - grab.x, y: event.clientY - grab.y },
        node.offsetWidth,
        node.offsetHeight,
      ),
    );
  }, []);

  const endDrag = useCallback(() => {
    grabRef.current = null;
    setDragging(false);
  }, []);

  const style = position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 };
  return {
    nodeRef,
    dragging,
    style,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
