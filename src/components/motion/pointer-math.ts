export type PointerRatios = { x: number; y: number };
export type TiltAngles = { rotateX: number; rotateY: number };

export function pointerRatios(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
): PointerRatios {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 };
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
  };
}

export function tiltAngles({ x, y }: PointerRatios, maxDegrees = 10): TiltAngles {
  const limit = Math.max(0, Math.abs(maxDegrees));
  return {
    rotateX: (0.5 - y) * 2 * limit,
    rotateY: (x - 0.5) * 2 * limit,
  };
}
