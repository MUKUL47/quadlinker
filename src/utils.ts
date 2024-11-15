import { Vector2 } from "./shapes/vector2";

export function hasRgbMatch(v: number[], b: number[]): boolean {
  if (v.length != b.length) return false;
  for (let i = 0; i < v.length; i++) {
    if (v[i] != b[i]) return false;
  }
  return true;
}
export function calculateDistance(v: Vector2, v1: Vector2): number {
  return Math.sqrt(
    Math.pow(Math.abs(v1.x - v.x), 2) + Math.pow(Math.abs(v1.y - v.y), 2)
  );
}
export function getNearestDistance(
  sources: Vector2[],
  destinations: Vector2[]
): [Vector2, Vector2] {
  if (sources.length === 0 || destinations.length === 0) {
    throw new Error("getNearestDistance : empty vec2 ");
  }
  let finalSource = sources[0];
  let finalDestination = destinations[0];
  let minDistance = calculateDistance(sources[0], destinations[0]);
  sources.forEach((source) => {
    destinations.forEach((destination) => {
      const distance = calculateDistance(source, destination);
      if (distance < minDistance) {
        minDistance = distance;
        finalSource = source;
        finalDestination = destination;
      }
    });
  });
  return [finalSource, finalDestination];
}
export function vecToRgb(a: number[]): string {
  return `rgb(${a.join(",")})`;
}
