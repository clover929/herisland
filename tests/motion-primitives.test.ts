import { expect, it } from "vitest";
import { pointerRatios, tiltAngles } from "../src/components/motion/pointer-math";

it("normalizes pointer coordinates and clamps values at card edges", () => {
  const rect = { left: 10, top: 20, width: 200, height: 100 };
  expect(pointerRatios(110, 70, rect)).toEqual({ x: 0.5, y: 0.5 });
  expect(pointerRatios(500, -10, rect)).toEqual({ x: 1, y: 0 });
});

it("keeps tilt centered at zero and bounded to ten degrees", () => {
  expect(tiltAngles({ x: 0.5, y: 0.5 })).toEqual({ rotateX: 0, rotateY: 0 });
  expect(tiltAngles({ x: 1, y: 0 })).toEqual({ rotateX: 10, rotateY: 10 });
  expect(tiltAngles({ x: 0, y: 1 })).toEqual({ rotateX: -10, rotateY: -10 });
});
