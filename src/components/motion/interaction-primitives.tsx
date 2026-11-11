"use client";

import { useCallback, useEffect, useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import { pointerRatios, tiltAngles } from "./pointer-math";

type CardProps = HTMLAttributes<HTMLDivElement>;

function usePointerSurface(tilt: boolean) {
  const elementRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const setElementRef = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const { x, y } = pointerRatios(event.clientX, event.clientY, rect);
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      element.style.setProperty("--mouse-x", `${x * 100}%`);
      element.style.setProperty("--mouse-y", `${y * 100}%`);
      if (tilt) {
        const angle = tiltAngles({ x, y });
        element.style.setProperty("--hi-rotate-x", `${angle.rotateX.toFixed(2)}deg`);
        element.style.setProperty("--hi-rotate-y", `${angle.rotateY.toFixed(2)}deg`);
      }
      frameRef.current = null;
    });
  }, [tilt]);

  const onPointerEnter = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elementRef.current?.style.setProperty("--spotlight-opacity", "1");
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const element = elementRef.current;
    if (!element) return;
    element.style.setProperty("--spotlight-opacity", "0");
    element.style.setProperty("--hi-rotate-x", "0deg");
    element.style.setProperty("--hi-rotate-y", "0deg");
  }, []);

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  return { setElementRef, onPointerMove, onPointerEnter, onPointerLeave };
}

function mergeClassNames(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function GlassCard(props: CardProps) {
  return <SpotlightCard {...props}/>;
}

export function SpotlightCard({ className, children, onPointerMove, onPointerEnter, onPointerLeave, ...props }: CardProps) {
  const { setElementRef, onPointerMove: moveSurface, onPointerEnter: enterSurface, onPointerLeave: leaveSurface } = usePointerSurface(false);
  return (
    <div
      {...props}
      ref={setElementRef}
      className={mergeClassNames("hi-glass-card", "hi-spotlight-card", className)}
      onPointerMove={(event) => { moveSurface(event); onPointerMove?.(event); }}
      onPointerEnter={(event) => { enterSurface(event); onPointerEnter?.(event); }}
      onPointerLeave={(event) => { leaveSurface(); onPointerLeave?.(event); }}
    >
      {children}
    </div>
  );
}

export function TiltCard({ className, children, onPointerMove, onPointerEnter, onPointerLeave, ...props }: CardProps) {
  const { setElementRef, onPointerMove: moveSurface, onPointerEnter: enterSurface, onPointerLeave: leaveSurface } = usePointerSurface(true);
  return (
    <div
      {...props}
      ref={setElementRef}
      className={mergeClassNames("hi-glass-card", "hi-spotlight-card", "hi-tilt-card", className)}
      onPointerMove={(event) => { moveSurface(event); onPointerMove?.(event); }}
      onPointerEnter={(event) => { enterSurface(event); onPointerEnter?.(event); }}
      onPointerLeave={(event) => { leaveSurface(); onPointerLeave?.(event); }}
    >
      {children}
    </div>
  );
}
